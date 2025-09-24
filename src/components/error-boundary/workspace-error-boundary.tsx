"use client";

import React from "react";
import ErrorBoundary, { ErrorFallbackProps } from "../error-boundary";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, BarChart3, Users } from "lucide-react";
import { usePathname } from "next/navigation";

interface WorkspaceErrorBoundaryProps {
  children: React.ReactNode;
}

function WorkspaceErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "zh-TW";

  const handleGoToDashboard = () => {
    window.location.href = `/${locale}/workspace/clients`;
  };

  const handleGoToApp = () => {
    window.location.href = `/${locale}/app/dashboard`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <Card className="w-full max-w-md border-slate-200 dark:border-slate-800">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            工作台系統錯誤
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            企業工作台遇到技術問題，請嘗試恢復操作
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && process.env.NODE_ENV === "development" && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-200 font-mono">
                {error.message}
              </p>
              <details className="mt-2">
                <summary className="text-xs text-red-600 dark:text-red-300 cursor-pointer">
                  技術詳情
                </summary>
                <pre className="text-xs text-red-600 dark:text-red-300 mt-2 overflow-auto max-h-32">
                  {error.stack}
                </pre>
              </details>
            </div>
          )}

          <div className="space-y-2">
            <Button onClick={resetError} className="w-full" variant="default">
              <RotateCcw className="w-4 h-4 mr-2" />
              重試工作台操作
            </Button>

            <Button
              onClick={handleGoToDashboard}
              className="w-full"
              variant="outline"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              返回工作台主頁
            </Button>

            <Button onClick={handleGoToApp} className="w-full" variant="ghost">
              <Users className="w-4 h-4 mr-2" />
              切換到用戶視圖
            </Button>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>企業提醒：</strong>
              系統已自動保存您的工作進度，數據完整性不受影響。
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>錯誤 ID: WS-{Date.now()}</span>
            <span>企業支援: 24/7</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function WorkspaceErrorBoundary({
  children,
}: WorkspaceErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={WorkspaceErrorFallback}>{children}</ErrorBoundary>
  );
}
