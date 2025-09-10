"use client";

import { BanterLoader } from "./banter-loader";
import { usePathname } from "next/navigation";

interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  color?: string;
}

export function Loading({
  message,
  size = "md",
  fullScreen = false,
  color,
}: LoadingProps) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "zh-TW";
  const defaultMessage = locale === "en" ? "Loading..." : "載入中...";
  const loadingMessage = message || defaultMessage;
  const content = (
    <div className="flex flex-col items-center justify-center space-y-6">
      <BanterLoader size={size} color={color} />
      {loadingMessage && (
        <p className="text-muted-foreground text-sm">
          {loadingMessage}
          <span
            className="inline-block ml-1"
            style={{
              animation: "loadingDot 1.4s infinite",
              animationDelay: "0s",
            }}
          >
            .
          </span>
          <span
            className="inline-block ml-0.5"
            style={{
              animation: "loadingDot 1.4s infinite",
              animationDelay: "0.2s",
            }}
          >
            .
          </span>
          <span
            className="inline-block ml-0.5"
            style={{
              animation: "loadingDot 1.4s infinite",
              animationDelay: "0.4s",
            }}
          >
            .
          </span>
        </p>
      )}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes loadingDot {
            0%, 80%, 100% {
              transform: translateY(0px);
              opacity: 0.5;
            }
            40% {
              transform: translateY(-6px);
              opacity: 1;
            }
          }
        `,
        }}
      />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-8">{content}</div>;
}

// 頁面切換時的 Loading 組件
export function PageLoading() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "zh-TW";
  const message = locale === "en" ? "Loading..." : "載入中...";

  return <Loading message={message} size="lg" fullScreen={true} />;
}

// 搜尋資料時的 Loading 組件
export function SearchLoading() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "zh-TW";
  const message = locale === "en" ? "Searching..." : "搜尋中...";

  return <Loading message={message} size="md" fullScreen={false} />;
}

// 一般內容載入的 Loading 組件
export function ContentLoading() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "zh-TW";
  const message = locale === "en" ? "Loading data..." : "載入資料中...";

  return <Loading message={message} size="sm" fullScreen={false} />;
}
