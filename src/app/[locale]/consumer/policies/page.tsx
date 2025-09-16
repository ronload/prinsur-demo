"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  FileText,
  DollarSign,
  Shield,
  Bell,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockPolicies, mockReminders, mockClaims } from "@/data/mock-policies";
import { PolicyStatus } from "@/types/policy";

interface PoliciesPageProps {
  params: Promise<{ locale: string }>;
}

export default function PoliciesPage({ params }: PoliciesPageProps) {
  const pathname = usePathname();
  const localeFromPath = pathname.split("/")[1] || "zh-TW";
  const [locale, setLocale] = useState<string>(localeFromPath);
  const [policies] = useState(mockPolicies);

  useEffect(() => {
    params.then(({ locale: paramLocale }) => {
      setLocale(paramLocale);
    });
  }, [params]);
  const [reminders] = useState(mockReminders);
  const [claims] = useState(mockClaims);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("zh-TW", {
      style: "currency",
      currency: "TWD",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("zh-TW");

  const getStatusBadge = (status: PolicyStatus) => {
    const statusConfig = {
      active: {
        label: locale === "en" ? "Active" : "生效",
        variant: "default" as const,
      },
      expired: {
        label: locale === "en" ? "Expired" : "已到期",
        variant: "destructive" as const,
      },
      pending: {
        label: locale === "en" ? "Pending" : "待生效",
        variant: "secondary" as const,
      },
      cancelled: {
        label: locale === "en" ? "Cancelled" : "已取消",
        variant: "outline" as const,
      },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getClaimStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "rejected":
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const activeReminders = reminders.filter((r) => !r.isRead);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          {locale === "en" ? "My Policies" : "我的保單"}
        </h1>
        <p className="text-muted-foreground">
          {locale === "en"
            ? "Manage all your insurance assets, track payment status and claim progress"
            : "管理您的所有保險資產，追蹤繳費狀態和理賠進度"}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {locale === "en" ? "Active Policies" : "生效保單"}
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {policies.filter((p) => p.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {locale === "en" ? "Total Policies" : "總保單數"}:{" "}
              {policies.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {locale === "en" ? "Monthly Premium" : "月繳保費"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                policies
                  .filter(
                    (p) =>
                      p.status === "active" &&
                      p.premium.frequency === "monthly",
                  )
                  .reduce((sum, p) => sum + p.premium.amount, 0),
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {locale === "en" ? "Total Monthly Payment" : "每月總繳費"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {locale === "en" ? "Total Coverage" : "總保障額"}
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                policies
                  .filter((p) => p.status === "active")
                  .reduce((sum, p) => sum + p.coverage.amount, 0),
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {locale === "en" ? "Total Coverage Amount" : "總保障金額"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {locale === "en" ? "Pending Reminders" : "待處理提醒"}
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {activeReminders.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {locale === "en" ? "Items requiring attention" : "需要關注的事項"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="policies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="policies">
            {locale === "en" ? "My Policies" : "我的保單"}
          </TabsTrigger>
          <TabsTrigger value="reminders">
            {locale === "en" ? "Reminders" : "提醒通知"}
            {activeReminders.length > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {activeReminders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="claims">
            {locale === "en" ? "Claims" : "理賠記錄"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-6">
          <div className="grid gap-6">
            {policies.map((policy) => (
              <Card key={policy.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {policy.name}
                        {getStatusBadge(policy.status)}
                      </CardTitle>
                      <CardDescription>
                        {locale === "en" ? "Policy Number" : "保單號碼"}:{" "}
                        {policy.policyNumber} • {policy.company}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {locale === "en"
                        ? {
                            life: "Life Insurance",
                            health: "Health Insurance",
                            accident: "Accident Insurance",
                            travel: "Travel Insurance",
                            vehicle: "Vehicle Insurance",
                            property: "Property Insurance",
                          }[policy.type]
                        : {
                            life: "壽險",
                            health: "醫療險",
                            accident: "意外險",
                            travel: "旅遊險",
                            vehicle: "車險",
                            property: "財產險",
                          }[policy.type]}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Premium Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <DollarSign className="h-4 w-4" />
                        {locale === "en" ? "Premium Info" : "保費資訊"}
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(policy.premium.amount)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {(() => {
                          if (policy.premium.frequency === "monthly")
                            return locale === "en" ? "Monthly" : "每月";
                          if (policy.premium.frequency === "yearly")
                            return locale === "en" ? "Annual" : "每年";
                          return locale === "en" ? "Quarterly" : "每季";
                        })()}
                        {locale === "en" ? " Payment" : "繳費"}
                      </div>
                      <div className="text-sm">
                        {locale === "en" ? "Next Payment" : "下次繳費"}:{" "}
                        {formatDate(policy.premium.nextDueDate)}
                      </div>
                    </div>

                    {/* Coverage Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Shield className="h-4 w-4" />
                        {locale === "en" ? "Coverage Info" : "保障資訊"}
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(policy.coverage.amount)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {locale === "en" ? "Coverage Amount" : "保障金額"}
                      </div>
                      <div className="text-sm">
                        {formatDate(policy.coverage.startDate)} -{" "}
                        {formatDate(policy.coverage.endDate)}
                      </div>
                    </div>

                    {/* Agent Info */}
                    {policy.agent && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <FileText className="h-4 w-4" />
                          {locale === "en" ? "Agent" : "業務專員"}
                        </div>
                        <div className="font-semibold">{policy.agent.name}</div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {policy.agent.phone}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {policy.agent.email}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-6">
                    <Button variant="outline" size="sm">
                      {locale === "en" ? "View Details" : "查看詳情"}
                    </Button>
                    <Button variant="outline" size="sm">
                      {locale === "en" ? "Payment History" : "繳費記錄"}
                    </Button>
                    <Button variant="outline" size="sm">
                      {locale === "en" ? "File Claim" : "申請理賠"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4">
          {reminders.map((reminder) => (
            <Card
              key={reminder.id}
              className={
                !reminder.isRead
                  ? "border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20"
                  : ""
              }
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle
                      className={`h-5 w-5 ${!reminder.isRead ? "text-orange-500" : "text-muted-foreground"}`}
                    />
                    <div>
                      <CardTitle className="text-base">
                        {reminder.title}
                      </CardTitle>
                      <CardDescription>
                        {formatDate(reminder.dueDate)}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant={
                      reminder.type === "premium_due"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {(() => {
                      if (reminder.type === "premium_due")
                        return locale === "en" ? "Payment Due" : "繳費提醒";
                      if (reminder.type === "expiry_warning")
                        return locale === "en" ? "Expiry Warning" : "到期提醒";
                      if (reminder.type === "rate_change")
                        return locale === "en" ? "Rate Change" : "費率變更";
                      return locale === "en" ? "Other" : "其他";
                    })()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{reminder.message}</p>
                {!reminder.isRead && (
                  <div className="flex gap-2 mt-4">
                    <Button size="sm">
                      {locale === "en" ? "Handle Now" : "立即處理"}
                    </Button>
                    <Button variant="outline" size="sm">
                      {locale === "en" ? "Mark as Read" : "標記已讀"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="claims" className="space-y-4">
          {claims.map((claim) => (
            <Card key={claim.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {locale === "en" ? "Claim Application" : "理賠申請"} -{" "}
                      {claim.type}
                      {getClaimStatusIcon(claim.status)}
                    </CardTitle>
                    <CardDescription>
                      {locale === "en" ? "Application Number" : "申請編號"}:{" "}
                      {claim.claimNumber} • {formatDate(claim.submitDate)}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(claim.amount)}
                    </div>
                    <Badge
                      variant={(() => {
                        if (claim.status === "approved") return "default";
                        if (claim.status === "processing") return "secondary";
                        if (claim.status === "rejected") return "destructive";
                        return "outline";
                      })()}
                    >
                      {(() => {
                        if (claim.status === "approved")
                          return locale === "en" ? "Approved" : "已核准";
                        if (claim.status === "processing")
                          return locale === "en" ? "Processing" : "審核中";
                        if (claim.status === "rejected")
                          return locale === "en" ? "Rejected" : "已拒絕";
                        return locale === "en" ? "Pending Review" : "待審核";
                      })()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{claim.description}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    {locale === "en" ? "View Details" : "查看詳情"}
                  </Button>
                  <Button variant="outline" size="sm">
                    {locale === "en" ? "Upload Documents" : "上傳文件"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
