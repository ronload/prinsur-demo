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
import {
  getSafeUserAgent,
  safeLocalStorage,
  safeJsonParseNullable,
} from "@/lib/utils/browser-safe";

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
        const savedUser = safeLocalStorage.getItem("prinsur_user");
        if (savedUser) {
          const user = safeJsonParseNullable<User>(savedUser);
          if (user) {
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

              // Warm up cache in background, don't block initialization
              authCache.warmCache(user.id, user).catch((error) => {
                logger.warn("auth", "cache_warm_failed", {
                  user_id: user.id,
                  error:
                    error instanceof Error ? error.message : "Unknown error",
                });
              });
            }

            // Record session restoration for audit in background
            auditTrail
              .recordAuthentication(
                user,
                "login",
                undefined,
                getSafeUserAgent(),
              )
              .catch((error) => {
                logger.warn("auth", "session_restoration_audit_failed", {
                  user_id: user.id,
                  error:
                    error instanceof Error ? error.message : "Unknown error",
                });
              });
          }
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
    const normalizedEmail =
      email.trim() || `demo.user.${Date.now()}@demo.local`;

    // 模拟API调用延迟，保留示意效果
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 创建用户对象（即使输入为空也会生成有效身份）
    const newUser: User = {
      id: Date.now().toString(),
      email: normalizedEmail,
      name: normalizedEmail.split("@")[0] || "demo_user",
      type: userType,
      role: userType, // Set role for RBAC compatibility
    };

    // 保存用户信息到客户端
    setUser(newUser);
    safeLocalStorage.setItem("prinsur_user", JSON.stringify(newUser));

    // 更新日志记录器的用户信息
    logger.setUser(newUser.id, newUser.type);

    // 记录登录事件
    logger.trackAuth("login", {
      user_id: newUser.id,
      user_email: newUser.email,
      user_type: newUser.type,
      login_method: "demo_auth",
    });

    // 异步操作并行执行，避免阻塞
    try {
      const response = await fetch("/api/auth/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: newUser, action: "login" }),
      });

      if (!response.ok) {
        logger.warn("auth", "server_session_sync_failed", {
          user_id: newUser.id,
          status: response.status,
        });
      } else {
        logger.info("auth", "server_session_sync_success", {
          user_id: newUser.id,
        });
      }
    } catch (error) {
      logger.warn("auth", "server_session_sync_failed", {
        user_id: newUser.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    auditTrail
      .recordAuthentication(newUser, "login", undefined, getSafeUserAgent())
      .catch((error) => {
        logger.warn("auth", "audit_trail_failed", {
          user_id: newUser.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      });

    // Cache session data (同步执行，因为是本地操作)
    try {
      cacheUserSession(newUser.id, {
        user: newUser,
        permissions: [], // Will be populated by RBAC system
        roles: [`role_${newUser.type}`],
        lastActivity: Date.now(),
      });
    } catch (error) {
      logger.warn("auth", "cache_session_failed", {
        user_id: newUser.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

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

    // 立即清除客户端状态，不等待异步操作
    setUser(null);
    safeLocalStorage.removeItem("prinsur_user");
    logger.clearUser();

    // 清除快取（同步操作）
    if (currentUser) {
      try {
        invalidateUserCache(currentUser.id);
      } catch (error) {
        logger.warn("auth", "cache_invalidation_failed", {
          user_id: currentUser.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // 异步操作在后台执行，不阻塞UI
    if (currentUser) {
      Promise.allSettled([
        // 记录审计跟踪
        auditTrail.recordAuthentication(
          currentUser,
          "logout",
          undefined,
          getSafeUserAgent(),
        ),
        // 同步登出状态到服务端（带超时）
        fetch("/api/auth/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "logout" }),
          signal: AbortSignal.timeout(3000), // 3秒超时
        }),
      ]).then((results) => {
        results.forEach((result, index) => {
          if (result.status === "rejected") {
            const operation =
              index === 0 ? "audit_trail" : "server_session_clear";
            logger.warn("auth", `${operation}_failed`, {
              error:
                result.reason instanceof Error
                  ? result.reason.message
                  : "Unknown error",
            });
          } else if (index === 1) {
            logger.info("auth", "server_session_clear_success");
          }
        });
      });
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
