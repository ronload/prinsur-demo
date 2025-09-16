"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  Users,
  FileText,
  BarChart3,
  Target,
  Award,
} from "lucide-react";

export default function AgentReportsPage() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "zh-TW";
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("zh-TW", {
      style: "currency",
      currency: "TWD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Mock 业绩数据
  const performanceData = {
    month: {
      revenue: 125000,
      newClients: 8,
      newPolicies: 12,
      renewals: 15,
      target: 150000,
      commission: 18750,
    },
    quarter: {
      revenue: 380000,
      newClients: 25,
      newPolicies: 38,
      renewals: 42,
      target: 450000,
      commission: 57000,
    },
    year: {
      revenue: 1450000,
      newClients: 95,
      newPolicies: 142,
      renewals: 168,
      target: 1800000,
      commission: 217500,
    },
  };

  const currentData =
    performanceData[selectedPeriod as keyof typeof performanceData];
  const achievementRate = (currentData.revenue / currentData.target) * 100;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题和期间选择 */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {locale === "en" ? "Performance Reports" : "業績報表"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {locale === "en"
              ? "Track your sales performance and achievements"
              : "追蹤您的銷售業績和成就"}
          </p>
        </div>
        <div className="flex-shrink-0">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">
                {locale === "en" ? "This Month" : "本月"}
              </SelectItem>
              <SelectItem value="quarter">
                {locale === "en" ? "This Quarter" : "本季"}
              </SelectItem>
              <SelectItem value="year">
                {locale === "en" ? "This Year" : "本年"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 关键指标卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {locale === "en" ? "Total Revenue" : "總營收"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(currentData.revenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {locale === "en" ? "Target" : "目標"}:{" "}
              {formatCurrency(currentData.target)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {locale === "en" ? "New Clients" : "新客戶"}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.newClients}</div>
            <p className="text-xs text-muted-foreground">
              {locale === "en" ? "New acquisitions" : "新增客戶數"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {locale === "en" ? "New Policies" : "新保單"}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.newPolicies}</div>
            <p className="text-xs text-muted-foreground">
              {locale === "en" ? "Policies sold" : "銷售保單數"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {locale === "en" ? "Commission" : "佣金收入"}
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(currentData.commission)}
            </div>
            <p className="text-xs text-muted-foreground">
              {locale === "en" ? "Earned commission" : "已賺取佣金"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 目标达成率 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            {locale === "en" ? "Target Achievement" : "目標達成率"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {locale === "en" ? "Progress" : "進度"}
              </span>
              <span className="text-sm text-muted-foreground">
                {achievementRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(achievementRate, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(currentData.revenue)}</span>
              <span>{formatCurrency(currentData.target)}</span>
            </div>
            {achievementRate >= 100 && (
              <div className="text-green-600 text-sm font-medium">
                🎉 {locale === "en" ? "Target achieved!" : "目標已達成！"}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 详细报表 */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">
            {locale === "en" ? "Overview" : "總覽"}
          </TabsTrigger>
          <TabsTrigger value="clients">
            {locale === "en" ? "Clients" : "客戶"}
          </TabsTrigger>
          <TabsTrigger value="products">
            {locale === "en" ? "Products" : "產品"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {locale === "en" ? "Sales Breakdown" : "銷售明細"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>{locale === "en" ? "New Policies" : "新保單"}</span>
                    <span className="font-medium">
                      {formatCurrency(currentData.revenue * 0.7)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{locale === "en" ? "Renewals" : "續約"}</span>
                    <span className="font-medium">
                      {formatCurrency(currentData.revenue * 0.3)}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>{locale === "en" ? "Total" : "總計"}</span>
                    <span>{formatCurrency(currentData.revenue)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {locale === "en" ? "Monthly Trend" : "月度趨勢"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-32">
                  <BarChart3 className="h-16 w-16 text-muted-foreground" />
                  <span className="ml-4 text-muted-foreground">
                    {locale === "en"
                      ? "Chart visualization would go here"
                      : "圖表視覺化將顯示於此"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>
                {locale === "en" ? "Client Performance" : "客戶業績"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">
                      {currentData.newClients}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {locale === "en" ? "New Clients" : "新客戶"}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {currentData.renewals}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {locale === "en" ? "Renewals" : "續約"}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {(
                        (currentData.renewals /
                          (currentData.renewals + currentData.newClients)) *
                        100
                      ).toFixed(0)}
                      %
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {locale === "en" ? "Retention Rate" : "客戶保留率"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>
                {locale === "en" ? "Product Performance" : "產品業績"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["人壽保險", "健康保險", "意外保險", "旅行保險"].map(
                  (product, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 border rounded-lg"
                    >
                      <span className="font-medium">
                        {locale === "en"
                          ? [
                              "Life Insurance",
                              "Health Insurance",
                              "Accident Insurance",
                              "Travel Insurance",
                            ][index]
                          : product}
                      </span>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(30000 * (4 - index))}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {4 - index} {locale === "en" ? "policies" : "保單"}
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
