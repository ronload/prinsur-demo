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

    // 創建新的 apple-touch-icon
    const link = document.createElement("link");
    link.rel = "apple-touch-icon";
    link.sizes = "180x180";

    // 根據主題選擇圖標
    if (currentTheme === "dark") {
      link.href = "/icon-dark-512.png";
    } else {
      link.href = "/icon-light-512.png";
    }

    document.head.appendChild(link);
  }, [theme, systemTheme]);

  return null;
}