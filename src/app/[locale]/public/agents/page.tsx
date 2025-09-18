"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  Search,
  MapPin,
  Star,
  Phone,
  Mail,
  Calendar,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { HiOutlineUserGroup } from "react-icons/hi2";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockAgents } from "@/data/mock-insurance";
import { useAuth } from "@/contexts/auth-context";
import { sortAgentsByLocation } from "@/utils/recommendations";
import type { InsuranceType } from "@/types/insurance";

interface AgentsPageProps {
  params: Promise<{ locale: string }>;
}

interface AgentFilter {
  specialty?: InsuranceType;
  minRating?: number;
  minExperience?: number;
  language?: string;
  location?: string;
}

interface AgentSortOption {
  id: string;
  label: { "zh-TW": string; en: string };
}

const AGENT_SORT_OPTIONS: AgentSortOption[] = [
  {
    id: "default",
    label: { "zh-TW": "預設排序", en: "Default" },
  },
  {
    id: "location",
    label: { "zh-TW": "地理位置", en: "Location" },
  },
  {
    id: "rating_high_to_low",
    label: { "zh-TW": "評分：高到低", en: "Rating: Decrease" },
  },
  {
    id: "rating_low_to_high",
    label: { "zh-TW": "評分：低到高", en: "Rating: Increase" },
  },
  {
    id: "experience_high_to_low",
    label: { "zh-TW": "年資：高到低", en: "Experience: Decrease" },
  },
  {
    id: "experience_low_to_high",
    label: { "zh-TW": "年資：低到高", en: "Experience: Increase" },
  },
  {
    id: "reviews_high_to_low",
    label: { "zh-TW": "評論數：多到少", en: "Reviews: Decrease" },
  },
  {
    id: "company_az",
    label: { "zh-TW": "公司名稱 A-Z", en: "Company A-Z" },
  },
  {
    id: "name_az",
    label: { "zh-TW": "姓名 A-Z", en: "Name A-Z" },
  },
];

export default function AgentsPage({ params }: AgentsPageProps) {
  const pathname = usePathname();
  const localeFromPath = pathname.split("/")[1] || "zh-TW";
  const [locale, setLocale] = useState<string>(localeFromPath);
  const [searchTerm, setSearchTerm] = useState("");
  const [userLocation, setUserLocation] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("default");
  const [isClient, setIsClient] = useState(false);
  const [filter, setFilter] = useState<AgentFilter>({});
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
  const { user } = useAuth();

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
    const savedSortPreference = localStorage.getItem("agent_sort_preference");
    if (savedSortPreference) {
      setSortBy(savedSortPreference);
    }
  }, []);

  useEffect(() => {
    params.then(({ locale: paramLocale }) => {
      setLocale(paramLocale);
    });
  }, [params]);

  // Load user location from profile
  useEffect(() => {
    if (user?.id) {
      const savedProfile = localStorage.getItem(`consumer_profile_${user.id}`);
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);
          if (profile.location) {
            setUserLocation(profile.location);
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
        }
      }
    }
  }, [user?.id]);

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    // Save to localStorage only on client side
    if (typeof window !== "undefined") {
      localStorage.setItem("agent_sort_preference", newSortBy);
    }
  };

  const handleFilterChange = (
    key: keyof AgentFilter,
    value: string | number | undefined,
  ) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilter({});
  };

  const filteredAndSortedAgents = useMemo(() => {
    // First filter agents based on search term and filters
    const filtered = mockAgents.filter((agent) => {
      // Search term filter
      if (
        searchTerm &&
        !agent.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !agent.company.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !agent.location.city.includes(searchTerm) &&
        !agent.location.district.includes(searchTerm)
      ) {
        return false;
      }

      // Specialty filter
      if (filter.specialty && !agent.specialties.includes(filter.specialty)) {
        return false;
      }

      // Rating filter
      if (filter.minRating && agent.rating < filter.minRating) {
        return false;
      }

      // Experience filter
      if (filter.minExperience && agent.experience < filter.minExperience) {
        return false;
      }

      // Language filter
      if (filter.language && !agent.languages.includes(filter.language)) {
        return false;
      }

      return true;
    });

    // Then sort by selected method
    switch (sortBy) {
      case "location":
        if (userLocation) {
          return sortAgentsByLocation(filtered, userLocation);
        }
        // Fall through to default if no user location
        return filtered.sort((a, b) => {
          if (a.rating !== b.rating) {
            return b.rating - a.rating;
          }
          return b.experience - a.experience;
        });

      case "rating_high_to_low":
        return filtered.sort((a, b) => {
          if (a.rating !== b.rating) {
            return b.rating - a.rating;
          }
          return b.reviewCount - a.reviewCount;
        });

      case "rating_low_to_high":
        return filtered.sort((a, b) => {
          if (a.rating !== b.rating) {
            return a.rating - b.rating;
          }
          return a.reviewCount - b.reviewCount;
        });

      case "experience_high_to_low":
        return filtered.sort((a, b) => {
          if (a.experience !== b.experience) {
            return b.experience - a.experience;
          }
          return b.rating - a.rating;
        });

      case "experience_low_to_high":
        return filtered.sort((a, b) => {
          if (a.experience !== b.experience) {
            return a.experience - b.experience;
          }
          return b.rating - a.rating;
        });

      case "reviews_high_to_low":
        return filtered.sort((a, b) => {
          if (a.reviewCount !== b.reviewCount) {
            return b.reviewCount - a.reviewCount;
          }
          return b.rating - a.rating;
        });

      case "company_az":
        return filtered.sort((a, b) => {
          const companyA = a.company;
          const companyB = b.company;
          if (locale === "zh-TW") {
            return companyA.localeCompare(companyB, "zh-TW");
          } else {
            return companyA.localeCompare(companyB, "en");
          }
        });

      case "name_az":
        return filtered.sort((a, b) => {
          const nameA = a.name;
          const nameB = b.name;
          if (locale === "zh-TW") {
            return nameA.localeCompare(nameB, "zh-TW");
          } else {
            return nameA.localeCompare(nameB, "en");
          }
        });

      default:
        // Default sort by rating and experience, with location boost if available
        if (userLocation) {
          return sortAgentsByLocation(filtered, userLocation);
        }
        return filtered.sort((a, b) => {
          if (a.rating !== b.rating) {
            return b.rating - a.rating;
          }
          return b.experience - a.experience;
        });
    }
  }, [searchTerm, filter, sortBy, userLocation, locale]);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          {locale === "en" ? "Find Agent" : "尋找業務員"}
        </h1>
        <p className="text-muted-foreground">
          {locale === "en"
            ? "Find the most suitable insurance agent based on your location and needs"
            : "根據您的地理位置和需求，找到最適合的保險業務專員"}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={
                    locale === "en"
                      ? "Search agents or locations..."
                      : "搜尋業務員或地區..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="hidden md:flex"
            >
              <X className="h-4 w-4 mr-2" />
              {locale === "en" ? "Clear Filters" : "清除篩選"}
            </Button>
            <Button
              variant="link"
              onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
              className="flex items-center gap-1 h-auto p-0 text-left justify-start select-none touch-manipulation hover:no-underline"
              style={{
                WebkitTapHighlightColor: "transparent",
                WebkitTouchCallout: "none",
                WebkitUserSelect: "none",
                userSelect: "none",
              }}
            >
              <span>
                {isFiltersCollapsed
                  ? locale === "en"
                    ? "Show Filters"
                    : "展開篩選"
                  : locale === "en"
                    ? "Hide Filters"
                    : "隱藏篩選"}
              </span>
              {isFiltersCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Filter Controls */}
          {!isFiltersCollapsed && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-in slide-in-from-top-2 duration-200">
              <div>
                <Label htmlFor="specialty" className="text-sm font-normal">
                  {locale === "en" ? "Specialty" : "專業領域"}
                </Label>
                <Select
                  value={filter.specialty || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "specialty",
                      value === "all" ? undefined : (value as InsuranceType),
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        locale === "en" ? "Select Specialty" : "選擇專業"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {locale === "en" ? "All Specialties" : "所有專業"}
                    </SelectItem>
                    <SelectItem value="life">
                      {locale === "en" ? "Life Insurance" : "壽險"}
                    </SelectItem>
                    <SelectItem value="health">
                      {locale === "en" ? "Health Insurance" : "醫療險"}
                    </SelectItem>
                    <SelectItem value="accident">
                      {locale === "en" ? "Accident Insurance" : "意外險"}
                    </SelectItem>
                    <SelectItem value="travel">
                      {locale === "en" ? "Travel Insurance" : "旅遊險"}
                    </SelectItem>
                    <SelectItem value="vehicle">
                      {locale === "en" ? "Vehicle Insurance" : "車險"}
                    </SelectItem>
                    <SelectItem value="property">
                      {locale === "en" ? "Property Insurance" : "財產險"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="min-rating" className="text-sm font-normal">
                  {locale === "en" ? "Min Rating" : "最低評分"}
                </Label>
                <Input
                  id="min-rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  placeholder={locale === "en" ? "e.g. 4.0" : "如 4.0"}
                  value={filter.minRating || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "minRating",
                      parseFloat(e.target.value) || undefined,
                    )
                  }
                />
              </div>

              <div>
                <Label htmlFor="min-experience" className="text-sm font-normal">
                  {locale === "en" ? "Min Experience" : "最低年資"}
                </Label>
                <Input
                  id="min-experience"
                  type="number"
                  min="0"
                  placeholder={locale === "en" ? "Years" : "年資"}
                  value={filter.minExperience || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "minExperience",
                      parseInt(e.target.value, 10) || undefined,
                    )
                  }
                />
              </div>

              <div>
                <Label htmlFor="language" className="text-sm font-normal">
                  {locale === "en" ? "Language" : "語言"}
                </Label>
                <Select
                  value={filter.language || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "language",
                      value === "all" ? undefined : value,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        locale === "en" ? "Select Language" : "選擇語言"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {locale === "en" ? "All Languages" : "所有語言"}
                    </SelectItem>
                    <SelectItem value="中文">
                      {locale === "en" ? "Chinese" : "中文"}
                    </SelectItem>
                    <SelectItem value="English">
                      {locale === "en" ? "English" : "英文"}
                    </SelectItem>
                    <SelectItem value="日本語">
                      {locale === "en" ? "Japanese" : "日文"}
                    </SelectItem>
                    <SelectItem value="台語">
                      {locale === "en" ? "Taiwanese" : "台語"}
                    </SelectItem>
                    <SelectItem value="客家話">
                      {locale === "en" ? "Hakka" : "客家話"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mobile-only sort by and clear filters row */}
              <div>
                <Label className="text-sm font-normal mb-2">
                  {locale === "en" ? "Sort by" : "排序方式"}
                </Label>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={locale === "en" ? "Select Sort" : "選擇排序"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {AGENT_SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label[locale as keyof typeof option.label]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:hidden">
                <Label className="text-sm font-normal mb-2 text-transparent">
                  .
                </Label>
                <Button
                  variant="default"
                  onClick={clearAllFilters}
                  className="w-full h-9"
                >
                  <span>{locale === "en" ? "Clear filter" : "清空篩選"}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {locale === "en"
            ? `Found ${filteredAndSortedAgents.length} agents matching your criteria`
            : `找到 ${filteredAndSortedAgents.length} 位符合條件的業務專員`}
          {isClient && (
            <>
              {sortBy !== "default" && (
                <span className="ml-2 text-xs text-muted-foreground">
                  (
                  {
                    AGENT_SORT_OPTIONS.find((opt) => opt.id === sortBy)?.label[
                      locale as keyof (typeof AGENT_SORT_OPTIONS)[0]["label"]
                    ]
                  }
                  )
                </span>
              )}
              {sortBy === "location" && userLocation && (
                <span className="ml-2 text-xs text-primary">
                  {locale === "en"
                    ? "(personalized by location)"
                    : "（依個人位置排序）"}
                </span>
              )}
            </>
          )}
        </p>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedAgents.map((agent) => (
          <Card key={agent.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {agent.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <CardDescription>{agent.company}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 text-sm">{agent.rating}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({agent.reviewCount})
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-4">
              {/* Location */}
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                {agent.location.city} {agent.location.district}
              </div>

              {/* Service Areas */}
              <div>
                <div className="text-sm font-medium mb-2">
                  {locale === "en" ? "Service Areas" : "服務地區"}
                </div>
                <div className="flex flex-wrap gap-1">
                  {agent.serviceAreas.map((areaId) => {
                    const areaNames = {
                      taipei: { "zh-TW": "台北市", en: "Taipei City" },
                      "new-taipei": {
                        "zh-TW": "新北市",
                        en: "New Taipei City",
                      },
                      taoyuan: { "zh-TW": "桃園市", en: "Taoyuan City" },
                      taichung: { "zh-TW": "台中市", en: "Taichung City" },
                      tainan: { "zh-TW": "台南市", en: "Tainan City" },
                      kaohsiung: { "zh-TW": "高雄市", en: "Kaohsiung City" },
                      keelung: { "zh-TW": "基隆市", en: "Keelung City" },
                      "hsinchu-city": { "zh-TW": "新竹市", en: "Hsinchu City" },
                      "chiayi-city": { "zh-TW": "嘉義市", en: "Chiayi City" },
                      hsinchu: { "zh-TW": "新竹縣", en: "Hsinchu County" },
                      miaoli: { "zh-TW": "苗栗縣", en: "Miaoli County" },
                      changhua: { "zh-TW": "彰化縣", en: "Changhua County" },
                      nantou: { "zh-TW": "南投縣", en: "Nantou County" },
                      yunlin: { "zh-TW": "雲林縣", en: "Yunlin County" },
                      chiayi: { "zh-TW": "嘉義縣", en: "Chiayi County" },
                      pingtung: { "zh-TW": "屏東縣", en: "Pingtung County" },
                      yilan: { "zh-TW": "宜蘭縣", en: "Yilan County" },
                      hualien: { "zh-TW": "花蓮縣", en: "Hualien County" },
                      taitung: { "zh-TW": "台東縣", en: "Taitung County" },
                    };
                    const areaName =
                      areaNames[areaId as keyof typeof areaNames];
                    return (
                      <Badge key={areaId} variant="outline" className="text-xs">
                        {areaName
                          ? areaName[locale as keyof typeof areaName]
                          : areaId}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Experience */}
              <div className="text-sm">
                <span className="font-medium">
                  {locale === "en" ? "Experience:" : "經驗："}
                </span>
                {agent.experience} {locale === "en" ? "years" : "年"}
              </div>

              {/* Specialties */}
              <div>
                <div className="text-sm font-medium mb-2">
                  {locale === "en" ? "Specialties" : "專業領域"}
                </div>
                <div className="flex flex-wrap gap-1">
                  {agent.specialties.map((specialty) => (
                    <Badge
                      key={specialty}
                      variant="secondary"
                      className="text-xs"
                    >
                      {locale === "en"
                        ? {
                            life: "Life Insurance",
                            health: "Health Insurance",
                            accident: "Accident Insurance",
                            travel: "Travel Insurance",
                            vehicle: "Vehicle Insurance",
                            property: "Property Insurance",
                          }[specialty]
                        : {
                            life: "壽險",
                            health: "醫療險",
                            accident: "意外險",
                            travel: "旅遊險",
                            vehicle: "車險",
                            property: "財產險",
                          }[specialty]}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <div className="text-sm font-medium mb-2">
                  {locale === "en" ? "Languages" : "語言能力"}
                </div>
                <div className="flex flex-wrap gap-1">
                  {agent.languages.map((language) => (
                    <Badge key={language} variant="outline" className="text-xs">
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-mono">{agent.contactInfo.phone}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="text-xs break-all">
                    {agent.contactInfo.email}
                  </span>
                </div>
              </div>
            </CardContent>

            <div className="p-6 pt-0 flex gap-2">
              <Button variant="outline" className="flex-1 min-w-0">
                {locale === "en" ? "View Profile" : "查看檔案"}
              </Button>
              <Button className="flex-1 min-w-0">
                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">
                  {locale === "en" ? "Book Meeting" : "預約會面"}
                </span>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredAndSortedAgents.length === 0 && (
        <div className="text-center py-12">
          <div className="flex justify-center mb-6">
            <HiOutlineUserGroup className="h-24 w-24 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {locale === "en" ? "No agents found" : "沒有找到符合條件的業務專員"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {locale === "en"
              ? "Please try adjusting your search keywords"
              : "請嘗試調整搜尋關鍵字"}
          </p>
          <Button variant="outline" onClick={() => setSearchTerm("")}>
            {locale === "en" ? "Clear Search" : "清除搜尋"}
          </Button>
        </div>
      )}

      {/* CTA Section */}
      <div className="mt-16 bg-muted/50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">
          {locale === "en"
            ? "Can't find the right agent?"
            : "找不到合適的業務專員？"}
        </h2>
        <p className="text-muted-foreground mb-6">
          {locale === "en"
            ? "Tell us your needs and we'll recommend the most suitable insurance expert for you"
            : "告訴我們您的需求，我們會為您推薦最適合的保險專家"}
        </p>
        <Button size="lg">
          {locale === "en" ? "Submit Requirements" : "提交需求"}
        </Button>
      </div>
    </div>
  );
}
