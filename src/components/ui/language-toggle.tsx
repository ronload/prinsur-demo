"use client";

import * as React from "react";
import { ChevronDown, Globe } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageToggle() {
  const pathname = usePathname();
  const localeFromPath = pathname.split('/')[1] || 'zh-TW';
  const [currentLocale, setCurrentLocale] = React.useState(localeFromPath);

  React.useEffect(() => {
    const newLocale = pathname.split('/')[1] || 'zh-TW';
    if (newLocale !== currentLocale) {
      setCurrentLocale(newLocale);
    }
  }, [pathname, currentLocale]);

  const getLanguageUrl = (locale: string) => {
    const pathWithoutLocale = pathname.replace(/^\/(zh-TW|en)/, "") || "/";
    return `/${locale}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`;
  };

  const getCurrentLanguageLabel = () =>
    currentLocale === "en" ? "English" : "中文";

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
        <DropdownMenuItem asChild>
          <Link href={getLanguageUrl("zh-TW")} className="w-full">
            {/* <span className="mr-2">🇹🇼</span> */}
            中文
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={getLanguageUrl("en")} className="w-full">
            {/* <span className="mr-2">🇺🇸</span> */}
            English
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
