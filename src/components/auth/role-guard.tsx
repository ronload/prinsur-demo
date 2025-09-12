"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: ("consumer" | "agent")[];
  requireAuth?: boolean;
}

export function RoleGuard({
  children,
  allowedRoles,
  requireAuth = false,
}: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "zh-TW";

  useEffect(() => {
    if (isLoading) return; // 等待认证状态加载

    // 如果需要登录但用户未登录，跳转到登录页
    if (requireAuth && !user) {
      router.push(`/${locale}/login`);
      return;
    }

    // 如果指定了角色要求，检查用户角色
    if (allowedRoles && user && !allowedRoles.includes(user.type)) {
      // 根据用户角色跳转到对应的默认页面
      if (user.type === "consumer") {
        router.push(`/${locale}/consumer/dashboard`);
      } else if (user.type === "agent") {
        router.push(`/${locale}/agent/dashboard`);
      }
      return;
    }

    // 检查路径是否符合用户角色
    if (user) {
      const isConsumerPath = pathname.includes("/consumer/");
      const isAgentPath = pathname.includes("/agent/");

      if (isConsumerPath && user.type !== "consumer") {
        router.push(`/${locale}/agent/dashboard`);
        return;
      }

      if (isAgentPath && user.type !== "agent") {
        router.push(`/${locale}/consumer/dashboard`);
        return;
      }
    }
  }, [user, isLoading, router, pathname, locale, requireAuth, allowedRoles]);

  // 加载中显示
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 需要登录但未登录，不渲染内容
  if (requireAuth && !user) {
    return null;
  }

  // 角色不匹配，不渲染内容
  if (allowedRoles && user && !allowedRoles.includes(user.type)) {
    return null;
  }

  return <>{children}</>;
}

// 便捷的角色保护组件
export function ConsumerGuard({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["consumer"]} requireAuth={true}>
      {children}
    </RoleGuard>
  );
}

export function AgentGuard({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["agent"]} requireAuth={true}>
      {children}
    </RoleGuard>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard requireAuth={true}>{children}</RoleGuard>;
}
