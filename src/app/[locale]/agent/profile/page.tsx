"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { Save, User, Briefcase, Building } from "lucide-react";

interface AgentProfileProps {
  params: Promise<{ locale: string }>;
}

interface AgentProfile {
  licenseNumber: string;
  experience: number;
  serviceCategories: string[];
  insuranceCompanies: string[];
  specialties: string[];
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
  { id: "retirement_planning", label: { "zh-TW": "退休規劃", en: "Retirement Planning" } },
  { id: "family_protection", label: { "zh-TW": "家庭保障", en: "Family Protection" } },
  { id: "investment_insurance", label: { "zh-TW": "投資型保險", en: "Investment Insurance" } },
  { id: "business_insurance", label: { "zh-TW": "企業保險", en: "Business Insurance" } },
  { id: "medical_insurance", label: { "zh-TW": "醫療保險", en: "Medical Insurance" } },
  { id: "disability_insurance", label: { "zh-TW": "失能保險", en: "Disability Insurance" } },
];

export default function AgentProfilePage({ params }: AgentProfileProps) {
  const { locale } = use(params);
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<AgentProfile>({
    licenseNumber: "",
    experience: 0,
    serviceCategories: [],
    insuranceCompanies: [],
    specialties: [],
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
    setIsSaving(true);
    try {
      // Save to localStorage (mock implementation)
      localStorage.setItem(`agent_profile_${user?.id}`, JSON.stringify(profile));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert(locale === "en" ? "Profile saved successfully!" : "個人資料已成功儲存！");
    } catch (error) {
      alert(locale === "en" ? "Failed to save profile" : "儲存失敗");
    } finally {
      setIsSaving(false);
    }
  };

  const handleArrayFieldChange = (field: keyof Pick<AgentProfile, 'serviceCategories' | 'insuranceCompanies' | 'specialties'>, itemId: string, checked: boolean) => {
    setProfile(prev => ({
      ...prev,
      [field]: checked
        ? [...prev[field], itemId]
        : prev[field].filter(id => id !== itemId)
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-6 md:container md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
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
                  </Label>
                  <Input
                    id="license"
                    value={profile.licenseNumber}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      licenseNumber: e.target.value
                    }))}
                    placeholder={locale === "en" ? "Enter license number" : "輸入執照號碼"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">
                    {locale === "en" ? "Years of Experience" : "工作經驗（年）"}
                  </Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    max="50"
                    value={profile.experience || ""}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      experience: parseInt(e.target.value) || 0
                    }))}
                    placeholder={locale === "en" ? "Years" : "年"}
                  />
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
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      contactPhone: e.target.value
                    }))}
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
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      officeAddress: e.target.value
                    }))}
                    placeholder={locale === "en" ? "Office address" : "辦公室地址"}
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
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    bio: e.target.value
                  }))}
                  placeholder={locale === "en"
                    ? "Tell clients about your experience and approach..."
                    : "向客戶介紹您的經驗和專業方針..."}
                  rows={4}
                />
              </div>
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
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.id}
                      checked={profile.serviceCategories.includes(category.id)}
                      onCheckedChange={(checked) =>
                        handleArrayFieldChange('serviceCategories', category.id, !!checked)
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
                        handleArrayFieldChange('insuranceCompanies', company.id, !!checked)
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
                  <div key={specialty.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={specialty.id}
                      checked={profile.specialties.includes(specialty.id)}
                      onCheckedChange={(checked) =>
                        handleArrayFieldChange('specialties', specialty.id, !!checked)
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
                ? (locale === "en" ? "Saving..." : "儲存中...")
                : (locale === "en" ? "Save Profile" : "儲存資料")
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}