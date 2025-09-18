"use client";

import { User } from "@/contexts/auth-context";
import { useAuth } from "@/contexts/auth-context";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Home,
  FileText,
  Shield,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

interface AppNavigationProps {
  locale: string;
}

export default function AppNavigation({ locale }: AppNavigationProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return null;

  const navigationItems = getNavigationItems(user, locale);

  const handleLogout = () => {
    logout();
    router.push(`/${locale}/login`);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                保險平台
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  variant={pathname === item.path ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleNavigation(item.path)}
                  className="flex items-center space-x-2"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {user.name} ({user.type})
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              登出
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 dark:border-gray-700">
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  variant={pathname === item.path ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleNavigation(item.path)}
                  className="w-full justify-start flex items-center space-x-2"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              ))}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="px-3 py-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.name} ({user.type})
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  登出
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function getNavigationItems(user: User, locale: string) {
  const baseItems = [
    {
      path: `/${locale}/app/dashboard`,
      label: "主頁",
      icon: Home,
      roles: ["consumer", "agent", "manager", "admin"]
    }
  ];

  const roleSpecificItems = [];

  // Consumer navigation
  if (user.type === "consumer") {
    roleSpecificItems.push(
      {
        path: `/${locale}/app/insurance`,
        label: "保險方案",
        icon: Shield,
        roles: ["consumer"]
      },
      {
        path: `/${locale}/app/claims`,
        label: "理賠申請",
        icon: FileText,
        roles: ["consumer"]
      },
      {
        path: `/${locale}/app/profile`,
        label: "個人資料",
        icon: Settings,
        roles: ["consumer"]
      }
    );
  }

  // Agent navigation
  if (["agent", "manager", "admin"].includes(user.type)) {
    roleSpecificItems.push(
      {
        path: `/${locale}/workspace/clients`,
        label: "客戶管理",
        icon: FileText,
        roles: ["agent", "manager", "admin"]
      },
      {
        path: `/${locale}/workspace/policies`,
        label: "保單管理",
        icon: Shield,
        roles: ["agent", "manager", "admin"]
      }
    );
  }

  // Manager/Admin navigation
  if (["manager", "admin"].includes(user.type)) {
    roleSpecificItems.push(
      {
        path: `/${locale}/workspace/reports`,
        label: "報表分析",
        icon: FileText,
        roles: ["manager", "admin"]
      }
    );
  }

  // Admin navigation
  if (user.type === "admin") {
    roleSpecificItems.push(
      {
        path: `/${locale}/workspace/settings`,
        label: "系統設定",
        icon: Settings,
        roles: ["admin"]
      }
    );
  }

  return [...baseItems, ...roleSpecificItems].filter(item =>
    item.roles.includes(user.type)
  );
}