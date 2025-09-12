"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  FileText,
  Calendar,
  User,
  DollarSign,
  TrendingUp,
} from "lucide-react";

export default function AgentPoliciesPage() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "zh-TW";
  const [searchQuery, setSearchQuery] = useState("");

  // Mock 保单数据
  const policies = [
    {
      id: "P001",
      clientName: "王小明",
      type: "人壽保險",
      typeEn: "Life Insurance",
      premium: 12000,
      status: "active",
      startDate: "2024-01-15",
      nextPayment: "2024-04-15",
    },
    {
      id: "P002",
      clientName: "李美华",
      type: "健康保險",
      typeEn: "Health Insurance",
      premium: 8500,
      status: "pending",
      startDate: "2024-02-01",
      nextPayment: "2024-05-01",
    },
    {
      id: "P003",
      clientName: "陈建文",
      type: "意外保險",
      typeEn: "Accident Insurance",
      premium: 5000,
      status: "active",
      startDate: "2024-03-10",
      nextPayment: "2024-06-10",
    },
  ];

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return (
        <Badge className="bg-green-100 text-green-700">
          {locale === "en" ? "Active" : "有效"}
        </Badge>
      );
    } else if (status === "pending") {
      return (
        <Badge variant="secondary">
          {locale === "en" ? "Pending" : "待處理"}
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          {locale === "en" ? "Expired" : "已到期"}
        </Badge>
      );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("zh-TW", {
      style: "currency",
      currency: "TWD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {locale === "en" ? "Policy Management" : "保單管理"}
        </h1>
        <p className="text-muted-foreground">
          {locale === "en"
            ? "Manage and track all client policies"
            : "管理和追蹤所有客戶保單"}
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {locale === "en" ? "Total Policies" : "總保單數"}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{policies.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {locale === "en" ? "Active Policies" : "有效保單"}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {policies.filter((p) => p.status === "active").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {locale === "en" ? "Monthly Premium" : "月保費收入"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                policies.reduce((sum, policy) => sum + policy.premium, 0),
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {locale === "en" ? "Pending Reviews" : "待審核"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {policies.filter((p) => p.status === "pending").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={
                  locale === "en" ? "Search policies..." : "搜尋保單..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline">
              {locale === "en" ? "Filter" : "篩選"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 保单列表 */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            {locale === "en" ? "All" : "全部"}
          </TabsTrigger>
          <TabsTrigger value="active">
            {locale === "en" ? "Active" : "有效"}
          </TabsTrigger>
          <TabsTrigger value="pending">
            {locale === "en" ? "Pending" : "待處理"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {policies.map((policy) => (
            <Card key={policy.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-lg">#{policy.id}</h3>
                      {getStatusBadge(policy.status)}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        {locale === "en" ? "Client" : "客戶"}:{" "}
                        {policy.clientName}
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        {locale === "en" ? "Type" : "類型"}:{" "}
                        {locale === "en" ? policy.typeEn : policy.type}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {locale === "en" ? "Start Date" : "生效日期"}:{" "}
                        {policy.startDate}
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(policy.premium)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {locale === "en" ? "Monthly Premium" : "月保費"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {locale === "en" ? "Next Payment" : "下次繳費"}:{" "}
                      {policy.nextPayment}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {policies
            .filter((p) => p.status === "active")
            .map((policy) => (
              <Card
                key={policy.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-lg">#{policy.id}</h3>
                        {getStatusBadge(policy.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div>
                          {policy.clientName} -{" "}
                          {locale === "en" ? policy.typeEn : policy.type}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {formatCurrency(policy.premium)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {policies
            .filter((p) => p.status === "pending")
            .map((policy) => (
              <Card
                key={policy.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-lg">#{policy.id}</h3>
                        {getStatusBadge(policy.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div>
                          {policy.clientName} -{" "}
                          {locale === "en" ? policy.typeEn : policy.type}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Button size="sm">
                        {locale === "en" ? "Review" : "審核"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
