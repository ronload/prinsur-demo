"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX, Home, LogOut } from "lucide-react";

export default function UnauthorizedPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "zh-TW";

  const handleGoHome = () => {
    if (user) {
      // Redirect to appropriate home based on user role
      if (user.type === "consumer") {
        router.push(`/${locale}/consumer`);
      } else if (["agent", "manager", "admin"].includes(user.type)) {
        router.push(`/${locale}/app/dashboard`);
      } else {
        router.push(`/${locale}/`);
      }
    } else {
      router.push(`/${locale}/`);
    }
  };

  const handleLogout = () => {
    logout();
    router.push(`/${locale}/auth/login`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
            <ShieldX className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Access Denied
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            You don&apos;t have permission to access this resource.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Logged in as: <span className="font-medium">{user.email}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Role: <span className="font-medium capitalize">{user.type}</span>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Button onClick={handleGoHome} className="w-full" variant="default">
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>

            {user && (
              <Button onClick={handleLogout} className="w-full" variant="outline">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            If you believe this is an error, please contact your administrator.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}