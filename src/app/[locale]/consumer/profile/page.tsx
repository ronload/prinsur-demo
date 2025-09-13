"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/auth-context";
import { Save, User, Activity, Heart } from "lucide-react";

interface ConsumerProfileProps {
  params: Promise<{ locale: string }>;
}

interface ConsumerProfile {
  age: number;
  weight: number;
  height: number;
  medicalConditions: string[];
}

const MEDICAL_CONDITIONS = [
  { id: "diabetes", label: { "zh-TW": "糖尿病", en: "Diabetes" } },
  { id: "hypertension", label: { "zh-TW": "高血壓", en: "Hypertension" } },
  { id: "heart_disease", label: { "zh-TW": "心臟疾病", en: "Heart Disease" } },
  { id: "asthma", label: { "zh-TW": "哮喘", en: "Asthma" } },
  { id: "cancer", label: { "zh-TW": "癌症", en: "Cancer" } },
  { id: "mental_health", label: { "zh-TW": "精神健康疾病", en: "Mental Health Conditions" } },
  { id: "kidney_disease", label: { "zh-TW": "腎臟疾病", en: "Kidney Disease" } },
  { id: "liver_disease", label: { "zh-TW": "肝臟疾病", en: "Liver Disease" } },
];

export default function ConsumerProfilePage({ params }: ConsumerProfileProps) {
  const { locale } = use(params);
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<ConsumerProfile>({
    age: 0,
    weight: 0,
    height: 0,
    medicalConditions: [],
  });

  // Load existing profile data (mock implementation)
  useEffect(() => {
    if (user?.id) {
      const savedProfile = localStorage.getItem(`consumer_profile_${user.id}`);
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    }
  }, [user?.id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage (mock implementation)
      localStorage.setItem(`consumer_profile_${user?.id}`, JSON.stringify(profile));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert(locale === "en" ? "Profile saved successfully!" : "個人資料已成功儲存！");
    } catch (error) {
      alert(locale === "en" ? "Failed to save profile" : "儲存失敗");
    } finally {
      setIsSaving(false);
    }
  };

  const handleMedicalConditionChange = (conditionId: string, checked: boolean) => {
    setProfile(prev => ({
      ...prev,
      medicalConditions: checked
        ? [...prev.medicalConditions, conditionId]
        : prev.medicalConditions.filter(id => id !== conditionId)
    }));
  };

  const calculateBMI = () => {
    if (profile.weight > 0 && profile.height > 0) {
      const heightInMeters = profile.height / 100;
      return (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-6 md:container md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {locale === "en" ? "Personal Profile" : "個人資料"}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {locale === "en"
              ? "Manage your personal information for better insurance recommendations"
              : "管理您的個人資料以獲得更好的保險推薦"}
          </p>
        </div>

        <div className="grid gap-6 md:gap-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {locale === "en" ? "Basic Information" : "基本資料"}
              </CardTitle>
              <CardDescription>
                {locale === "en"
                  ? "Your age and physical measurements"
                  : "您的年齡和身體測量數據"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">
                    {locale === "en" ? "Age" : "年齡"}
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    min="0"
                    max="120"
                    value={profile.age || ""}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      age: parseInt(e.target.value) || 0
                    }))}
                    placeholder={locale === "en" ? "Enter your age" : "輸入年齡"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">
                    {locale === "en" ? "Weight (kg)" : "體重 (公斤)"}
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    min="0"
                    max="500"
                    value={profile.weight || ""}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      weight: parseFloat(e.target.value) || 0
                    }))}
                    placeholder={locale === "en" ? "Enter weight" : "輸入體重"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">
                    {locale === "en" ? "Height (cm)" : "身高 (公分)"}
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    min="0"
                    max="300"
                    value={profile.height || ""}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      height: parseFloat(e.target.value) || 0
                    }))}
                    placeholder={locale === "en" ? "Enter height" : "輸入身高"}
                  />
                </div>
              </div>

              {calculateBMI() && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span className="font-medium">BMI: {calculateBMI()}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medical Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                {locale === "en" ? "Medical History" : "病史資料"}
              </CardTitle>
              <CardDescription>
                {locale === "en"
                  ? "Select any medical conditions that apply to you"
                  : "選擇適用於您的醫療狀況"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MEDICAL_CONDITIONS.map((condition) => (
                  <div key={condition.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={condition.id}
                      checked={profile.medicalConditions.includes(condition.id)}
                      onCheckedChange={(checked) =>
                        handleMedicalConditionChange(condition.id, !!checked)
                      }
                    />
                    <Label htmlFor={condition.id} className="text-sm">
                      {condition.label[locale as keyof typeof condition.label]}
                    </Label>
                  </div>
                ))}
              </div>

              {profile.medicalConditions.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    {locale === "en"
                      ? "Note: Medical conditions may affect insurance coverage and pricing."
                      : "注意：病史可能會影響保險承保範圍和定價。"}
                  </p>
                </div>
              )}
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