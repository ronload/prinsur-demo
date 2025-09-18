"use client";

import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { Shield, FileText, Users, BarChart3, CheckCircle } from "lucide-react";

export default function AppDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "zh-TW";

  if (!user) return null;

  const getDashboardData = () => {
    switch (user.type) {
      case "consumer":
        return {
          title: "消費者儀表板",
          description: "歡迎回到您的保險管理中心",
          quickActions: [
            {
              title: "瀏覽保險方案",
              description: "查看適合您的保險產品",
              icon: Shield,
              path: `/${locale}/app/insurance`,
              color: "bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
            },
            {
              title: "理賠申請",
              description: "提交新的理賠申請",
              icon: FileText,
              path: `/${locale}/app/claims`,
              color: "bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-300"
            },
            {
              title: "更新資料",
              description: "維護您的個人資訊",
              icon: Users,
              path: `/${locale}/app/profile`,
              color: "bg-purple-50 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
            }
          ],
          stats: [
            { label: "有效保單", value: "3", icon: Shield },
            { label: "待處理理賠", value: "1", icon: FileText },
            { label: "本月繳費", value: "完成", icon: CheckCircle }
          ]
        };
      default:
        return {
          title: "用戶儀表板",
          description: "歡迎使用保險平台",
          quickActions: [
            {
              title: "切換到工作台",
              description: "進入專業工作環境",
              icon: BarChart3,
              path: `/${locale}/workspace/dashboard`,
              color: "bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300"
            }
          ],
          stats: [
            { label: "系統狀態", value: "正常", icon: CheckCircle }
          ]
        };
    }
  };

  const dashboardData = getDashboardData();

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {dashboardData.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {dashboardData.description}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {dashboardData.stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <stat.icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          快速操作
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardData.quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className={`inline-flex p-2 rounded-lg ${action.color} mb-2`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => router.push(action.path)}
                  className="w-full"
                >
                  前往
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>帳戶資訊</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              使用者: <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              電子郵件: <span className="font-medium text-gray-900 dark:text-white">{user.email}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              角色: <span className="font-medium text-gray-900 dark:text-white capitalize">{user.type}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}