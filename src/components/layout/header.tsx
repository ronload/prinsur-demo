"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
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
  const [currentLocale, setCurrentLocale] = useState("zh-TW");
  const pathname = usePathname();

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith("/en")) {
      setCurrentLocale("en");
    } else {
      setCurrentLocale("zh-TW");
    }
  }, []);

  const navigationItems = [
    {
      href: `/${currentLocale}/insurance`,
      label: currentLocale === "en" ? "Insurance" : "保險商品",
    },
    {
      href: `/${currentLocale}/policies`,
      label: currentLocale === "en" ? "My Policies" : "我的保單",
    },
    {
      href: `/${currentLocale}/agents`,
      label: currentLocale === "en" ? "Agents" : "業務員",
    },
    {
      href: `/${currentLocale}/dashboard`,
      label: currentLocale === "en" ? "Dashboard" : "儀表板",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
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
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <User className="h-4 w-4" />
              <span className="sr-only">User menu</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
