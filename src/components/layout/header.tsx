"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { User, LogOut, Settings, Moon, Sun, Globe } from "lucide-react";
import Image from "next/image";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

export function Header() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();

  // 使用 useMemo 穩定地計算語言，避免競爭條件
  const currentLocale = useMemo(() => {
    return pathname.split("/")[1] || "zh-TW";
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleThemeChange = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLanguageChange = (locale: string) => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const pathWithoutLocale = currentPath.replace(/^\/(zh-TW|en)/, "") || "/";
      const newUrl = `/${locale}${pathWithoutLocale}`;
      window.location.href = newUrl;
    }
  };

  // 根据用户角色生成不同的导航菜单
  const getNavigationItems = () => {
    if (!user) {
      // 未登录用户显示公共页面
      return [
        {
          href: `/${currentLocale}/public/products`,
          label: currentLocale === "en" ? "Insurance" : "保險商品",
        },
        {
          href: `/${currentLocale}/public/agents`,
          label: currentLocale === "en" ? "Find Agents" : "尋找業務員",
        },
      ];
    }

    if (user.type === "consumer") {
      // 消费者菜单
      return [
        {
          href: `/${currentLocale}/public/products`,
          label: currentLocale === "en" ? "Insurance" : "保險商品",
        },
        {
          href: `/${currentLocale}/public/agents`,
          label: currentLocale === "en" ? "Find Agents" : "尋找業務員",
        },
        {
          href: `/${currentLocale}/app/policies`,
          label: currentLocale === "en" ? "My Policies" : "我的保單",
        },
      ];
    } else {
      // 业务员菜单
      return [
        {
          href: `/${currentLocale}/workspace/clients`,
          label: currentLocale === "en" ? "Customers" : "客戶清單",
        },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  // 防止 hydration 不一致，在客戶端掛載前使用默認語言
  if (!mounted) {
    return (
      <header
        className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80 will-change-transform"
        style={{
          transform: "translateZ(0)",
          WebkitTransform: "translateZ(0)",
          minHeight: "calc(56px + env(safe-area-inset-top))",
          height: "calc(56px + env(safe-area-inset-top))",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        <div className="container flex h-14 items-center">
          <div className="w-[40px] md:w-[120px] flex justify-start">
            <Link href="/zh-TW" className="flex items-center">
              <Image
                src="/brand/logo.png"
                alt="Prinsur"
                width={100}
                height={28}
                className="h-7 w-auto dark:invert"
              />
            </Link>
          </div>
          <div className="flex-1 flex justify-center">
            <nav className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm font-medium">
              <Link
                href="/zh-TW/public/products"
                className="px-2 md:px-3 py-2 rounded-md text-center min-w-[80px] md:min-w-[100px] text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                保險商品
              </Link>
              <Link
                href="/zh-TW/public/agents"
                className="px-2 md:px-3 py-2 rounded-md text-center min-w-[80px] md:min-w-[100px] text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                尋找業務員
              </Link>
            </nav>
          </div>
          <div className="w-[40px] md:w-[120px] flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <User className="h-4 w-4" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">訪客</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      未登入
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Moon className="mr-2 h-4 w-4" />
                  深色模式
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Globe className="mr-2 h-4 w-4" />
                    語言
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem>中文</DropdownMenuItem>
                      <DropdownMenuItem>English</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/zh-TW/auth/login">
                    <LogOut className="mr-2 h-4 w-4 rotate-180" />
                    登入
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border bg-background shadow-sm"
      style={{
        transform: "translateZ(0)",
        WebkitTransform: "translateZ(0)",
        minHeight: "calc(56px + env(safe-area-inset-top))",
        height: "calc(56px + env(safe-area-inset-top))",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <div className="container flex h-14 items-center">
        {/* Logo - Fixed width for symmetry */}
        <div className="w-[40px] md:w-[120px] flex justify-start">
          <Link href={`/${currentLocale}`} className="flex items-center">
            <Image
              src="/brand/icon.png"
              alt="Prinsur"
              width={28}
              height={28}
              className="h-6 w-6 md:hidden dark:invert"
            />
            <Image
              src="/brand/logo.png"
              alt="Prinsur"
              width={100}
              height={28}
              className="hidden md:block h-7 w-auto dark:invert"
            />
          </Link>
        </div>

        {/* Navigation - Perfectly centered */}
        <div className="flex-1 flex justify-center">
          <nav className="flex items-center gap-1 md:gap-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    buttonVariants({
                      variant: isActive ? "secondary" : "ghost",
                      size: "sm",
                    }),
                    "min-w-[80px] justify-center",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side - User menu (Fixed width to match left side) */}
        <div className="w-[40px] md:w-[120px] flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {user ? (
                  <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-xs font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                ) : (
                  <User className="h-4 w-4" />
                )}
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {user ? (
                <>
                  {/* 已登录用户信息 */}
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.type === "consumer"
                          ? currentLocale === "en"
                            ? "Consumer"
                            : "消費者"
                          : currentLocale === "en"
                            ? "Insurance Agent"
                            : "保險業務員"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              ) : (
                <>
                  {/* 未登录用户提示 */}
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {currentLocale === "en" ? "Guest User" : "訪客"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentLocale === "en" ? "Not logged in" : "未登入"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}

              {/* 主题切换 - 所有用户都能使用 */}
              <DropdownMenuItem onClick={handleThemeChange}>
                {theme === "light" ? (
                  <Moon className="mr-2 h-4 w-4" />
                ) : (
                  <Sun className="mr-2 h-4 w-4" />
                )}
                {currentLocale === "en"
                  ? theme === "light"
                    ? "Dark Mode"
                    : "Light Mode"
                  : theme === "light"
                    ? "深色模式"
                    : "淺色模式"}
              </DropdownMenuItem>

              {/* 语言切换子菜单 - 所有用户都能使用 */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Globe className="mr-2 h-4 w-4" />
                  {currentLocale === "en" ? "Language" : "語言"}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={() => handleLanguageChange("zh-TW")}
                      disabled={currentLocale === "zh-TW"}
                    >
                      中文
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleLanguageChange("en")}
                      disabled={currentLocale === "en"}
                    >
                      English
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              {user ? (
                <>
                  {/* 已登录用户的功能菜单 */}
                  {user.type === "agent" && (
                    <DropdownMenuItem asChild>
                      <Link href={`/${currentLocale}/workspace/clients`}>
                        <Settings className="mr-2 h-4 w-4" />
                        {currentLocale === "en" ? "Dashboard" : "工作台"}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link
                      href={
                        user.type === "consumer"
                          ? `/${currentLocale}/app/profile`
                          : `/${currentLocale}/workspace/profile`
                      }
                    >
                      <User className="mr-2 h-4 w-4" />
                      {currentLocale === "en" ? "Profile" : "個人資料"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {currentLocale === "en" ? "Sign out" : "登出"}
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  {/* 未登录用户的登录按钮 */}
                  <DropdownMenuItem asChild>
                    <Link href={`/${currentLocale}/auth/login`}>
                      <LogOut className="mr-2 h-4 w-4 rotate-180" />
                      {currentLocale === "en" ? "Sign in" : "登入"}
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
