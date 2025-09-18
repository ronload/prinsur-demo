"use client";

import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import {
  Users,
  Shield,
  FileText,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Database
} from "lucide-react";

export default function WorkspaceDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "zh-TW";

  if (!user || !["agent", "manager", "admin"].includes(user.type)) {
    return null;
  }

  const getWorkspaceData = () => {
    const baseData = {
      title: "企業工作台",
      description: "專業保險管理平台",
      quickActions: [
        {
          title: "客戶管理",
          description: "查看和管理客戶資料",
          icon: Users,
          path: `/${locale}/workspace/clients`,
          color: "bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
        },
        {
          title: "保單管理",
          description: "處理保單相關業務",
          icon: Shield,
          path: `/${locale}/workspace/policies`,
          color: "bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-300"
        },
        {
          title: "理賠處理",
          description: "審核理賠申請",
          icon: FileText,
          path: `/${locale}/workspace/claims`,
          color: "bg-orange-50 text-orange-600 dark:bg-orange-900 dark:text-orange-300"
        }
      ],
      stats: [
        { label: "今日新客戶", value: "12", icon: Users, trend: "+8%" },
        { label: "待處理理賠", value: "45", icon: FileText, trend: "-3%" },
        { label: "本月成交", value: "₩2.4M", icon: TrendingUp, trend: "+15%" }
      ]
    };

    if (["manager", "admin"].includes(user.type)) {
      baseData.quickActions.push(
        {
          title: "團隊管理",
          description: "管理團隊成員和績效",
          icon: Users,
          path: `/${locale}/workspace/teams`,
          color: "bg-purple-50 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
        },
        {
          title: "報表分析",
          description: "查看業務分析報表",
          icon: BarChart3,
          path: `/${locale}/workspace/reports`,
          color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300"
        }
      );
      baseData.stats.push({ label: "團隊績效", value: "89%", icon: TrendingUp, trend: "+5%" });
    }

    if (user.type === "admin") {
      baseData.quickActions.push(
        {
          title: "系統設定",
          description: "管理系統配置",
          icon: Database,
          path: `/${locale}/workspace/settings`,
          color: "bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-300"
        }
      );
      baseData.stats.push({ label: "系統健康度", value: "98%", icon: CheckCircle, trend: "穩定" });
    }

    return baseData;
  };

  const workspaceData = getWorkspaceData();

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {workspaceData.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {workspaceData.description} - {user.type.toUpperCase()} 視圖
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {workspaceData.stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <stat.icon className="w-8 h-8 text-gray-400 mb-2" />
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    stat.trend.includes('+')
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : stat.trend.includes('-')
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                  }`}>
                    {stat.trend}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          工作區域
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaceData.quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className={`inline-flex p-3 rounded-lg ${action.color} mb-2`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => router.push(action.path)}
                  variant="outline"
                  className="w-full"
                >
                  開始工作
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              最近活動
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">理賠申請 #2024-001 已審核</p>
                  <p className="text-xs text-gray-500">5 分鐘前</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">新客戶註冊 - 張小明</p>
                  <p className="text-xs text-gray-500">1 小時前</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">保單 #POL-2024-156 生效</p>
                  <p className="text-xs text-gray-500">2 小時前</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              待處理事項
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">理賠申請待審核</p>
                    <p className="text-xs text-gray-500">45 件</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  處理
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">客戶資料待完善</p>
                    <p className="text-xs text-gray-500">12 件</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  檢視
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}