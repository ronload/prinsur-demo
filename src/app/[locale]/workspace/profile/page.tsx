"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { Save, User, Briefcase, Building, MapPin, X } from "lucide-react";

interface AgentProfileProps {
  params: Promise<{ locale: string }>;
}

interface AgentProfile {
  licenseNumber: string;
  position: string;
  serviceCategories: string[];
  insuranceCompanies: string[];
  specialties: string[];
  serviceAreas: string[];
  bio: string;
  contactPhone: string;
  officeAddress: string;
}

const SERVICE_CATEGORIES = [
  { id: "life", label: { "zh-TW": "人壽保險", en: "Life Insurance" } },
  { id: "health", label: { "zh-TW": "健康保險", en: "Health Insurance" } },
  { id: "accident", label: { "zh-TW": "意外保險", en: "Accident Insurance" } },
  { id: "travel", label: { "zh-TW": "旅遊保險", en: "Travel Insurance" } },
  { id: "auto", label: { "zh-TW": "汽車保險", en: "Auto Insurance" } },
  { id: "property", label: { "zh-TW": "財產保險", en: "Property Insurance" } },
];

const INSURANCE_COMPANIES = [
  { id: "cathay", label: { "zh-TW": "國泰人壽", en: "Cathay Life" } },
  { id: "fubon", label: { "zh-TW": "富邦人壽", en: "Fubon Life" } },
  { id: "nan_shan", label: { "zh-TW": "南山人壽", en: "Nan Shan Life" } },
  { id: "shin_kong", label: { "zh-TW": "新光人壽", en: "Shin Kong Life" } },
  { id: "taiwan_life", label: { "zh-TW": "台灣人壽", en: "Taiwan Life" } },
  { id: "global_life", label: { "zh-TW": "全球人壽", en: "TransGlobe Life" } },
];

const SPECIALTIES = [
  {
    id: "retirement_planning",
    label: { "zh-TW": "退休規劃", en: "Retirement Planning" },
  },
  {
    id: "family_protection",
    label: { "zh-TW": "家庭保障", en: "Family Protection" },
  },
  {
    id: "investment_insurance",
    label: { "zh-TW": "投資型保險", en: "Investment Insurance" },
  },
  {
    id: "business_insurance",
    label: { "zh-TW": "企業保險", en: "Business Insurance" },
  },
  {
    id: "medical_insurance",
    label: { "zh-TW": "醫療保險", en: "Medical Insurance" },
  },
  {
    id: "disability_insurance",
    label: { "zh-TW": "失能保險", en: "Disability Insurance" },
  },
];

const TAIWAN_AREAS = [
  { id: "taipei", label: { "zh-TW": "台北市", en: "Taipei City" } },
  { id: "new-taipei", label: { "zh-TW": "新北市", en: "New Taipei City" } },
  { id: "taoyuan", label: { "zh-TW": "桃園市", en: "Taoyuan City" } },
  { id: "taichung", label: { "zh-TW": "台中市", en: "Taichung City" } },
  { id: "tainan", label: { "zh-TW": "台南市", en: "Tainan City" } },
  { id: "kaohsiung", label: { "zh-TW": "高雄市", en: "Kaohsiung City" } },
  { id: "keelung", label: { "zh-TW": "基隆市", en: "Keelung City" } },
  { id: "hsinchu-city", label: { "zh-TW": "新竹市", en: "Hsinchu City" } },
  { id: "chiayi-city", label: { "zh-TW": "嘉義市", en: "Chiayi City" } },
  { id: "hsinchu", label: { "zh-TW": "新竹縣", en: "Hsinchu County" } },
  { id: "miaoli", label: { "zh-TW": "苗栗縣", en: "Miaoli County" } },
  { id: "changhua", label: { "zh-TW": "彰化縣", en: "Changhua County" } },
  { id: "nantou", label: { "zh-TW": "南投縣", en: "Nantou County" } },
  { id: "yunlin", label: { "zh-TW": "雲林縣", en: "Yunlin County" } },
  { id: "chiayi", label: { "zh-TW": "嘉義縣", en: "Chiayi County" } },
  { id: "pingtung", label: { "zh-TW": "屏東縣", en: "Pingtung County" } },
  { id: "yilan", label: { "zh-TW": "宜蘭縣", en: "Yilan County" } },
  { id: "hualien", label: { "zh-TW": "花蓮縣", en: "Hualien County" } },
  { id: "taitung", label: { "zh-TW": "台東縣", en: "Taitung County" } },
];

export default function AgentProfilePage({ params }: AgentProfileProps) {
  const { locale } = use(params);
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<AgentProfile>({
    licenseNumber: "",
    position: "",
    serviceCategories: [],
    insuranceCompanies: [],
    specialties: [],
    serviceAreas: [],
    bio: "",
    contactPhone: "",
    officeAddress: "",
  });

  // Load existing profile data (mock implementation)
  useEffect(() => {
    if (user?.id) {
      const savedProfile = localStorage.getItem(`agent_profile_${user.id}`);
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    }
  }, [user?.id]);

  const handleSave = async () => {
    // Validate required fields
    if (!profile.licenseNumber.trim()) {
      alert(
        locale === "en" ? "License Number is required" : "執照號碼為必填項目",
      );
      return;
    }

    setIsSaving(true);
    try {
      // Save to localStorage (mock implementation)
      localStorage.setItem(
        `agent_profile_${user?.id}`,
        JSON.stringify(profile),
      );

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert(
        locale === "en"
          ? "Profile saved successfully!"
          : "個人資料已成功儲存！",
      );
    } catch (error) {
      alert(locale === "en" ? "Failed to save profile" : "儲存失敗");
    } finally {
      setIsSaving(false);
    }
  };

  const handleArrayFieldChange = (
    field: keyof Pick<
      AgentProfile,
      "serviceCategories" | "insuranceCompanies" | "specialties"
    >,
    itemId: string,
    checked: boolean,
  ) => {
    setProfile((prev) => ({
      ...prev,
      [field]: checked
        ? [...prev[field], itemId]
        : prev[field].filter((id) => id !== itemId),
    }));
  };

  const handleServiceAreaAdd = (areaId: string) => {
    if (
      profile.serviceAreas.length < 3 &&
      !profile.serviceAreas.includes(areaId)
    ) {
      setProfile((prev) => ({
        ...prev,
        serviceAreas: [...prev.serviceAreas, areaId],
      }));
    }
  };

  const handleServiceAreaRemove = (areaId: string) => {
    setProfile((prev) => ({
      ...prev,
      serviceAreas: prev.serviceAreas.filter((id) => id !== areaId),
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-6 md:container md:py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {locale === "en" ? "Agent Profile" : "業務員資料"}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {locale === "en"
              ? "Manage your professional information and service offerings"
              : "管理您的專業資料和服務項目"}
          </p>
        </div>

        <div className="grid gap-6 md:gap-8">
          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {locale === "en" ? "Professional Information" : "專業資料"}
              </CardTitle>
              <CardDescription>
                {locale === "en"
                  ? "Your license and professional details"
                  : "您的執照和專業詳細資料"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="license">
                    {locale === "en" ? "License Number" : "執照號碼"}
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="license"
                    required
                    value={profile.licenseNumber}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        licenseNumber: e.target.value,
                      }))
                    }
                    placeholder={
                      locale === "en" ? "Enter license number" : "輸入執照號碼"
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">
                    {locale === "en" ? "Position/Rank" : "職級"}
                  </Label>
                  <Input
                    id="position"
                    value={profile.position}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        position: e.target.value,
                      }))
                    }
                    placeholder={
                      locale === "en"
                        ? "e.g., Senior Agent, Team Leader"
                        : "例如：資深業務員、團隊主管"
                    }
                  />
                  <p className="text-sm text-amber-600 dark:text-amber-500">
                    {locale === "en"
                      ? "Please be honest, falsifying your position may constitute document fraud"
                      : "請誠實填寫，偽造職級將涉嫌偽造文書"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    {locale === "en" ? "Contact Phone" : "聯絡電話"}
                  </Label>
                  <Input
                    id="phone"
                    value={profile.contactPhone}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        contactPhone: e.target.value,
                      }))
                    }
                    placeholder={locale === "en" ? "Phone number" : "電話號碼"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">
                    {locale === "en" ? "Office Address" : "辦公室地址"}
                  </Label>
                  <Input
                    id="address"
                    value={profile.officeAddress}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        officeAddress: e.target.value,
                      }))
                    }
                    placeholder={
                      locale === "en" ? "Office address" : "辦公室地址"
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">
                  {locale === "en" ? "Professional Bio" : "專業簡介"}
                </Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      bio: e.target.value,
                    }))
                  }
                  placeholder={
                    locale === "en"
                      ? "Tell clients about your experience and approach..."
                      : "向客戶介紹您的經驗和專業方針..."
                  }
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Service Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {locale === "en" ? "Service Areas" : "服務地區"}
              </CardTitle>
              <CardDescription>
                {locale === "en"
                  ? "Select up to 3 areas where you provide insurance services to match customer"
                  : "選擇最多 3 個您提供保險服務的地區以供客戶媒合"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>
                  {locale === "en" ? "Add Service Area" : "新增服務地區"}
                </Label>
                <Select
                  onValueChange={handleServiceAreaAdd}
                  disabled={profile.serviceAreas.length >= 3}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        profile.serviceAreas.length >= 3
                          ? locale === "en"
                            ? "Maximum 3 areas selected"
                            : "已選擇 3 個地區上限"
                          : locale === "en"
                            ? "Select an area to add"
                            : "選擇要新增的地區"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {TAIWAN_AREAS.filter(
                      (area) => !profile.serviceAreas.includes(area.id),
                    ).map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.label[locale as keyof typeof area.label]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {profile.serviceAreas.length > 0 && (
                <div className="space-y-2">
                  <Label>
                    {locale === "en" ? "Selected Areas" : "已選地區"}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {profile.serviceAreas.map((areaId) => {
                      const area = TAIWAN_AREAS.find((a) => a.id === areaId);
                      return (
                        <div
                          key={areaId}
                          className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-md text-sm"
                        >
                          <span>
                            {area?.label[locale as keyof typeof area.label]}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleServiceAreaRemove(areaId)}
                            className="hover:bg-primary/20 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                {locale === "en" ? "Service Categories" : "服務分類"}
              </CardTitle>
              <CardDescription>
                {locale === "en"
                  ? "Select the types of insurance you specialize in"
                  : "選擇您專精的保險類型"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SERVICE_CATEGORIES.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={category.id}
                      checked={profile.serviceCategories.includes(category.id)}
                      onCheckedChange={(checked) =>
                        handleArrayFieldChange(
                          "serviceCategories",
                          category.id,
                          !!checked,
                        )
                      }
                    />
                    <Label htmlFor={category.id} className="text-sm">
                      {category.label[locale as keyof typeof category.label]}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Insurance Companies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                {locale === "en" ? "Insurance Companies" : "保險公司"}
              </CardTitle>
              <CardDescription>
                {locale === "en"
                  ? "Select the insurance companies you represent"
                  : "選擇您代理的保險公司"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {INSURANCE_COMPANIES.map((company) => (
                  <div key={company.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={company.id}
                      checked={profile.insuranceCompanies.includes(company.id)}
                      onCheckedChange={(checked) =>
                        handleArrayFieldChange(
                          "insuranceCompanies",
                          company.id,
                          !!checked,
                        )
                      }
                    />
                    <Label htmlFor={company.id} className="text-sm">
                      {company.label[locale as keyof typeof company.label]}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Specialties */}
          <Card>
            <CardHeader>
              <CardTitle>
                {locale === "en" ? "Specialties" : "專業領域"}
              </CardTitle>
              <CardDescription>
                {locale === "en"
                  ? "Highlight your areas of expertise"
                  : "突顯您的專業領域"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SPECIALTIES.map((specialty) => (
                  <div
                    key={specialty.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={specialty.id}
                      checked={profile.specialties.includes(specialty.id)}
                      onCheckedChange={(checked) =>
                        handleArrayFieldChange(
                          "specialties",
                          specialty.id,
                          !!checked,
                        )
                      }
                    />
                    <Label htmlFor={specialty.id} className="text-sm">
                      {specialty.label[locale as keyof typeof specialty.label]}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving
                ? locale === "en"
                  ? "Saving..."
                  : "儲存中..."
                : locale === "en"
                  ? "Save Profile"
                  : "儲存資料"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
