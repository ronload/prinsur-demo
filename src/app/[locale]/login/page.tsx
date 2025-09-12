"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, User, Briefcase, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { login } = useAuth();
  const locale = pathname.split("/")[1] || "zh-TW";
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 清除错误信息
    if (error) setError("");
  };

  const handleSubmit = async (userType: "consumer" | "agent") => {
    setError("");

    // 基本验证
    if (!formData.email.trim()) {
      setError(locale === "en" ? "Email is required" : "請輸入電子郵件");
      return;
    }
    if (!formData.password.trim()) {
      setError(locale === "en" ? "Password is required" : "請輸入密碼");
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(formData.email, formData.password, userType);

      if (success) {
        // 登录成功，跳转到对应的角色专区
        if (userType === "consumer") {
          router.push(`/${locale}/consumer/`);
        } else {
          router.push(`/${locale}/agent/dashboard`);
        }
      } else {
        setError(
          locale === "en" ? "Invalid email or password" : "電子郵件或密碼錯誤",
        );
      }
    } catch (err) {
      setError(
        locale === "en"
          ? "Login failed. Please try again."
          : "登入失敗，請稍後再試",
      );
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md mx-auto">
        {/* 返回首頁按鈕 */}
        <div className="pt-4 pb-6">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {locale === "en" ? "Back to Home" : "返回首頁"}
          </Link>
        </div>

        <div className="w-full">
          {/* 登入表單 */}
          <Card className="mb-6">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">
                {locale === "en" ? "Sign In" : "登入"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="consumer" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="consumer"
                    className="flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span>{locale === "en" ? "Consumer" : "消費者"}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="agent"
                    className="flex items-center space-x-2"
                  >
                    <Briefcase className="h-4 w-4" />
                    <span>
                      {locale === "en" ? "Insurance Agent" : "保險業務員"}
                    </span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="consumer" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="consumer-email">
                      {locale === "en" ? "Email" : "電子郵件"}
                    </Label>
                    <Input
                      id="consumer-email"
                      type="email"
                      placeholder={
                        locale === "en"
                          ? "Enter your email"
                          : "請輸入您的電子郵件"
                      }
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consumer-password">
                      {locale === "en" ? "Password" : "密碼"}
                    </Label>
                    <div className="relative">
                      <Input
                        id="consumer-password"
                        type={showPassword ? "text" : "password"}
                        placeholder={
                          locale === "en"
                            ? "Enter your password"
                            : "請輸入您的密碼"
                        }
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="remember-consumer"
                        className="rounded"
                      />
                      <Label htmlFor="remember-consumer" className="text-sm">
                        {locale === "en" ? "Remember me" : "記住我"}
                      </Label>
                    </div>
                    <Link
                      href="#"
                      className="text-sm text-primary hover:underline"
                    >
                      {locale === "en" ? "Forgot password?" : "忘記密碼？"}
                    </Link>
                  </div>

                  {/* 错误信息 */}
                  {error && (
                    <div className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-950/20 p-3 rounded-md">
                      {error}
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={() => handleSubmit("consumer")}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        {locale === "en" ? "Signing in..." : "登入中..."}
                      </>
                    ) : locale === "en" ? (
                      "Sign In as Consumer"
                    ) : (
                      "以消費者身份登入"
                    )}
                  </Button>
                  {/* 其他登入方式 */}
                  <div className="text-center text-sm text-muted-foreground mt-6 mb-4">
                    {locale === "en"
                      ? "Or continue with"
                      : "或使用以下方式登入"}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <Button variant="outline" className="w-full">
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Google
                    </Button>
                    <Button variant="outline" className="w-full">
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                        />
                      </svg>
                      Facebook
                    </Button>
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    {locale === "en"
                      ? "Don't have an account? "
                      : "還沒有帳戶？ "}
                    <Link
                      href={`/${locale}/register?tab=consumer`}
                      className="text-primary hover:underline"
                    >
                      {locale === "en" ? "Sign up" : "立即註冊"}
                    </Link>
                  </div>
                </TabsContent>

                <TabsContent value="agent" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="agent-email">
                      {locale === "en" ? "Agent Email" : "業務員電子郵件"}
                    </Label>
                    <Input
                      id="agent-email"
                      type="email"
                      placeholder={
                        locale === "en"
                          ? "Enter your agent email"
                          : "請輸入您的業務員電子郵件"
                      }
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agent-password">
                      {locale === "en" ? "Password" : "密碼"}
                    </Label>
                    <div className="relative">
                      <Input
                        id="agent-password"
                        type={showPassword ? "text" : "password"}
                        placeholder={
                          locale === "en"
                            ? "Enter your password"
                            : "請輸入您的密碼"
                        }
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="remember-agent"
                        className="rounded"
                      />
                      <Label htmlFor="remember-agent" className="text-sm">
                        {locale === "en" ? "Remember me" : "記住我"}
                      </Label>
                    </div>
                    <Link
                      href="#"
                      className="text-sm text-primary hover:underline"
                    >
                      {locale === "en" ? "Forgot password?" : "忘記密碼？"}
                    </Link>
                  </div>

                  {/* 错误信息 */}
                  {error && (
                    <div className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-950/20 p-3 rounded-md">
                      {error}
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={() => handleSubmit("agent")}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        {locale === "en" ? "Signing in..." : "登入中..."}
                      </>
                    ) : locale === "en" ? (
                      "Sign In as Agent"
                    ) : (
                      "以業務員身份登入"
                    )}
                  </Button>
                  {/* 其他登入方式 */}
                  <div className="text-center text-sm text-muted-foreground mt-6 mb-4">
                    {locale === "en"
                      ? "Or continue with"
                      : "或使用以下方式登入"}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <Button variant="outline" className="w-full">
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Google
                    </Button>
                    <Button variant="outline" className="w-full">
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                        />
                      </svg>
                      Facebook
                    </Button>
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    {locale === "en" ? "New agent? " : "新業務員？ "}
                    <Link
                      href={`/${locale}/register?tab=agent`}
                      className="text-primary hover:underline"
                    >
                      {locale === "en" ? "Apply now" : "立即申請"}
                    </Link>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
