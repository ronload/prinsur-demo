"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  type: "consumer" | "agent";
}

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string,
    userType: "consumer" | "agent",
  ) => Promise<boolean>;
  logout: () => void;
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
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string,
    userType: "consumer" | "agent",
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
    };

    // 保存用户信息
    setUser(newUser);
    localStorage.setItem("prinsur_user", JSON.stringify(newUser));

    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("prinsur_user");
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
