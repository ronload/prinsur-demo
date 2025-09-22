"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, User, Briefcase, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DatePicker } from "@/components/ui/date-picker";

interface RegisterFormProps {
  locale: string;
}

export default function RegisterForm({ locale }: RegisterFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 初始化時就從 URL 參數設置 tab，避免閃爍
  const getInitialTab = () => {
    const tab = searchParams.get("tab");
    return tab === "agent" ? "agent" : "consumer";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // 處理 tab 變化並更新 URL
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    const params = new URLSearchParams(searchParams);
    params.set("tab", newTab);
    router.replace(`${pathname}?${params.toString()}`);
  };

  // 監聽 URL 參數變化
  useEffect(() => {
    const tab = searchParams.get("tab");
    const newTab = tab === "agent" ? "agent" : "consumer";
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [searchParams, activeTab]);

  const [consumerForm, setConsumerForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    birthDate: undefined as Date | undefined,
    gender: "",
  });

  const [agentForm, setAgentForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    birthDate: undefined as Date | undefined,
    gender: "",
    licenseNumber: "",
    company: "",
    position: "",
    specialties: "",
    education: "",
    certifications: "",
    businessAddress: "",
    personalStatement: "",
  });

  const handleConsumerInputChange = (field: string, value: string) => {
    setConsumerForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleConsumerDateChange = (date: Date | undefined) => {
    setConsumerForm((prev) => ({ ...prev, birthDate: date }));
  };

  const handleAgentInputChange = (field: string, value: string) => {
    setAgentForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAgentDateChange = (date: Date | undefined) => {
    setAgentForm((prev) => ({ ...prev, birthDate: date }));
  };

  const handleConsumerSubmit = () => {
    console.log("Consumer registration:", consumerForm);
    // TODO: 實作消費者註冊邏輯
  };

  const handleAgentSubmit = () => {
    console.log("Agent registration:", agentForm);
    // TODO: 實作業務員註冊邏輯 (需要審核)
  };

  return (
    <div className="w-full">
      {/* 返回登入頁面按鈕 */}
      <div className="pt-4 pb-6">
        <Link
          href={`/${locale}/auth/login`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {locale === "en" ? "Back to Login" : "返回登入"}
        </Link>
      </div>

      {/* 註冊表單 */}
      <Card className="mb-6">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {locale === "en" ? "Create Account" : "建立帳戶"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
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

            {/* 消費者註冊 */}
            <TabsContent value="consumer" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="consumer-firstName">
                    {locale === "en" ? "First Name" : "姓氏"}
                  </Label>
                  <Input
                    id="consumer-firstName"
                    placeholder={locale === "en" ? "e.g., John" : "例：王"}
                    value={consumerForm.firstName}
                    onChange={(e) =>
                      handleConsumerInputChange("firstName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consumer-lastName">
                    {locale === "en" ? "Last Name" : "名字"}
                  </Label>
                  <Input
                    id="consumer-lastName"
                    placeholder={locale === "en" ? "e.g., Smith" : "例：小明"}
                    value={consumerForm.lastName}
                    onChange={(e) =>
                      handleConsumerInputChange("lastName", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="consumer-email">
                  {locale === "en" ? "Email" : "電子郵件"}
                </Label>
                <Input
                  id="consumer-email"
                  type="email"
                  placeholder={
                    locale === "en" ? "Enter your email" : "請輸入您的電子郵件"
                  }
                  value={consumerForm.email}
                  onChange={(e) =>
                    handleConsumerInputChange("email", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="consumer-phone">
                  {locale === "en" ? "Phone Number" : "手機號碼"}
                </Label>
                <Input
                  id="consumer-phone"
                  type="tel"
                  placeholder={
                    locale === "en"
                      ? "Enter your phone number"
                      : "請輸入您的手機號碼"
                  }
                  value={consumerForm.phone}
                  onChange={(e) =>
                    handleConsumerInputChange("phone", e.target.value)
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="consumer-birthDate">
                    {locale === "en" ? "Birth Date" : "出生日期"}
                  </Label>
                  <DatePicker
                    date={consumerForm.birthDate}
                    onDateChange={handleConsumerDateChange}
                    placeholder={
                      locale === "en" ? "Select birth date" : "選擇出生日期"
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consumer-gender">
                    {locale === "en" ? "Gender" : "性別"}
                  </Label>
                  <Select
                    value={consumerForm.gender}
                    onValueChange={(value) =>
                      handleConsumerInputChange("gender", value)
                    }
                  >
                    <SelectTrigger className="h-9 !h-9 !min-h-9 !max-h-9">
                      <SelectValue
                        placeholder={
                          locale === "en" ? "Select gender" : "選擇性別"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">
                        {locale === "en" ? "Male" : "男性"}
                      </SelectItem>
                      <SelectItem value="female">
                        {locale === "en" ? "Female" : "女性"}
                      </SelectItem>
                      <SelectItem value="other">
                        {locale === "en" ? "Other" : "其他"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                      locale === "en" ? "Create a password" : "建立密碼"
                    }
                    value={consumerForm.password}
                    onChange={(e) =>
                      handleConsumerInputChange("password", e.target.value)
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

              <div className="space-y-2">
                <Label htmlFor="consumer-confirmPassword">
                  {locale === "en" ? "Confirm Password" : "確認密碼"}
                </Label>
                <div className="relative">
                  <Input
                    id="consumer-confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={
                      locale === "en" ? "Confirm your password" : "確認您的密碼"
                    }
                    value={consumerForm.confirmPassword}
                    onChange={(e) =>
                      handleConsumerInputChange(
                        "confirmPassword",
                        e.target.value,
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="consumer-terms"
                  className="rounded"
                />
                <Label htmlFor="consumer-terms" className="text-sm">
                  {locale === "en"
                    ? "I agree to the Terms of Service and Privacy Policy"
                    : "我同意服務條款和隱私政策"}
                </Label>
              </div>

              <Button className="w-full" onClick={handleConsumerSubmit}>
                {locale === "en" ? "Create Consumer Account" : "建立消費者帳戶"}
              </Button>

              {/* 社交註冊選項 */}
              <div className="text-center text-sm text-muted-foreground mt-6 mb-4">
                {locale === "en" ? "Or register with" : "或使用以下方式註冊"}
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
                  ? "Already have an account? "
                  : "已經有帳戶了？ "}
                <Link
                  href={`/${locale}/auth/login`}
                  className="text-primary hover:underline"
                >
                  {locale === "en" ? "Sign in" : "立即登入"}
                </Link>
              </div>
            </TabsContent>

            {/* 保險業務員註冊 */}
            <TabsContent value="agent" className="space-y-4 mt-6">
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg mb-4">
                {locale === "en"
                  ? "Agent accounts require manual verification. You'll receive an email notification once your application is reviewed."
                  : "業務員帳戶需要人工審核，您的申請審核完成後將收到電子郵件通知。"}
              </div>

              {/* 基本資訊 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  {locale === "en" ? "Personal Information" : "個人資訊"}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="agent-firstName">
                      {locale === "en" ? "First Name" : "姓氏"} *
                    </Label>
                    <Input
                      id="agent-firstName"
                      placeholder={locale === "en" ? "e.g., John" : "例：王"}
                      value={agentForm.firstName}
                      onChange={(e) =>
                        handleAgentInputChange("firstName", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agent-lastName">
                      {locale === "en" ? "Last Name" : "名字"} *
                    </Label>
                    <Input
                      id="agent-lastName"
                      placeholder={locale === "en" ? "e.g., Smith" : "例：小明"}
                      value={agentForm.lastName}
                      onChange={(e) =>
                        handleAgentInputChange("lastName", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agent-email">
                    {locale === "en" ? "Email" : "電子郵件"} *
                  </Label>
                  <Input
                    id="agent-email"
                    type="email"
                    placeholder={
                      locale === "en"
                        ? "Enter your email"
                        : "請輸入您的電子郵件"
                    }
                    value={agentForm.email}
                    onChange={(e) =>
                      handleAgentInputChange("email", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agent-phone">
                    {locale === "en" ? "Phone Number" : "手機號碼"} *
                  </Label>
                  <Input
                    id="agent-phone"
                    type="tel"
                    placeholder={
                      locale === "en"
                        ? "Enter your phone number"
                        : "請輸入您的手機號碼"
                    }
                    value={agentForm.phone}
                    onChange={(e) =>
                      handleAgentInputChange("phone", e.target.value)
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="agent-birthDate">
                      {locale === "en" ? "Birth Date" : "出生日期"} *
                    </Label>
                    <DatePicker
                      date={agentForm.birthDate}
                      onDateChange={handleAgentDateChange}
                      placeholder={
                        locale === "en" ? "Select birth date" : "選擇出生日期"
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agent-gender">
                      {locale === "en" ? "Gender" : "性別"} *
                    </Label>
                    <Select
                      value={agentForm.gender}
                      onValueChange={(value) =>
                        handleAgentInputChange("gender", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            locale === "en" ? "Select gender" : "選擇性別"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">
                          {locale === "en" ? "Male" : "男性"}
                        </SelectItem>
                        <SelectItem value="female">
                          {locale === "en" ? "Female" : "女性"}
                        </SelectItem>
                        <SelectItem value="other">
                          {locale === "en" ? "Other" : "其他"}
                        </SelectItem>
                        <SelectItem value="prefer-not-to-say">
                          {locale === "en" ? "Prefer not to say" : "不願透露"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 專業資訊 */}
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-medium">
                  {locale === "en" ? "Professional Information" : "專業資訊"}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="agent-licenseNumber">
                      {locale === "en" ? "License Number" : "執照號碼"} *
                    </Label>
                    <Input
                      id="agent-licenseNumber"
                      placeholder={locale === "en" ? "License #" : "執照號碼"}
                      value={agentForm.licenseNumber}
                      onChange={(e) =>
                        handleAgentInputChange("licenseNumber", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agent-company">
                      {locale === "en" ? "Insurance Company" : "保險公司"} *
                    </Label>
                    <Input
                      id="agent-company"
                      placeholder={
                        locale === "en" ? "Company name" : "公司名稱"
                      }
                      value={agentForm.company}
                      onChange={(e) =>
                        handleAgentInputChange("company", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agent-position">
                    {locale === "en" ? "Position/Rank" : "職級"}
                  </Label>
                  <Input
                    id="agent-position"
                    placeholder={
                      locale === "en"
                        ? "e.g., Senior Agent, Team Leader"
                        : "例如：資深業務員、團隊主管"
                    }
                    value={agentForm.position}
                    onChange={(e) =>
                      handleAgentInputChange("position", e.target.value)
                    }
                  />
                  <p className="text-sm text-amber-600 dark:text-amber-500">
                    {locale === "en"
                      ? "Please be honest, falsifying your position may constitute document fraud"
                      : "請誠實填寫，偽造職級將涉嫌偽造文書"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agent-education">
                    {locale === "en" ? "Education Level" : "教育程度"}
                  </Label>
                  <Select
                    value={agentForm.education}
                    onValueChange={(value) =>
                      handleAgentInputChange("education", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={locale === "en" ? "Education" : "教育程度"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high-school">
                        {locale === "en" ? "High School" : "高中"}
                      </SelectItem>
                      <SelectItem value="bachelor">
                        {locale === "en" ? "Bachelor's Degree" : "學士學位"}
                      </SelectItem>
                      <SelectItem value="master">
                        {locale === "en" ? "Master's Degree" : "碩士學位"}
                      </SelectItem>
                      <SelectItem value="phd">
                        {locale === "en" ? "PhD" : "博士學位"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent-specialties">
                  {locale === "en" ? "Specialties" : "專業領域"}
                </Label>
                <Textarea
                  id="agent-specialties"
                  placeholder={
                    locale === "en"
                      ? "List your insurance specialties (e.g., Life Insurance, Health Insurance, Property Insurance)"
                      : "請列出您的保險專業領域（例如：壽險、健康險、財產險）"
                  }
                  value={agentForm.specialties}
                  onChange={(e) =>
                    handleAgentInputChange("specialties", e.target.value)
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent-certifications">
                  {locale === "en" ? "Certifications" : "專業證照"}
                </Label>
                <Textarea
                  id="agent-certifications"
                  placeholder={
                    locale === "en"
                      ? "List your professional certifications and qualifications"
                      : "請列出您的專業證照和資格"
                  }
                  value={agentForm.certifications}
                  onChange={(e) =>
                    handleAgentInputChange("certifications", e.target.value)
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent-businessAddress">
                  {locale === "en" ? "Business Address" : "營業地址"} *
                </Label>
                <Textarea
                  id="agent-businessAddress"
                  placeholder={
                    locale === "en"
                      ? "Enter your business address"
                      : "請輸入您的營業地址"
                  }
                  value={agentForm.businessAddress}
                  onChange={(e) =>
                    handleAgentInputChange("businessAddress", e.target.value)
                  }
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent-personalStatement">
                  {locale === "en" ? "Personal Statement" : "個人簡介"}
                </Label>
                <Textarea
                  id="agent-personalStatement"
                  placeholder={
                    locale === "en"
                      ? "Tell us about yourself and why you want to join our platform"
                      : "請介紹您自己以及為什麼想要加入我們的平台"
                  }
                  value={agentForm.personalStatement}
                  onChange={(e) =>
                    handleAgentInputChange("personalStatement", e.target.value)
                  }
                  rows={4}
                />
              </div>
              {/* </div> */}

              {/* 密碼設定 */}
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-medium">
                  {locale === "en" ? "Account Security" : "帳戶安全"}
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="agent-password">
                    {locale === "en" ? "Password" : "密碼"} *
                  </Label>
                  <div className="relative">
                    <Input
                      id="agent-password"
                      type={showPassword ? "text" : "password"}
                      placeholder={
                        locale === "en" ? "Create a password" : "建立密碼"
                      }
                      value={agentForm.password}
                      onChange={(e) =>
                        handleAgentInputChange("password", e.target.value)
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

                <div className="space-y-2">
                  <Label htmlFor="agent-confirmPassword">
                    {locale === "en" ? "Confirm Password" : "確認密碼"} *
                  </Label>
                  <div className="relative">
                    <Input
                      id="agent-confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={
                        locale === "en"
                          ? "Confirm your password"
                          : "確認您的密碼"
                      }
                      value={agentForm.confirmPassword}
                      onChange={(e) =>
                        handleAgentInputChange(
                          "confirmPassword",
                          e.target.value,
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <input type="checkbox" id="agent-terms" className="rounded" />
                <Label htmlFor="agent-terms" className="text-sm">
                  {locale === "en"
                    ? "I agree to the Terms of Service, Privacy Policy, and Agent Agreement"
                    : "我同意服務條款、隱私政策和業務員協議"}
                </Label>
              </div>

              <Button className="w-full" onClick={handleAgentSubmit}>
                {locale === "en"
                  ? "Submit Agent Application"
                  : "提交業務員申請"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                {locale === "en"
                  ? "Already have an account? "
                  : "已經有帳戶了？ "}
                <Link
                  href={`/${locale}/auth/login`}
                  className="text-primary hover:underline"
                >
                  {locale === "en" ? "Sign in" : "立即登入"}
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
