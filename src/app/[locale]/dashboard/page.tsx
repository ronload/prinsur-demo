"use client";

import { useState, use } from "react";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Award,
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
import { CustomerStatus, AppointmentStatus } from "@/types/agent-dashboard";

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
      new: { label: "新客戶", variant: "secondary" as const },
      contacted: { label: "已聯絡", variant: "default" as const },
      meeting_scheduled: { label: "會議預定", variant: "default" as const },
      proposal_sent: { label: "已送提案", variant: "default" as const },
      closed: { label: "已成交", variant: "default" as const },
      lost: { label: "已流失", variant: "destructive" as const },
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
        return "初次諮詢";
      case "product_presentation":
        return "商品說明";
      case "contract_signing":
        return "合約簽署";
      default:
        return "服務拜訪";
    }
  };

  const getAppointmentStatusText = (status: AppointmentStatus) => {
    switch (status) {
      case "confirmed":
        return "已確認";
      case "scheduled":
        return "已排程";
      case "completed":
        return "已完成";
      default:
        return "其他";
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
      return "已核准";
    }
    if (status === "pending") {
      return "審核中";
    }
    return "已取消";
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

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          {locale === "en" ? "Agent Dashboard" : "業務員工作台"}
        </h1>
        <p className="text-muted-foreground">管理您的客戶、預約和業績表現</p>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總客戶數</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performance.totalCustomers}
            </div>
            <p className="text-xs text-muted-foreground">
              活躍客戶: {performance.activeCustomers}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本月業績</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(performance.revenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              目標達成率: {performance.monthlyAchievement}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">成交率</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performance.conversionRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              成交件數: {performance.closedDeals}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均件均</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(performance.averageDealSize)}
            </div>
            <p className="text-xs text-muted-foreground">
              月目標: {formatCurrency(performance.monthlyTarget)}
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
              今日預約 ({todayAppointments.length})
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
                      查看詳情
                    </Button>
                    <Button size="sm">聯絡客戶</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="customers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="customers">客戶管理</TabsTrigger>
          <TabsTrigger value="appointments">預約管理</TabsTrigger>
          <TabsTrigger value="deals">成交記錄</TabsTrigger>
          <TabsTrigger value="performance">業績分析</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">客戶清單</h2>
              <p className="text-muted-foreground">
                管理您的潛在客戶和現有客戶
              </p>
            </div>
            <Button>新增客戶</Button>
          </div>

          <div className="grid gap-4">
            {customers.map((customer) => (
              <Card key={customer.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {customer.name}
                        {getCustomerStatusBadge(customer.status)}
                      </CardTitle>
                      <CardDescription>
                        {customer.age}歲 • {customer.location.city}{" "}
                        {customer.location.district}
                      </CardDescription>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      最後聯絡: {formatDate(customer.lastContact)}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4" />
                        {customer.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {customer.location.city} {customer.location.district}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">興趣商品</div>
                      <div className="flex flex-wrap gap-1">
                        {customer.interestedProducts.map((product) => (
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
                  </div>

                  {customer.notes && (
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                      <div className="text-sm font-medium mb-1">備註</div>
                      <div className="text-sm text-muted-foreground">
                        {customer.notes}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-2" />
                      撥打電話
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      安排會面
                    </Button>
                    <Button variant="outline" size="sm">
                      編輯資料
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">預約管理</h2>
              <p className="text-muted-foreground">管理與客戶的會面安排</p>
            </div>
            <Button>新增預約</Button>
          </div>

          <div className="grid gap-4">
            {upcomingAppointments.map((appointment) => (
              <Card key={appointment.id}>
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
                      variant={getAppointmentStatusVariant(appointment.status)}
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
                        <div className="text-sm font-medium mb-2">討論商品</div>
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
                      <div className="text-sm font-medium mb-1">備註</div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.notes}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      重新排程
                    </Button>
                    <Button variant="outline" size="sm">
                      聯絡客戶
                    </Button>
                    <Button variant="outline" size="sm">
                      查看客戶資料
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="deals" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">成交記錄</h2>
            <p className="text-muted-foreground">查看您的成交紀錄和佣金收入</p>
          </div>

          <div className="grid gap-4">
            {deals.map((deal) => (
              <Card key={deal.id}>
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
                        保費
                      </div>
                      <div className="text-lg font-bold">
                        {formatCurrency(deal.premium)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        佣金
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(deal.commission)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        簽約日期
                      </div>
                      <div>{formatDate(deal.signedDate)}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        生效日期
                      </div>
                      <div>{formatDate(deal.effectiveDate)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">業績分析</h2>
            <p className="text-muted-foreground">
              追蹤您的業績表現和目標達成狀況
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  月度目標進度
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>業績目標</span>
                    <span className="font-bold">
                      {formatCurrency(performance.monthlyTarget)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>目前達成</span>
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
                    達成率: {performance.monthlyAchievement}%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  關鍵指標
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>成交率</span>
                    <span className="font-bold">
                      {performance.conversionRate}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>平均件均</span>
                    <span className="font-bold">
                      {formatCurrency(performance.averageDealSize)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>活躍客戶數</span>
                    <span className="font-bold">
                      {performance.activeCustomers}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>本月成交件數</span>
                    <span className="font-bold">{performance.closedDeals}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
