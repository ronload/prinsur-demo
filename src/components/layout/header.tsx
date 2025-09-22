"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, User, LogOut, Settings } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  items: { href: string; label: string }[];
  onItemClick: () => void;
}

function MobileNav({ items, onItemClick }: MobileNavProps) {
  const pathname = usePathname();
  const currentLocale = useLocale();

  return (
    <div className="flex flex-col space-y-2">
      <Link
        href={`/${currentLocale}`}
        onClick={onItemClick}
        className="flex items-center space-x-2 pb-4"
      >
        <Image
          src="/brand/logo.png"
          alt="Prinsur"
          width={120}
          height={32}
          className="h-8 w-auto dark:invert"
        />
      </Link>
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              "block px-3 py-2 text-lg transition-colors rounded-md",
              isActive
                ? "text-foreground bg-muted"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

export function Header() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

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
          href: `/${currentLocale}/workspace/dashboard`,
          label: currentLocale === "en" ? "Dashboard" : "工作台",
        },
        {
          href: `/${currentLocale}/workspace/clients`,
          label: currentLocale === "en" ? "Clients" : "客戶管理",
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
          minHeight: "56px",
          height: "56px",
        }}
      >
        <div className="container flex h-14 items-center">
          <div className="mr-6 hidden md:flex">
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
          <div className="flex-1 hidden md:flex justify-center">
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/zh-TW/public/products">保險商品</Link>
              <Link href="/zh-TW/public/agents">尋找業務員</Link>
            </nav>
          </div>
          <div className="flex items-center justify-end space-x-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80 will-change-transform"
      style={{
        transform: "translateZ(0)",
        minHeight: "56px",
        height: "56px",
      }}
    >
      <div className="container flex h-14 items-center">
        {/* Logo */}
        <div className="mr-6 hidden md:flex">
          <Link href={`/${currentLocale}`} className="flex items-center">
            <Image
              src="/brand/logo.png"
              alt="Prinsur"
              width={100}
              height={28}
              className="h-7 w-auto dark:invert"
            />
          </Link>
        </div>

        {/* Mobile menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <MobileNav
              items={navigationItems}
              onItemClick={() => setIsOpen(false)}
            />
          </SheetContent>
        </Sheet>

        {/* Desktop navigation */}
        <div className="flex-1 hidden md:flex justify-center">
          <nav className="flex items-center space-x-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors px-3 py-2 rounded-md min-w-[100px] text-center",
                    isActive
                      ? "text-foreground bg-muted"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center justify-end space-x-1">
          <nav className="flex items-center space-x-1">
            <ThemeToggle />
            <LanguageToggle />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-xs font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
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
                  {user.type === "agent" && (
                    <DropdownMenuItem asChild>
                      <Link href={`/${currentLocale}/app/dashboard`}>
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
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/${currentLocale}/auth/login`}>
                  <User className="h-4 w-4 mr-2" />
                  {currentLocale === "en" ? "Sign in" : "登入"}
                </Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
