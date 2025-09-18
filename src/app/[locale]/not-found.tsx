"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            頁面不存在
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            您訪問的頁面無法找到，可能已被移動或刪除
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Link href="/zh-TW/" className="block">
              <Button className="w-full" variant="default">
                <Home className="w-4 h-4 mr-2" />
                返回首頁
              </Button>
            </Link>

            <Button
              onClick={handleGoBack}
              className="w-full"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回上一頁
            </Button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              您可能在尋找：
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• <Link href="/zh-TW/login" className="hover:underline">登入頁面</Link></li>
              <li>• <Link href="/zh-TW/app/dashboard" className="hover:underline">用戶儀表板</Link></li>
              <li>• <Link href="/zh-TW/workspace/dashboard" className="hover:underline">企業工作台</Link></li>
            </ul>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            如果您認為這是系統錯誤，請聯繫技術支援。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}