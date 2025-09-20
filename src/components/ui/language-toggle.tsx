"use client";

import * as React from "react";
import { ChevronDown, Globe } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageToggle() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [isChanging, setIsChanging] = React.useState(false);

  // 直接從 pathname 獲取當前語言，避免狀態競爭
  const currentLocale = React.useMemo(() => {
    return pathname.split("/")[1] || "zh-TW";
  }, [pathname]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageChange = React.useCallback((locale: string) => {
    if (isChanging || locale === currentLocale) return;

    setIsChanging(true);
    const pathWithoutLocale = pathname.replace(/^\/(zh-TW|en)/, "") || "/";
    const newUrl = `/${locale}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`;

    router.push(newUrl);

    // 防止快速連續點擊
    setTimeout(() => {
      setIsChanging(false);
    }, 500);
  }, [pathname, router, currentLocale, isChanging]);

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
          disabled={isChanging || currentLocale === "zh-TW"}
          className="w-full cursor-pointer"
        >
          {/* <span className="mr-2">🇹🇼</span> */}
          中文
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLanguageChange("en")}
          disabled={isChanging || currentLocale === "en"}
          className="w-full cursor-pointer"
        >
          {/* <span className="mr-2">🇺🇸</span> */}
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
