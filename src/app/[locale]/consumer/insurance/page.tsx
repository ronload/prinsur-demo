/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Star,
  Building2,
  X,
  Calculator,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { mockInsuranceProducts } from "@/data/mock-insurance";
import {
  InsuranceFilter,
  InsuranceType,
  InsuranceProduct,
} from "@/types/insurance";
import { ProductDetailModal } from "@/components/insurance/product-detail-modal";
import { useAuth } from "@/contexts/auth-context";
import {
  getPremiumDisplayStatus,
  UserProfile,
} from "@/utils/premium-calculator";
import { sortProducts } from "@/utils/recommendations";

interface InsurancePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ search?: string }>;
}

interface SortOption {
  id: string;
  label: { "zh-TW": string; en: string };
  description: { "zh-TW": string; en: string };
}

const SORT_OPTIONS: SortOption[] = [
  {
    id: "default",
    label: { "zh-TW": "預設排序", en: "Default" },
    description: {
      "zh-TW": "綜合評分與熱度",
      en: "Combined rating & popularity",
    },
  },
  {
    id: "personalized",
    label: { "zh-TW": "個人化推薦", en: "Personalized" },
    description: {
      "zh-TW": "根據您的個人資料推薦",
      en: "Based on your profile",
    },
  },
  {
    id: "premium_low_to_high",
    label: { "zh-TW": "保費：低到高", en: "Premium: Increase" },
    description: {
      "zh-TW": "月繳保費由低至高排序",
      en: "Monthly premium ascending",
    },
  },
  {
    id: "premium_high_to_low",
    label: { "zh-TW": "保費：高到低", en: "Premium: Decrease" },
    description: {
      "zh-TW": "月繳保費由高至低排序",
      en: "Monthly premium descending",
    },
  },
  {
    id: "coverage_high_to_low",
    label: { "zh-TW": "保障額度：高到低", en: "Coverage: Decrease" },
    description: {
      "zh-TW": "保障金額由高至低排序",
      en: "Coverage amount descending",
    },
  },
  {
    id: "rating_high_to_low",
    label: { "zh-TW": "評分：高到低", en: "Rating: Descrease" },
    description: {
      "zh-TW": "產品評分由高至低排序",
      en: "Product rating descending",
    },
  },
  {
    id: "popularity",
    label: { "zh-TW": "最受歡迎", en: "Most Popular" },
    description: { "zh-TW": "依評論數量排序", en: "Based on review count" },
  },
  {
    id: "newest",
    label: { "zh-TW": "最新上市", en: "Newest" },
    description: {
      "zh-TW": "新上市產品優先",
      en: "Recently launched products first",
    },
  },
  {
    id: "company_az",
    label: { "zh-TW": "公司名稱 A-Z", en: "Company A-Z" },
    description: { "zh-TW": "保險公司名稱排序", en: "Insurance company name" },
  },
];

export default function InsurancePage({
  params,
  searchParams,
}: InsurancePageProps) {
  const pathname = usePathname();
  const router = useRouter();
  const localeFromPath = pathname.split("/")[1] || "zh-TW";
  const [locale, setLocale] = useState<string>(localeFromPath);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<InsuranceFilter>({});
  const [selectedProduct, setSelectedProduct] =
    useState<InsuranceProduct | null>(null);
  const [sortBy, setSortBy] = useState<string>("default");
  const [isClient, setIsClient] = useState(false);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile>({});

  useEffect(() => {
    params.then(({ locale: paramLocale }) => {
      setLocale(paramLocale);
    });
  }, [params]);

  // Handle client-side hydration and localStorage
  useEffect(() => {
    setIsClient(true);
    const savedSortPreference = localStorage.getItem(
      "insurance_sort_preference",
    );
    if (savedSortPreference) {
      setSortBy(savedSortPreference);
    }
  }, []);

  useEffect(() => {
    searchParams.then(({ search }) => {
      if (search) {
        setSearchTerm(decodeURIComponent(search));
      }
    });
  }, [searchParams]);

  // Load user profile for premium calculation
  useEffect(() => {
    if (user?.id) {
      const savedProfile = localStorage.getItem(`consumer_profile_${user.id}`);
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);
          setUserProfile({
            age: profile.age,
            weight: profile.weight,
            height: profile.height,
            medicalConditions: profile.medicalConditions,
          });
        } catch (error) {
          console.error("Error loading user profile:", error);
        }
      }
    }
  }, [user?.id]);

  const filteredAndSortedProducts = useMemo(() => {
    // First filter products based on search term and filters
    const filtered = mockInsuranceProducts.filter((product) => {
      // Search term filter
      if (
        searchTerm &&
        !product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !product.company.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Type filter
      if (filter.type && product.type !== filter.type) {
        return false;
      }

      // Age filter
      if (
        filter.age &&
        (product.ageRange.min > filter.age || product.ageRange.max < filter.age)
      ) {
        return false;
      }

      // Premium filter
      if (filter.minPremium && product.premium.monthly < filter.minPremium) {
        return false;
      }
      if (filter.maxPremium && product.premium.monthly > filter.maxPremium) {
        return false;
      }

      return true;
    });

    // Then sort by selected method
    return sortProducts(filtered, sortBy, userProfile, locale);
  }, [searchTerm, filter, sortBy, userProfile, locale]);

  const handleFilterChange = (key: keyof InsuranceFilter, value: any) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    // Save to localStorage only on client side
    if (typeof window !== "undefined") {
      localStorage.setItem("insurance_sort_preference", newSortBy);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilter({});
  };

  const formatCurrency = (amount: number, locale: "zh-TW" | "en" = "zh-TW") => {
    if (locale === "en") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
      }).format(amount);
    }

    return new Intl.NumberFormat("zh-TW", {
      style: "currency",
      currency: "TWD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          {locale === "en" ? "Compare Insurance" : "比較保險"}
        </h1>
        <p className="text-muted-foreground">
          {locale === "en"
            ? "Compare insurance products from different companies to find the best plan for you"
            : "比較各家保險公司的商品，找到最適合您的保險方案"}
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
                      ? "Search insurance products or companies..."
                      : "搜尋保險商品或公司..."
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
              className="hidden md:flex h-9"
            >
              <X className="h-4 w-4 mr-2" />
              {locale === "en" ? "Clear Filters" : "清除篩選"}
            </Button>
            <Button
              variant="link"
              onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
              className="flex items-center gap-1 h-auto p-0 text-left justify-start"
            >
              <span>
                {isFiltersCollapsed
                  ? (locale === "en" ? "Show Filters" : "展開篩選")
                  : (locale === "en" ? "Hide Filters" : "隱藏篩選")
                }
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
              <Label htmlFor="insurance-type" className="text-sm font-normal">
                {locale === "en" ? "Insurance Type" : "保險類型"}
              </Label>
              <Select
                value={filter.type || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "type",
                    value === "all" ? undefined : (value as InsuranceType),
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={locale === "en" ? "Select Type" : "選擇類型"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {locale === "en" ? "All Types" : "全部類型"}
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
              <Label htmlFor="age" className="text-sm font-normal">
                {locale === "en" ? "Age" : "年齡"}
              </Label>
              <Input
                id="age"
                type="number"
                placeholder={locale === "en" ? "Enter age" : "輸入年齡"}
                value={filter.age || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "age",
                    parseInt(e.target.value, 10) || undefined,
                  )
                }
              />
            </div>

            <div>
              <Label htmlFor="min-premium" className="text-sm font-normal">
                {locale === "en" ? "Min Premium" : "最低保費"}
              </Label>
              <Input
                id="min-premium"
                type="number"
                placeholder={locale === "en" ? "Min amount" : "最低金額"}
                value={filter.minPremium || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "minPremium",
                    parseInt(e.target.value, 10) || undefined,
                  )
                }
              />
            </div>

            <div>
              <Label htmlFor="max-premium" className="text-sm font-normal">
                {locale === "en" ? "Max Premium" : "最高保費"}
              </Label>
              <Input
                id="max-premium"
                type="number"
                placeholder={locale === "en" ? "Max amount" : "最高金額"}
                value={filter.maxPremium || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "maxPremium",
                    parseInt(e.target.value, 10) || undefined,
                  )
                }
              />
            </div>

            {/* Sort by selector - always visible */}
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
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label[locale as keyof typeof option.label]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mobile-only clear filter button */}
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
            ? `Found ${filteredAndSortedProducts.length} insurance products matching your criteria`
            : `找到 ${filteredAndSortedProducts.length} 個符合條件的保險商品`}
          {isClient &&
            sortBy === "personalized" &&
            userProfile &&
            (userProfile.age ||
              userProfile.weight ||
              userProfile.height ||
              userProfile.gender) && (
              <span className="ml-2 text-xs text-primary">
                {locale === "en"
                  ? "(personalized recommendations)"
                  : "（個人化推薦）"}
              </span>
            )}
          {isClient && sortBy !== "default" && sortBy !== "personalized" && (
            <span className="ml-2 text-xs text-muted-foreground">
              (
              {
                SORT_OPTIONS.find((opt) => opt.id === sortBy)?.label[
                  locale as keyof (typeof SORT_OPTIONS)[0]["label"]
                ]
              }
              )
            </span>
          )}
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedProducts.map((product) => (
          <Card key={product.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  {locale === "en"
                    ? {
                        life: "Life Insurance",
                        health: "Health Insurance",
                        accident: "Accident Insurance",
                        travel: "Travel Insurance",
                        vehicle: "Vehicle Insurance",
                        property: "Property Insurance",
                      }[product.type]
                    : {
                        life: "壽險",
                        health: "醫療險",
                        accident: "意外險",
                        travel: "旅遊險",
                        vehicle: "車險",
                        property: "財產險",
                      }[product.type]}
                </Badge>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 text-sm">{product.rating}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({product.reviewCount})
                  </span>
                </div>
              </div>
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <CardDescription className="flex items-center">
                <Building2 className="h-4 w-4 mr-1" />
                {product.company}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              <div className="mb-4">
                {(() => {
                  const premiumStatus = getPremiumDisplayStatus(
                    product,
                    userProfile,
                    !!user,
                    locale as "zh-TW" | "en",
                  );

                  if (premiumStatus.type === "calculated") {
                    return (
                      <>
                        <div className="text-2xl font-bold text-primary">
                          {premiumStatus.content}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {locale === "en" ? "Annual" : "年繳"}{" "}
                          {premiumStatus.estimate?.annualPremium &&
                            formatCurrency(
                              premiumStatus.estimate?.annualPremium,
                              locale as "zh-TW" | "en",
                            )}
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          <Calculator className="h-3 w-3 inline mr-1" />
                          {locale === "en"
                            ? "Personalized estimate"
                            : "個人化預估"}
                        </div>
                      </>
                    );
                  } else if (premiumStatus.type === "missing_data") {
                    return (
                      <div className="text-center">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() =>
                            router.push(`/${locale}/consumer/profile`)
                          }
                        >
                          {locale === "en"
                            ? "Complete Profile for Premium Estimate"
                            : "完善個人資料以取得專屬保費預估"}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    );
                  } else {
                    return (
                      <div className="text-center">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => router.push(`/${locale}/login`)}
                        >
                          {locale === "en"
                            ? "Login for Premium Estimate"
                            : "登入以取得專屬保費預估"}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    );
                  }
                })()}
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">
                  {locale === "en" ? "Coverage" : "保障內容"}
                </h4>
                <div className="text-lg font-semibold text-green-600 mb-2">
                  {locale === "en" ? "Up to" : "最高"}{" "}
                  {formatCurrency(product.coverage.amount)}
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {product.coverage.description.slice(0, 2).map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                  {product.coverage.description.length > 2 && (
                    <li>
                      {locale === "en"
                        ? `• And ${product.coverage.description.length - 2} more benefits...`
                        : `• 還有 ${product.coverage.description.length - 2} 項保障...`}
                    </li>
                  )}
                </ul>
              </div>

              <div className="flex flex-wrap gap-1">
                {product.features.slice(0, 3).map((feature) => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </CardContent>

            <CardFooter className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedProduct(product)}
              >
                {locale === "en" ? "View Details" : "查看詳情"}
              </Button>
              <Button className="flex-1">
                {locale === "en" ? "Apply Now" : "立即申請"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredAndSortedProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">
            {locale === "en"
              ? "No insurance products found"
              : "沒有找到符合條件的保險商品"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {locale === "en"
              ? "Try adjusting your search terms or filters"
              : "請嘗試調整搜尋條件或篩選器"}
          </p>
          <Button variant="outline" onClick={clearAllFilters}>
            {locale === "en" ? "Clear All Filters" : "清除所有篩選"}
          </Button>
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        locale={locale}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
