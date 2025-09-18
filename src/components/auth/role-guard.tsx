"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

// Helper function to get default path for each role
function getDefaultPathForRole(
  userType: string,
  locale: string,
): string | null {
  switch (userType) {
    case "consumer":
      return `/${locale}/consumer`;
    case "agent":
    case "manager":
      return `/${locale}/app/dashboard`;
    case "admin":
      return `/${locale}/app/dashboard`; // Admin can access agent features
    default:
      return null;
  }
}

// Simple logging function (preparation for enterprise monitoring)
function logAccessAttempt(event: {
  userId?: string;
  userType?: string;
  attemptedPath: string;
  result: "allowed" | "denied" | "redirected";
  redirectTo?: string;
}) {
  // For now, just console log. In production, this would send to monitoring service
  if (process.env.NODE_ENV === "development") {
    console.log("[RoleGuard]", event);
  }

  // TODO: In production, send to monitoring service
  // await fetch('/api/audit/access-attempt', {
  //   method: 'POST',
  //   body: JSON.stringify(event)
  // });
}

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: ("consumer" | "agent" | "manager" | "admin")[];
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
      logAccessAttempt({
        attemptedPath: pathname,
        result: "redirected",
        redirectTo: `/${locale}/auth/login`,
      });
      router.push(`/${locale}/auth/login`);
      return;
    }

    // 如果指定了角色要求，检查用户角色
    if (allowedRoles && user && !allowedRoles.includes(user.type)) {
      // 根据用户角色跳转到对应的默认页面
      const redirectPath = getDefaultPathForRole(user.type, locale);
      if (redirectPath) {
        logAccessAttempt({
          userId: user.id,
          userType: user.type,
          attemptedPath: pathname,
          result: "denied",
          redirectTo: redirectPath,
        });
        router.push(redirectPath);
      }
      return;
    }

    // 检查路径是否符合用户角色
    if (user) {
      const isConsumerPath = pathname.includes("/consumer/");
      const isAgentPath = pathname.includes("/agent/");

      // Consumer trying to access agent paths
      if (isConsumerPath && !["consumer"].includes(user.type)) {
        const redirectPath = getDefaultPathForRole(user.type, locale);
        if (redirectPath) {
          router.push(redirectPath);
        }
        return;
      }

      // Non-agent trying to access agent paths
      if (isAgentPath && !["agent", "manager", "admin"].includes(user.type)) {
        const redirectPath = getDefaultPathForRole(user.type, locale);
        if (redirectPath) {
          router.push(redirectPath);
        }
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

  // Log successful access
  if (user) {
    logAccessAttempt({
      userId: user.id,
      userType: user.type,
      attemptedPath: pathname,
      result: "allowed",
    });
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
