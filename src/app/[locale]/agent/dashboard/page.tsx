"use client";

import { useState, use } from "react";
import { AgentGuard } from "@/components/auth/role-guard";
import {
  Users,
  Calendar,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Plus,
  AlertTriangle,
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
import {
  mockCustomers,
  mockAppointments,
  mockPerformance,
  mockDeals,
} from "@/data/mock-agent-data";
import {
  CustomerStatus,
  AppointmentStatus,
  Policy,
} from "@/types/agent-dashboard";

export default function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const [customers] = useState(mockCustomers);
  const [appointments] = useState(mockAppointments);
  const [performance] = useState(mockPerformance);
  const [deals] = useState(mockDeals);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("zh-TW", {
      style: "currency",
      currency: "TWD",
      minimumFractionDigits: 0,
    }).format(amount);

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

  const getAppointmentStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "confirmed":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "scheduled":
        return <Calendar className="h-4 w-4 text-orange-500" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAppointmentTypeText = (type: string) => {
    switch (type) {
      case "initial_consultation":
        return locale === "en" ? "Initial Consultation" : "初次諮詢";
      case "product_presentation":
        return locale === "en" ? "Product Presentation" : "商品說明";
      case "contract_signing":
        return locale === "en" ? "Contract Signing" : "合約簽署";
      default:
        return locale === "en" ? "Service Visit" : "服務拜訪";
    }
  };

  const getAppointmentStatusText = (status: AppointmentStatus) => {
    switch (status) {
      case "confirmed":
        return locale === "en" ? "Confirmed" : "已確認";
      case "scheduled":
        return locale === "en" ? "Scheduled" : "已排程";
      case "completed":
        return locale === "en" ? "Completed" : "已完成";
      default:
        return locale === "en" ? "Other" : "其他";
    }
  };

  const getAppointmentStatusVariant = (status: AppointmentStatus) => {
    if (status === "confirmed") {
      return "default";
    }
    if (status === "scheduled") {
      return "secondary";
    }
    return "outline";
  };

  const getDealStatusText = (status: string) => {
    if (status === "approved") {
      return locale === "en" ? "Approved" : "已核准";
    }
    if (status === "pending") {
      return locale === "en" ? "Pending" : "審核中";
    }
    return locale === "en" ? "Cancelled" : "已取消";
  };

  const getDealStatusVariant = (status: string) => {
    if (status === "approved") {
      return "default";
    }
    if (status === "pending") {
      return "secondary";
    }
    return "destructive";
  };

  const todayAppointments = appointments.filter((apt) => {
    const today = new Date().toISOString().split("T")[0];
    return apt.date === today;
  });

  const upcomingAppointments = appointments.filter((apt) => {
    const today = new Date();
    const aptDate = new Date(apt.date);
    return aptDate > today;
  });

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
    <AgentGuard>
      <div className="min-h-screen bg-background">
        <div className="px-4 py-6 md:container md:py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {locale === "en" ? "Agent Dashboard" : "業務員工作台"}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              {locale === "en"
                ? "Manage your customers, appointments and performance"
                : "管理您的客戶、預約和業績表現"}
            </p>
          </div>

          {/* Performance Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                  {locale === "en" ? "Customers" : "客戶"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl md:text-2xl font-bold">
                  {performance.totalCustomers}
                </div>
                <p className="text-xs text-muted-foreground">
                  {locale === "en" ? "Active" : "活躍"}:{" "}
                  {performance.activeCustomers}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                  {locale === "en" ? "Revenue" : "業績"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg md:text-2xl font-bold truncate">
                  {formatCurrency(performance.revenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {performance.monthlyAchievement}%{" "}
                  {locale === "en" ? "target" : "目標"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                  {locale === "en" ? "Conversion" : "成交率"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl md:text-2xl font-bold">
                  {performance.conversionRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {performance.closedDeals} {locale === "en" ? "deals" : "件"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                  {locale === "en" ? "Avg Deal" : "平均件均"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg md:text-2xl font-bold truncate">
                  {formatCurrency(performance.averageDealSize)}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {locale === "en" ? "Target" : "目標"}{" "}
                  {formatCurrency(performance.monthlyTarget)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Today's Appointments */}
          {todayAppointments.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {locale === "en" ? "Today's Appointments" : "今日預約"} (
                  {todayAppointments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getAppointmentStatusIcon(appointment.status)}
                        <div>
                          <div className="font-semibold">
                            {appointment.customerName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {appointment.time} • {appointment.location}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          {locale === "en" ? "View Details" : "查看詳情"}
                        </Button>
                        <Button size="sm">
                          {locale === "en" ? "Contact Customer" : "聯絡客戶"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="customers" className="space-y-4 md:space-y-6">
            <div className="overflow-x-auto">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="customers"
                  className="text-xs md:text-sm px-2 md:px-4 flex items-center gap-1 md:gap-2"
                >
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">
                    {locale === "en" ? "Customers" : "客戶"}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="appointments"
                  className="text-xs md:text-sm px-2 md:px-4 flex items-center gap-1 md:gap-2"
                >
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">
                    {locale === "en" ? "Appointments" : "預約"}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="deals"
                  className="text-xs md:text-sm px-2 md:px-4 flex items-center gap-1 md:gap-2"
                >
                  <TrendingUp className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">
                    {locale === "en" ? "Deals" : "成交"}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="performance"
                  className="text-xs md:text-sm px-2 md:px-4 flex items-center gap-1 md:gap-2"
                >
                  <Target className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">
                    {locale === "en" ? "Performance" : "統計"}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="customers" className="space-y-4">
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
                                  <span>
                                    {formatDate(policy.expirationDate)}
                                  </span>
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

                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            <Phone className="h-3 w-3 mr-1" />
                            {locale === "en" ? "Call" : "電話"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            {locale === "en" ? "Meet" : "會面"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            {locale === "en" ? "Edit" : "編輯"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent
              value="appointments"
              className="space-y-4 md:space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg md:text-2xl font-bold">
                    {locale === "en" ? "Appointment Management" : "預約管理"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {locale === "en"
                      ? "Manage meetings and appointments with customers"
                      : "管理與客戶的會面安排"}
                  </p>
                </div>
                <Button size="sm" className="self-start sm:self-auto">
                  {locale === "en" ? "Add Appointment" : "新增預約"}
                </Button>
              </div>

              <div className="grid gap-4">
                {upcomingAppointments.map((appointment) => (
                  <Card key={appointment.id} className="w-full overflow-hidden">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getAppointmentStatusIcon(appointment.status)}
                          <div>
                            <CardTitle>{appointment.customerName}</CardTitle>
                            <CardDescription>
                              {getAppointmentTypeText(appointment.type)}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant={getAppointmentStatusVariant(
                            appointment.status,
                          )}
                        >
                          {getAppointmentStatusText(appointment.status)}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4" />
                            {formatDate(appointment.date)} {appointment.time}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {appointment.location}
                          </div>
                        </div>

                        {appointment.productDiscussion && (
                          <div>
                            <div className="text-sm font-medium mb-2">
                              {locale === "en"
                                ? "Products to Discuss"
                                : "討論商品"}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {appointment.productDiscussion.map((product) => (
                                <Badge
                                  key={product}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {product}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {appointment.notes && (
                        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                          <div className="text-sm font-medium mb-1">
                            {locale === "en" ? "Notes" : "備註"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {appointment.notes}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm" className="text-xs">
                          {locale === "en" ? "Reschedule" : "重新排程"}
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          {locale === "en" ? "Contact" : "聯絡"}
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          {locale === "en" ? "Profile" : "資料"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="deals" className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-lg md:text-2xl font-bold mb-2">
                  {locale === "en" ? "Deal Records" : "成交記錄"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {locale === "en"
                    ? "View your closed deals and commission income"
                    : "查看您的成交紀錄和佣金收入"}
                </p>
              </div>

              <div className="grid gap-4">
                {deals.map((deal) => (
                  <Card key={deal.id} className="w-full overflow-hidden">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{deal.customerName}</CardTitle>
                          <CardDescription>{deal.productName}</CardDescription>
                        </div>
                        <Badge variant={getDealStatusVariant(deal.status)}>
                          {getDealStatusText(deal.status)}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            {locale === "en" ? "Premium" : "保費"}
                          </div>
                          <div className="text-lg font-bold">
                            {formatCurrency(deal.premium)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            {locale === "en" ? "Commission" : "佣金"}
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(deal.commission)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            {locale === "en" ? "Signed Date" : "簽約日期"}
                          </div>
                          <div>{formatDate(deal.signedDate)}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            {locale === "en" ? "Effective Date" : "生效日期"}
                          </div>
                          <div>{formatDate(deal.effectiveDate)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4 md:space-y-6">
              <div>
                <h2 className="text-lg md:text-2xl font-bold mb-2">
                  {locale === "en" ? "Performance Analysis" : "業績分析"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {locale === "en"
                    ? "Track your performance and goal achievement status"
                    : "追蹤您的業績表現和目標達成狀況"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Card className="w-full overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      {locale === "en"
                        ? "Monthly Target Progress"
                        : "月度目標進度"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>
                          {locale === "en" ? "Performance Target" : "業績目標"}
                        </span>
                        <span className="font-bold">
                          {formatCurrency(performance.monthlyTarget)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>
                          {locale === "en" ? "Current Achievement" : "目前達成"}
                        </span>
                        <span className="font-bold text-primary">
                          {formatCurrency(performance.revenue)}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${Math.min(performance.monthlyAchievement, 100)}%`,
                          }}
                        />
                      </div>
                      <div className="text-center text-sm text-muted-foreground">
                        {locale === "en" ? "Achievement Rate" : "達成率"}:{" "}
                        {performance.monthlyAchievement}%
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="w-full overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      {locale === "en" ? "Key Metrics" : "關鍵指標"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>
                          {locale === "en" ? "Conversion Rate" : "成交率"}
                        </span>
                        <span className="font-bold">
                          {performance.conversionRate}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>
                          {locale === "en" ? "Avg Deal Size" : "平均件均"}
                        </span>
                        <span className="font-bold">
                          {formatCurrency(performance.averageDealSize)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>
                          {locale === "en" ? "Active Customers" : "活躍客戶數"}
                        </span>
                        <span className="font-bold">
                          {performance.activeCustomers}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>
                          {locale === "en"
                            ? "Monthly Closed Deals"
                            : "本月成交件數"}
                        </span>
                        <span className="font-bold">
                          {performance.closedDeals}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AgentGuard>
  );
}
