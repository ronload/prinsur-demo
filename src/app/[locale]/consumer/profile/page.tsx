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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { Save, User, Activity, Heart, MapPin, Briefcase } from "lucide-react";

interface ConsumerProfileProps {
  params: Promise<{ locale: string }>;
}

interface ConsumerProfile {
  age: number;
  weight: number;
  height: number;
  gender: string;
  medicalConditions: string[];
  location: string;
  occupationLevel: string;
}

const MEDICAL_CONDITIONS = [
  { id: "diabetes", label: { "zh-TW": "糖尿病", en: "Diabetes" } },
  { id: "hypertension", label: { "zh-TW": "高血壓", en: "Hypertension" } },
  { id: "heart_disease", label: { "zh-TW": "心臟疾病", en: "Heart Disease" } },
  { id: "asthma", label: { "zh-TW": "哮喘", en: "Asthma" } },
  { id: "cancer", label: { "zh-TW": "癌症", en: "Cancer" } },
  {
    id: "mental_health",
    label: { "zh-TW": "精神健康疾病", en: "Mental Health Conditions" },
  },
  {
    id: "kidney_disease",
    label: { "zh-TW": "腎臟疾病", en: "Kidney Disease" },
  },
  { id: "liver_disease", label: { "zh-TW": "肝臟疾病", en: "Liver Disease" } },
];

const OCCUPATION_LEVELS = [
  {
    id: "level1",
    label: {
      "zh-TW": "職等一：內勤人員、教師、家庭主婦等",
      en: "Level 1: Office workers, teachers, homemakers, etc.",
    },
  },
  {
    id: "level2",
    label: {
      "zh-TW": "職等二：外勤人員、廚師、工程或技師等",
      en: "Level 2: Field workers, chefs, engineers or technicians, etc.",
    },
  },
  {
    id: "level3",
    label: {
      "zh-TW": "職等三：一般軍警、遊覽車司機等",
      en: "Level 3: General military/police, tour bus drivers, etc.",
    },
  },
  {
    id: "level4",
    label: {
      "zh-TW": "職等四：模板工、水電工、計程車司機等",
      en: "Level 4: Concrete workers, plumbers, taxi drivers, etc.",
    },
  },
  {
    id: "level5",
    label: {
      "zh-TW": "職等五：刑警、焊接工、高樓外部清潔工等",
      en: "Level 5: Detectives, welders, high-rise exterior cleaners, etc.",
    },
  },
  {
    id: "level6",
    label: {
      "zh-TW": "職等六：機上服務員、消防隊隊員等",
      en: "Level 6: Flight attendants, firefighters, etc.",
    },
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

export default function ConsumerProfilePage({ params }: ConsumerProfileProps) {
  const { locale } = use(params);
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<ConsumerProfile>({
    age: 0,
    weight: 0,
    height: 0,
    gender: "",
    medicalConditions: [],
    location: "",
    occupationLevel: "",
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
      localStorage.setItem(
        `consumer_profile_${user?.id}`,
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

  const handleMedicalConditionChange = (
    conditionId: string,
    checked: boolean,
  ) => {
    setProfile((prev) => ({
      ...prev,
      medicalConditions: checked
        ? [...prev.medicalConditions, conditionId]
        : prev.medicalConditions.filter((id) => id !== conditionId),
    }));
  };

  const calculateBMI = () => {
    if (profile.weight > 0 && profile.height > 0) {
      const heightInMeters = profile.height / 100;
      return (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  };

  const getBMIStatus = (bmi: number, locale: string) => {
    if (bmi < 18.5) {
      return {
        text: locale === "en" ? "Underweight" : "過輕",
        variant: "secondary" as const,
        color: "text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-950",
      };
    } else if (bmi >= 18.5 && bmi < 24) {
      return {
        text: locale === "en" ? "Normal" : "正常",
        variant: "default" as const,
        color:
          "text-green-700 bg-green-50 dark:text-green-300 dark:bg-green-950",
      };
    } else if (bmi >= 24 && bmi < 27) {
      return {
        text: locale === "en" ? "Overweight" : "過重",
        variant: "outline" as const,
        color:
          "text-orange-700 bg-orange-50 dark:text-orange-300 dark:bg-orange-950",
      };
    } else if (bmi >= 27 && bmi < 30) {
      return {
        text: locale === "en" ? "Mild Obesity" : "輕度肥胖",
        variant: "destructive" as const,
        color: "text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-950",
      };
    } else {
      return {
        text: locale === "en" ? "Obesity" : "肥胖",
        variant: "destructive" as const,
        color: "text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-950",
      };
    }
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
              ? "Complete your personal profile for more accurate premium estimates"
              : "完善個人資料以供更精準的保費預估"}
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        age: parseInt(e.target.value) || 0,
                      }))
                    }
                    placeholder={
                      locale === "en" ? "Enter your age" : "輸入年齡"
                    }
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
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        weight: parseFloat(e.target.value) || 0,
                      }))
                    }
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
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        height: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder={locale === "en" ? "Enter height" : "輸入身高"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">
                    {locale === "en" ? "Gender" : "性別"}
                  </Label>
                  <Select
                    value={profile.gender}
                    onValueChange={(value) =>
                      setProfile((prev) => ({ ...prev, gender: value }))
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
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {calculateBMI() && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <span className="font-medium">BMI: {calculateBMI()}</span>
                    </p>
                    <Badge
                      className={
                        getBMIStatus(parseFloat(calculateBMI()!), locale).color
                      }
                      variant="secondary"
                    >
                      {getBMIStatus(parseFloat(calculateBMI()!), locale).text}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {locale === "en" ? "Location" : "所在地區"}
              </CardTitle>
              <CardDescription>
                {locale === "en"
                  ? "Your location helps us find the nearest insurance agents"
                  : "您的所在地區可幫助我們為您尋找最近的保險業務員"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="location">
                  {locale === "en" ? "Current Location" : "目前所在地區"}
                </Label>
                <Select
                  value={profile.location}
                  onValueChange={(value) =>
                    setProfile((prev) => ({ ...prev, location: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        locale === "en"
                          ? "Select your location"
                          : "選擇您的所在地區"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {TAIWAN_AREAS.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.label[locale as keyof typeof area.label]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Occupation Level */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                {locale === "en" ? "Occupation Level" : "職等"}
              </CardTitle>
              <CardDescription>
                {locale === "en"
                  ? "Select your occupation risk level for insurance assessment"
                  : "選擇您的職業風險等級以進行保險評估"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="occupationLevel">
                  {locale === "en" ? "Occupation Level" : "職業等級"}
                </Label>
                <Select
                  value={profile.occupationLevel}
                  onValueChange={(value) =>
                    setProfile((prev) => ({ ...prev, occupationLevel: value }))
                  }
                >
                  <SelectTrigger className="max-w-xs">
                    <SelectValue
                      placeholder={
                        locale === "en"
                          ? "Select occupation level"
                          : "選擇職業等級"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-w-xs">
                    {OCCUPATION_LEVELS.map((level) => (
                      <SelectItem
                        key={level.id}
                        value={level.id}
                        className="whitespace-normal break-words"
                      >
                        {level.label[locale as keyof typeof level.label]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                  <div
                    key={condition.id}
                    className="flex items-center space-x-2"
                  >
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
