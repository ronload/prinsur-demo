"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { logger } from '@/lib/monitoring/enterprise-logger';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 检查本地存储中是否有已登录用户
  useEffect(() => {
    const savedUser = localStorage.getItem("prinsur_user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      // Ensure backward compatibility - set role if not present
      if (!user.role && user.type) {
        user.role = user.type;
      }
      setUser(user);
    }
    setIsLoading(false);
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
    logger.trackAuth('login', {
      user_id: newUser.id,
      user_email: newUser.email,
      user_type: newUser.type,
      login_method: 'demo_auth',
    });

    // 同步会话到服务端
    try {
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user: newUser, action: 'login' }),
      });

      logger.info('auth', 'server_session_sync_success', { user_id: newUser.id });
    } catch (error) {
      logger.warn('auth', 'server_session_sync_failed', {
        user_id: newUser.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // Continue with login even if server sync fails
    }

    return true;
  };

  const logout = async () => {
    const currentUser = user;

    // 记录登出事件
    if (currentUser) {
      logger.trackAuth('logout', {
        user_id: currentUser.id,
        user_email: currentUser.email,
        user_type: currentUser.type,
        session_duration: Date.now() - parseInt(currentUser.id), // Rough approximation
      });
    }

    // 清除客户端状态
    setUser(null);
    localStorage.removeItem("prinsur_user");

    // 清除日志记录器的用户信息
    logger.clearUser();

    // 同步登出状态到服务端
    try {
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'logout' }),
      });

      logger.info('auth', 'server_session_clear_success');
    } catch (error) {
      logger.warn('auth', 'server_session_clear_failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // Continue with logout even if server sync fails
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
