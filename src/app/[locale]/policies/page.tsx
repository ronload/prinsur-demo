"use client";

import { useState, use } from "react";
import { useTranslations } from "next-intl";
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

export default function PoliciesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const t = useTranslations();
  const [policies] = useState(mockPolicies);
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
      active: { label: t("policies.active"), variant: "default" as const },
      expired: {
        label: t("policies.expired"),
        variant: "destructive" as const,
      },
      pending: { label: t("policies.pending"), variant: "secondary" as const },
      cancelled: { label: "已取消", variant: "outline" as const },
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
        <h1 className="text-3xl font-bold mb-4">
          {locale === "en" ? "My Policies" : "我的保單"}
        </h1>
        <p className="text-muted-foreground">
          管理您的所有保險資產，追蹤繳費狀態和理賠進度
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">生效保單</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {policies.filter((p) => p.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              總保單數: {policies.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">月繳保費</CardTitle>
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
            <p className="text-xs text-muted-foreground">每月總繳費</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總保障額</CardTitle>
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
            <p className="text-xs text-muted-foreground">總保障金額</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待處理提醒</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {activeReminders.length}
            </div>
            <p className="text-xs text-muted-foreground">需要關注的事項</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="policies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="policies">我的保單</TabsTrigger>
          <TabsTrigger value="reminders">
            提醒通知
            {activeReminders.length > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {activeReminders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="claims">理賠記錄</TabsTrigger>
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
                        保單號碼: {policy.policyNumber} • {policy.company}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {t(`insurance.types.${policy.type}`)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Premium Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <DollarSign className="h-4 w-4" />
                        保費資訊
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(policy.premium.amount)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {(() => {
                          if (policy.premium.frequency === "monthly")
                            return "每月";
                          if (policy.premium.frequency === "yearly")
                            return "每年";
                          return "每季";
                        })()}
                        繳費
                      </div>
                      <div className="text-sm">
                        下次繳費: {formatDate(policy.premium.nextDueDate)}
                      </div>
                    </div>

                    {/* Coverage Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Shield className="h-4 w-4" />
                        保障資訊
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(policy.coverage.amount)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        保障金額
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
                          業務專員
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
                      查看詳情
                    </Button>
                    <Button variant="outline" size="sm">
                      繳費記錄
                    </Button>
                    <Button variant="outline" size="sm">
                      申請理賠
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
                !reminder.isRead ? "border-orange-200 bg-orange-50/50" : ""
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
                      if (reminder.type === "premium_due") return "繳費提醒";
                      if (reminder.type === "expiry_warning") return "到期提醒";
                      if (reminder.type === "rate_change") return "費率變更";
                      return "其他";
                    })()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{reminder.message}</p>
                {!reminder.isRead && (
                  <div className="flex gap-2 mt-4">
                    <Button size="sm">立即處理</Button>
                    <Button variant="outline" size="sm">
                      標記已讀
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
                      理賠申請 - {claim.type}
                      {getClaimStatusIcon(claim.status)}
                    </CardTitle>
                    <CardDescription>
                      申請編號: {claim.claimNumber} •{" "}
                      {formatDate(claim.submitDate)}
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
                        if (claim.status === "approved") return "已核准";
                        if (claim.status === "processing") return "審核中";
                        if (claim.status === "rejected") return "已拒絕";
                        return "待審核";
                      })()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{claim.description}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    查看詳情
                  </Button>
                  <Button variant="outline" size="sm">
                    上傳文件
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
