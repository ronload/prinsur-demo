"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function WorkspaceDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "zh-TW";

  useEffect(() => {
    if (!isLoading && user) {
      // Only agents, managers, and admins can access workspace
      if (["agent", "manager", "admin"].includes(user.type)) {
        router.push(`/${locale}/agent/dashboard`);
      } else {
        // Consumer should go to app dashboard
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
        <p className="text-muted-foreground">Redirecting to workspace...</p>
      </div>
    </div>
  );
}