"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AppDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "zh-TW";

  useEffect(() => {
    if (!isLoading && user) {
      // Smart redirect based on user role
      if (user.type === "consumer") {
        router.push(`/${locale}/consumer/dashboard`);
      } else if (user.type === "agent") {
        router.push(`/${locale}/agent/dashboard`);
      } else {
        // Default fallback
        router.push(`/${locale}/consumer/dashboard`);
      }
    } else if (!isLoading && !user) {
      // Not authenticated, redirect to login
      router.push(`/${locale}/login`);
    }
  }, [user, isLoading, router, locale]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}