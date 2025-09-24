"use client";

import { useState, use } from "react";
import { Users, Phone, Mail, Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockCustomers } from "@/data/mock-agent-data";
import { CustomerStatus, Policy } from "@/types/agent-dashboard";

export default function ClientsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const [customers] = useState(mockCustomers);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("zh-TW");

  const getCustomerStatusBadge = (status: CustomerStatus) => {
    const statusConfig = {
      new: {
        label: locale === "en" ? "New Customer" : "新客戶",
        variant: "secondary" as const,
      },
      contacted: {
        label: locale === "en" ? "Contacted" : "已聯絡",
        variant: "default" as const,
      },
      meeting_scheduled: {
        label: locale === "en" ? "Meeting Scheduled" : "會議預定",
        variant: "default" as const,
      },
      proposal_sent: {
        label: locale === "en" ? "Proposal Sent" : "已送提案",
        variant: "default" as const,
      },
      closed: {
        label: locale === "en" ? "Closed" : "已成交",
        variant: "default" as const,
      },
      lost: {
        label: locale === "en" ? "Lost" : "已流失",
        variant: "destructive" as const,
      },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Helper function to get policies expiring within 3 months
  const getPoliciesExpiringWithinThreeMonths = (
    policies?: Policy[],
  ): Policy[] => {
    if (!policies) return [];

    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);

    return policies.filter((policy) => {
      const expirationDate = new Date(policy.expirationDate);
      return (
        policy.status === "active" &&
        expirationDate >= today &&
        expirationDate <= threeMonthsFromNow
      );
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-6 md:container md:py-8">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg md:text-2xl font-bold">
                {locale === "en" ? "Customer List" : "客戶清單"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {locale === "en"
                  ? "Manage your prospects and existing customers"
                  : "管理您的潛在客戶和現有客戶"}
              </p>
            </div>
            <Button size="sm" className="self-start sm:self-auto">
              <Plus className="h-4 w-4 mr-1" />
              {locale === "en" ? "Add Customer" : "新增客戶"}
            </Button>
          </div>

          <div className="space-y-3">
            {customers.map((customer) => {
              const expiringPolicies = getPoliciesExpiringWithinThreeMonths(
                customer.policies,
              );
              const hasExpiringPolicies = expiringPolicies.length > 0;

              return (
                <Card
                  key={customer.id}
                  className={`w-full overflow-hidden ${hasExpiringPolicies ? "border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20" : ""}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1 py-1">
                          <CardTitle className="truncate mb-2">
                            {customer.name}
                          </CardTitle>
                          <CardDescription className="leading-relaxed">
                            {customer.age}
                            {locale === "en" ? "yrs" : "歲"} •{" "}
                            {customer.location.city}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex flex-col gap-2 items-end">
                        {hasExpiringPolicies && (
                          <Badge
                            variant="destructive"
                            className="text-xs flex items-center gap-1"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            {expiringPolicies.length}
                            {locale === "en" ? " expiring" : " 即將到期"}
                          </Badge>
                        )}
                        {getCustomerStatusBadge(customer.status)}
                      </div>
                    </div>

                    {/* Display expiring policies */}
                    {hasExpiringPolicies && (
                      <div className="mt-3 p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-700">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                            {locale === "en"
                              ? `${expiringPolicies.length} policy${expiringPolicies.length > 1 ? "ies" : ""} expiring within 3 months`
                              : `${expiringPolicies.length} 份保單將於三個月內到期`}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {expiringPolicies.map((policy) => (
                            <div
                              key={policy.id}
                              className="text-xs text-orange-700 dark:text-orange-300 flex justify-between"
                            >
                              <span>{policy.productName}</span>
                              <span>{formatDate(policy.expirationDate)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent>
                    <div className="mb-3">
                      <div className="grid grid-cols-3 gap-3 mb-2">
                        <div className="flex items-center gap-2 text-sm col-span-2">
                          <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{customer.phone}</span>
                        </div>
                        <div className="text-xs text-muted-foreground text-right sm:text-left">
                          {locale === "en" ? "Last Contact" : "最後聯絡"}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground col-span-2">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                        <div className="text-sm font-medium text-right sm:text-left">
                          {formatDate(customer.lastContact)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {customer.interestedProducts
                        .slice(0, 2)
                        .map((product) => (
                          <Badge
                            key={product}
                            variant="outline"
                            className="text-xs"
                          >
                            {product}
                          </Badge>
                        ))}
                      {customer.interestedProducts.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{customer.interestedProducts.length - 2}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        <Phone className="h-3 w-3 mr-1" />
                        {locale === "en" ? "Call" : "電話"}
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs">
                        {locale === "en" ? "Edit" : "編輯"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
