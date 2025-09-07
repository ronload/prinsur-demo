/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, use } from "react";
import { useTranslations } from "next-intl";
import { Search, Star, Building2, X } from "lucide-react";
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
import { InsuranceFilter, InsuranceType } from "@/types/insurance";

export default function InsurancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<InsuranceFilter>({});

  const filteredProducts = useMemo(
    () =>
      mockInsuranceProducts.filter((product) => {
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
          (product.ageRange.min > filter.age ||
            product.ageRange.max < filter.age)
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
      }),
    [searchTerm, filter],
  );

  const handleFilterChange = (key: keyof InsuranceFilter, value: any) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilter({});
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("zh-TW", {
      style: "currency",
      currency: "TWD",
      minimumFractionDigits: 0,
    }).format(amount);

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
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜尋保險商品或公司..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            <X className="h-4 w-4 mr-2" />
            清除篩選
          </Button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="insurance-type">保險類型</Label>
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
                <SelectValue placeholder="選擇類型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部類型</SelectItem>
                <SelectItem value="life">
                  {t("insurance.types.life")}
                </SelectItem>
                <SelectItem value="health">
                  {t("insurance.types.health")}
                </SelectItem>
                <SelectItem value="accident">
                  {t("insurance.types.accident")}
                </SelectItem>
                <SelectItem value="travel">
                  {t("insurance.types.travel")}
                </SelectItem>
                <SelectItem value="vehicle">
                  {t("insurance.types.vehicle")}
                </SelectItem>
                <SelectItem value="property">
                  {t("insurance.types.property")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="age">年齡</Label>
            <Input
              id="age"
              type="number"
              placeholder="輸入年齡"
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
            <Label htmlFor="min-premium">最低保費</Label>
            <Input
              id="min-premium"
              type="number"
              placeholder="最低金額"
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
            <Label htmlFor="max-premium">最高保費</Label>
            <Input
              id="max-premium"
              type="number"
              placeholder="最高金額"
              value={filter.maxPremium || ""}
              onChange={(e) =>
                handleFilterChange(
                  "maxPremium",
                  parseInt(e.target.value, 10) || undefined,
                )
              }
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          找到 {filteredProducts.length} 個符合條件的保險商品
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  {t(`insurance.types.${product.type}`)}
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
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(product.premium.monthly)}
                  <span className="text-sm font-normal text-muted-foreground">
                    /月
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  年繳 {formatCurrency(product.premium.annually)}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">保障內容</h4>
                <div className="text-lg font-semibold text-green-600 mb-2">
                  最高 {formatCurrency(product.coverage.amount)}
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {product.coverage.description.slice(0, 2).map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                  {product.coverage.description.length > 2 && (
                    <li>
                      • 還有 {product.coverage.description.length - 2} 項保障...
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
              <Button variant="outline" className="flex-1">
                查看詳情
              </Button>
              <Button className="flex-1">立即申請</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">
            沒有找到符合條件的保險商品
          </h3>
          <p className="text-muted-foreground mb-4">
            請嘗試調整搜尋條件或篩選器
          </p>
          <Button variant="outline" onClick={clearAllFilters}>
            清除所有篩選
          </Button>
        </div>
      )}
    </div>
  );
}
