"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AgentGuard } from "@/components/auth/role-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Phone, Mail, User, Plus } from "lucide-react";

export default function AgentClientsPage() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "zh-TW";
  const [searchQuery, setSearchQuery] = useState("");

  // Mock 客户数据
  const clients = [
    {
      id: "1",
      name: "王小明",
      email: "wang@example.com",
      phone: "0912-345-678",
      status: "active",
      joinDate: "2024-01-15",
      policies: 2,
    },
    {
      id: "2",
      name: "李美华",
      email: "li@example.com",
      phone: "0987-654-321",
      status: "pending",
      joinDate: "2024-02-20",
      policies: 1,
    },
    {
      id: "3",
      name: "陈建文",
      email: "chen@example.com",
      phone: "0923-456-789",
      status: "active",
      joinDate: "2024-03-10",
      policies: 3,
    },
  ];

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return (
        <Badge className="bg-green-100 text-green-700">
          {locale === "en" ? "Active" : "活躍"}
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary">
          {locale === "en" ? "Pending" : "待處理"}
        </Badge>
      );
    }
  };

  return (
    <AgentGuard>
      <div className="container mx-auto p-6 space-y-6">
        {/* 页面标题和操作 */}
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {locale === "en" ? "Client Management" : "客戶管理"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {locale === "en"
                ? "Manage your clients and their policies"
                : "管理您的客戶和保單"}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {locale === "en" ? "Add Client" : "新增客戶"}
            </Button>
          </div>
        </div>

        {/* 搜索栏 */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={
                  locale === "en" ? "Search clients..." : "搜尋客戶..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardContent>
        </Card>

        {/* 客户列表 */}
        <div className="grid gap-4">
          {clients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-lg truncate">
                        {client.name}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-sm text-muted-foreground">
                        <div className="flex items-center min-w-0">
                          <Mail className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </div>
                        <div className="flex items-center min-w-0">
                          <Phone className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{client.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col items-start justify-between md:justify-start space-y-0 md:space-y-2">
                    {getStatusBadge(client.status)}
                    <div className="text-sm text-muted-foreground text-right">
                      <div>
                        {locale === "en" ? "Policies" : "保單數量"}:{" "}
                        {client.policies}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {locale === "en" ? "Total Clients" : "總客戶數"}
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length}</div>
              <p className="text-xs text-muted-foreground">
                {locale === "en" ? "Active clients" : "活躍客戶"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {locale === "en" ? "Total Policies" : "總保單數"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clients.reduce((sum, client) => sum + client.policies, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {locale === "en" ? "Active policies" : "有效保單"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {locale === "en" ? "New This Month" : "本月新增"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">
                {locale === "en" ? "New clients" : "新客戶"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AgentGuard>
  );
}
