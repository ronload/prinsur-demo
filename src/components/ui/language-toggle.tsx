"use client";

import * as React from "react";
import { ChevronDown, Globe } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageToggle() {
  const [mounted, setMounted] = React.useState(false);
  const [currentLocale, setCurrentLocale] = React.useState("zh-TW");

  React.useEffect(() => {
    setMounted(true);
    // 從瀏覽器 URL 獲取當前語言
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const locale = path.split("/")[1];
      if (locale === "en" || locale === "zh-TW") {
        setCurrentLocale(locale);
      }
    }
  }, []);

  // 最簡單的語言切換：直接跳轉到對應語言的首頁
  const handleLanguageChange = (locale: string) => {
    if (typeof window !== "undefined") {
      window.location.href = `/${locale}`;
    }
  };

  const getCurrentLanguageLabel = () =>
    currentLocale === "en" ? "English" : "中文";

  // 防止 hydration 不一致
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-3 focus-visible:ring-0 focus-visible:ring-offset-0"
        disabled
      >
        <Globe className="h-4 w-4" />
        <span className="ml-2 text-sm">中文</span>
        <ChevronDown className="h-3 w-3 ml-1" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <Globe className="h-4 w-4" />
          <span className="ml-2 text-sm">{getCurrentLanguageLabel()}</span>
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleLanguageChange("zh-TW")}
          disabled={currentLocale === "zh-TW"}
          className="w-full cursor-pointer"
        >
          {/* <span className="mr-2">🇹🇼</span> */}
          中文
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLanguageChange("en")}
          disabled={currentLocale === "en"}
          className="w-full cursor-pointer"
        >
          {/* <span className="mr-2">🇺🇸</span> */}
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
