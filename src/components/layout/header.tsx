"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, User, LogOut, Settings } from "lucide-react";
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
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  items: { href: string; label: string }[];
  onItemClick: () => void;
}

function MobileNav({ items, onItemClick }: MobileNavProps) {
  const pathname = usePathname();
  const currentLocale = pathname.startsWith("/en") ? "en" : "zh-TW";

  return (
    <div className="flex flex-col space-y-2">
      <Link
        href={`/${currentLocale}`}
        onClick={onItemClick}
        className="flex items-center space-x-2 pb-4"
      >
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">P</span>
        </div>
        <span className="font-bold">Prinsur</span>
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
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const localeFromPath = pathname.split("/")[1] || "zh-TW";
  const [currentLocale, setCurrentLocale] = useState(localeFromPath);

  useEffect(() => {
    const path = pathname;
    const newLocale = path.split("/")[1] || "zh-TW";
    if (newLocale !== currentLocale) {
      setCurrentLocale(newLocale);
    }
  }, [pathname, currentLocale]);

  // 根据用户角色生成不同的导航菜单
  const getNavigationItems = () => {
    if (!user) {
      // 未登录用户显示公共页面
      return [
        {
          href: `/${currentLocale}/insurance`,
          label: currentLocale === "en" ? "Insurance" : "保險商品",
        },
        {
          href: `/${currentLocale}/agents`,
          label: currentLocale === "en" ? "Find Agents" : "尋找業務員",
        },
      ];
    }

    if (user.type === "consumer") {
      // 消费者菜单
      return [
        {
          href: `/${currentLocale}/consumer/insurance`,
          label: currentLocale === "en" ? "Insurance" : "保險商品",
        },
        {
          href: `/${currentLocale}/consumer/policies`,
          label: currentLocale === "en" ? "My Policies" : "我的保單",
        },
        {
          href: `/${currentLocale}/consumer/agents`,
          label: currentLocale === "en" ? "Find Agents" : "尋找業務員",
        },
        {
          href: `/${currentLocale}/consumer/dashboard`,
          label: currentLocale === "en" ? "Dashboard" : "個人中心",
        },
      ];
    } else {
      // 业务员菜单
      return [
        {
          href: `/${currentLocale}/agent/dashboard`,
          label: currentLocale === "en" ? "Dashboard" : "工作台",
        },
        {
          href: `/${currentLocale}/agent/clients`,
          label: currentLocale === "en" ? "Clients" : "客戶管理",
        },
        {
          href: `/${currentLocale}/agent/policies`,
          label: currentLocale === "en" ? "Policies" : "保單管理",
        },
        {
          href: `/${currentLocale}/agent/reports`,
          label: currentLocale === "en" ? "Reports" : "業績報表",
        },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80 will-change-transform"
      style={{ transform: "translateZ(0)" }}
    >
      <div className="container flex h-14 items-center">
        {/* Logo */}
        <div className="mr-6 hidden md:flex">
          <Link
            href={`/${currentLocale}`}
            className="flex items-center space-x-2"
          >
            <div className="h-6 w-6 bg-foreground rounded flex items-center justify-center">
              <span className="text-background font-semibold text-xs">P</span>
            </div>
            <span className="font-semibold text-sm tracking-tight">
              Prinsur
            </span>
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
        <div className="mr-6 hidden md:flex">
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
        <div className="flex flex-1 items-center justify-end space-x-1">
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
                  <DropdownMenuItem asChild>
                    <Link
                      href={
                        user.type === "consumer"
                          ? `/${currentLocale}/consumer/dashboard`
                          : `/${currentLocale}/agent/dashboard`
                      }
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      {user.type === "consumer"
                        ? currentLocale === "en"
                          ? "Dashboard"
                          : "個人中心"
                        : currentLocale === "en"
                          ? "Dashboard"
                          : "工作台"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {currentLocale === "en" ? "Sign out" : "登出"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/${currentLocale}/login`}>
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
