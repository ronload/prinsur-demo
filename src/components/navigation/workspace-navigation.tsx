"use client";

import { User } from "@/contexts/auth-context";
import { useAuth } from "@/contexts/auth-context";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Users,
  Shield,
  BarChart3,
  Settings,
  FileText,
  Database,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface WorkspaceNavigationProps {
  locale: string;
}

export default function WorkspaceNavigation({ locale }: WorkspaceNavigationProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user || !["agent", "manager", "admin"].includes(user.type)) {
    return null;
  }

  const navigationItems = getWorkspaceNavigationItems(user, locale);

  const handleLogout = () => {
    logout();
    router.push(`/${locale}/login`);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-slate-900 text-white border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold">
                企業工作台
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  variant={pathname === item.path ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleNavigation(item.path)}
                  className="flex items-center space-x-2 text-white hover:text-slate-200 hover:bg-slate-800"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-slate-200 hover:bg-slate-800"
            >
              <Bell className="w-4 h-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-white hover:text-slate-200 hover:bg-slate-800"
                >
                  <span>{user.name}</span>
                  <span className="text-xs bg-slate-700 px-2 py-1 rounded-full">
                    {user.type.toUpperCase()}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => handleNavigation(`/${locale}/app/profile`)}>
                  <Settings className="mr-2 h-4 w-4" />
                  個人設定
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation(`/${locale}/app/dashboard`)}>
                  <Users className="mr-2 h-4 w-4" />
                  切換到用戶視圖
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  登出
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-slate-200 hover:bg-slate-800"
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
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-slate-700">
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  variant={pathname === item.path ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleNavigation(item.path)}
                  className="w-full justify-start flex items-center space-x-2 text-white hover:text-slate-200 hover:bg-slate-800"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              ))}
              <div className="pt-4 border-t border-slate-700">
                <div className="px-3 py-2">
                  <p className="text-sm text-slate-300">
                    {user.name} ({user.type.toUpperCase()})
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation(`/${locale}/app/dashboard`)}
                  className="w-full justify-start text-white hover:text-slate-200 hover:bg-slate-800"
                >
                  <Users className="w-4 h-4 mr-2" />
                  切換到用戶視圖
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start text-white hover:text-slate-200 hover:bg-slate-800"
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

function getWorkspaceNavigationItems(user: User, locale: string) {
  const baseItems = [
    {
      path: `/${locale}/workspace/dashboard`,
      label: "工作台總覽",
      icon: BarChart3,
      roles: ["agent", "manager", "admin"]
    },
    {
      path: `/${locale}/workspace/clients`,
      label: "客戶管理",
      icon: Users,
      roles: ["agent", "manager", "admin"]
    },
    {
      path: `/${locale}/workspace/policies`,
      label: "保單管理",
      icon: Shield,
      roles: ["agent", "manager", "admin"]
    },
    {
      path: `/${locale}/workspace/claims`,
      label: "理賠處理",
      icon: FileText,
      roles: ["agent", "manager", "admin"]
    }
  ];

  const managerItems = [
    {
      path: `/${locale}/workspace/reports`,
      label: "報表分析",
      icon: BarChart3,
      roles: ["manager", "admin"]
    },
    {
      path: `/${locale}/workspace/teams`,
      label: "團隊管理",
      icon: Users,
      roles: ["manager", "admin"]
    }
  ];

  const adminItems = [
    {
      path: `/${locale}/workspace/analytics`,
      label: "數據分析",
      icon: Database,
      roles: ["admin"]
    },
    {
      path: `/${locale}/workspace/settings`,
      label: "系統設定",
      icon: Settings,
      roles: ["admin"]
    }
  ];

  let allItems = [...baseItems];

  if (["manager", "admin"].includes(user.type)) {
    allItems = [...allItems, ...managerItems];
  }

  if (user.type === "admin") {
    allItems = [...allItems, ...adminItems];
  }

  return allItems.filter(item => item.roles.includes(user.type));
}