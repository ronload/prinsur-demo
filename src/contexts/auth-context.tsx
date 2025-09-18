/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { logger } from "@/lib/monitoring/enterprise-logger";
import { auditTrail } from "@/lib/audit/audit-trail";
import {
  authCache,
  cacheUserSession,
  getUserSession,
  invalidateUserCache,
} from "@/lib/cache/auth-cache";
import { rbac } from "@/lib/rbac/advanced-permissions";

export interface User {
  id: string;
  email: string;
  name: string;
  type: "consumer" | "agent" | "manager" | "admin";
  role: "consumer" | "agent" | "manager" | "admin"; // For RBAC compatibility
}

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string,
    userType: "consumer" | "agent" | "manager" | "admin",
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  hasPermission: (permissionId: string, context?: any) => Promise<boolean>;
  hasResourcePermission: (
    resource: string,
    action: string,
    context?: any,
  ) => Promise<boolean>;
  getUserRoles: () => Promise<string[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 检查本地存储中是否有已登录用户，優先使用快取
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const savedUser = localStorage.getItem("prinsur_user");
        if (savedUser) {
          const user = JSON.parse(savedUser);
          // Ensure backward compatibility - set role if not present
          if (!user.role && user.type) {
            user.role = user.type;
          }

          // Check cache first
          const cachedSession = getUserSession(user.id);
          if (cachedSession) {
            setUser(cachedSession.user);
            logger.setUser(user.id, user.type);
          } else {
            setUser(user);
            logger.setUser(user.id, user.type);

            // Warm up cache
            await authCache.warmCache(user.id, user);
          }

          // Record session restoration for audit
          await auditTrail.recordAuthentication(
            user,
            "login",
            undefined,
            typeof navigator !== "undefined" ? navigator.userAgent : undefined,
          );
        }
      } catch (error) {
        logger.error("auth", "session_restoration_failed", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  const login = async (
    email: string,
    password: string,
    userType: "consumer" | "agent" | "manager" | "admin",
  ): Promise<boolean> => {
    // 简单验证：只要邮箱和密码都有值就算登录成功
    if (!email.trim() || !password.trim()) {
      return false;
    }

    // 模拟API调用延迟
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 创建用户对象
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name: email.split("@")[0], // 使用邮箱前缀作为姓名
      type: userType,
      role: userType, // Set role for RBAC compatibility
    };

    // 保存用户信息到客户端
    setUser(newUser);
    localStorage.setItem("prinsur_user", JSON.stringify(newUser));

    // 更新日志记录器的用户信息
    logger.setUser(newUser.id, newUser.type);

    // 记录登录事件
    logger.trackAuth("login", {
      user_id: newUser.id,
      user_email: newUser.email,
      user_type: newUser.type,
      login_method: "demo_auth",
    });

    // 同步会话到服务端
    try {
      await fetch("/api/auth/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: newUser, action: "login" }),
      });

      logger.info("auth", "server_session_sync_success", {
        user_id: newUser.id,
      });
    } catch (error) {
      logger.warn("auth", "server_session_sync_failed", {
        user_id: newUser.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      // Continue with login even if server sync fails
    }

    // Record audit trail
    await auditTrail.recordAuthentication(
      newUser,
      "login",
      undefined,
      typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    );

    // Cache session data
    cacheUserSession(newUser.id, {
      user: newUser,
      permissions: [], // Will be populated by RBAC system
      roles: [`role_${newUser.type}`],
      lastActivity: Date.now(),
    });

    return true;
  };

  const logout = async () => {
    const currentUser = user;

    // 记录登出事件
    if (currentUser) {
      logger.trackAuth("logout", {
        user_id: currentUser.id,
        user_email: currentUser.email,
        user_type: currentUser.type,
        session_duration: Date.now() - parseInt(currentUser.id), // Rough approximation
      });
    }

    // Record audit trail before clearing user data
    if (currentUser) {
      await auditTrail.recordAuthentication(
        currentUser,
        "logout",
        undefined,
        typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      );
    }

    // 清除客户端状态
    setUser(null);
    localStorage.removeItem("prinsur_user");

    // 清除日志记录器的用户信息
    logger.clearUser();

    // 清除快取
    if (currentUser) {
      invalidateUserCache(currentUser.id);
    }

    // 同步登出状态到服务端
    try {
      await fetch("/api/auth/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "logout" }),
      });

      logger.info("auth", "server_session_clear_success");
    } catch (error) {
      logger.warn("auth", "server_session_clear_failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      // Continue with logout even if server sync fails
    }
  };

  // RBAC 權限檢查方法
  const hasPermission = async (
    permissionId: string,
    context?: any,
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      return await rbac.hasPermission(user.id, permissionId, {
        user: {
          id: user.id,
          type: user.type,
          email: user.email,
          name: user.name,
        },
        ...context,
      });
    } catch (error) {
      logger.error("auth", "permission_check_failed", {
        user_id: user.id,
        permission_id: permissionId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  };

  const hasResourcePermission = async (
    resource: string,
    action: string,
    context?: any,
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      return await rbac.hasResourcePermission(user.id, resource, action, {
        user: {
          id: user.id,
          type: user.type,
          email: user.email,
          name: user.name,
        },
        ...context,
      });
    } catch (error) {
      logger.error("auth", "resource_permission_check_failed", {
        user_id: user.id,
        resource,
        action,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  };

  const getUserRoles = async (): Promise<string[]> => {
    if (!user) return [];

    try {
      return await rbac.getUserRoles(user.id);
    } catch (error) {
      logger.error("auth", "get_user_roles_failed", {
        user_id: user.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return [];
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        hasPermission,
        hasResourcePermission,
        getUserRoles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
