"use client";

import React from "react";
import ErrorBoundary, { ErrorFallbackProps } from "../error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Shield } from "lucide-react";
import { usePathname } from "next/navigation";

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

function AppErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "zh-TW";

  const handleGoToDashboard = () => {
    window.location.href = `/${locale}/app/dashboard`;
  };

  const handleGoHome = () => {
    window.location.href = `/${locale}/`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            應用程式錯誤
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            用戶應用程式遇到了錯誤，請嘗試以下解決方案
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && process.env.NODE_ENV === "development" && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
              <p className="text-sm text-orange-800 dark:text-orange-200 font-mono">
                {error.message}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Button onClick={resetError} className="w-full" variant="default">
              <RotateCcw className="w-4 h-4 mr-2" />
              重試操作
            </Button>

            <Button onClick={handleGoToDashboard} className="w-full" variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              返回應用主頁
            </Button>

            <Button onClick={handleGoHome} className="w-full" variant="ghost">
              返回首頁
            </Button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>提示：</strong>您的數據是安全的，此錯誤不會影響您的保險信息。
            </p>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            錯誤 ID: APP-{Date.now()} | 如需協助請聯繫客服
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={AppErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}