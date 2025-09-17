"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

export function ThemeIcon() {
  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    // 確定當前主題
    const currentTheme = theme === "system" ? systemTheme : theme;

    // 移除現有的 apple-touch-icon
    const existingIcons = document.querySelectorAll('link[rel*="apple-touch-icon"]');
    existingIcons.forEach(icon => icon.remove());

    // 移除現有的 iOS 狀態列樣式 meta 標籤
    const existingStatusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (existingStatusBarMeta) {
      existingStatusBarMeta.remove();
    }

    // 創建新的 apple-touch-icon
    const link = document.createElement("link");
    link.rel = "apple-touch-icon";
    link.sizes = "180x180";

    // 創建新的狀態列樣式 meta 標籤
    const statusBarMeta = document.createElement("meta");
    statusBarMeta.name = "apple-mobile-web-app-status-bar-style";

    // 根據主題選擇圖標和狀態列樣式
    if (currentTheme === "dark") {
      link.href = "/icon-dark-512.png";
      statusBarMeta.content = "black-translucent"; // 暗色主題使用黑色半透明
    } else {
      link.href = "/icon-light-512.png";
      statusBarMeta.content = "default"; // 亮色主題使用預設（黑色文字）
    }

    document.head.appendChild(link);
    document.head.appendChild(statusBarMeta);
  }, [theme, systemTheme]);

  return null;
}