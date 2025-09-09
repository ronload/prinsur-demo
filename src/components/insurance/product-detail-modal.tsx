import { Star, Building2, X, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InsuranceProduct } from "@/types/insurance";

interface ProductDetailModalProps {
  product: InsuranceProduct | null;
  locale: string;
  onClose: () => void;
}

export function ProductDetailModal({ 
  product, 
  locale, 
  onClose 
}: ProductDetailModalProps) {
  if (!product) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("zh-TW", {
      style: "currency",
      currency: "TWD",
      minimumFractionDigits: 0,
    }).format(amount);

  const getInsuranceTypeLabel = (type: string) => {
    const labels = {
      life: locale === "en" ? "Life Insurance" : "壽險",
      health: locale === "en" ? "Health Insurance" : "醫療險", 
      accident: locale === "en" ? "Accident Insurance" : "意外險",
      travel: locale === "en" ? "Travel Insurance" : "旅遊險",
      vehicle: locale === "en" ? "Vehicle Insurance" : "車險",
      property: locale === "en" ? "Property Insurance" : "財產險"
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[85vh] overflow-y-auto rounded-lg">
        <DialogHeader className="text-left">
          <div className="flex items-start justify-between">
            <div className="flex-1 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <Badge variant="secondary" className="w-fit">
                  {getInsuranceTypeLabel(product.type)}
                </Badge>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 text-sm font-medium">{product.rating}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({product.reviewCount} {locale === "en" ? "reviews" : "評價"})
                  </span>
                </div>
              </div>
              <DialogTitle className="text-2xl text-left">{product.name}</DialogTitle>
              <DialogDescription className="flex items-center mt-2 text-left">
                <Building2 className="h-4 w-4 mr-1" />
                {product.company}
              </DialogDescription>
              
              {/* Product Features Tags */}
              <div className="flex flex-wrap gap-2 mt-3">
                {product.features.map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Left Column - Pricing Information */}
          <div className="flex flex-col">
            {/* Pricing Card */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-lg">
                  {locale === "en" ? "Premium & Policy Information" : "保費與保單資訊"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold text-primary">
                    {formatCurrency(product.premium.monthly)}
                    <span className="text-base font-normal text-muted-foreground">
                      {locale === "en" ? "/month" : "/月"}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {locale === "en" ? "Annual Premium" : "年繳保費"}: {formatCurrency(product.premium.annually)}
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {locale === "en" ? "Age Range" : "適用年齡"}
                      </div>
                      <div className="font-semibold">
                        {product.ageRange.min} - {product.ageRange.max} {locale === "en" ? "years" : "歲"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {locale === "en" ? "Payment Term" : "繳費年期"}
                      </div>
                      <div className="font-semibold">
                        {locale === "en" ? "Flexible" : "彈性繳費"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {locale === "en" ? "Policy Term" : "保障期間"}
                      </div>
                      <div className="font-semibold">
                        {locale === "en" ? "Renewable" : "可續保"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {locale === "en" ? "Waiting Period" : "等待期"}
                      </div>
                      <div className="font-semibold">
                        {locale === "en" ? "30 days" : "30天"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {locale === "en" ? "Grace Period" : "寬限期"}
                      </div>
                      <div className="font-semibold">
                        {locale === "en" ? "31 days" : "31天"}
                      </div>
                    </div>
                    <div>
                      {/* Empty space for balanced layout */}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Coverage Details */}
          <div className="flex flex-col">
            {/* Coverage Card */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {locale === "en" ? "Coverage Details" : "保障內容"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                <div>
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {locale === "en" ? "Up to" : "最高保障"} {formatCurrency(product.coverage.amount)}
                  </div>
                </div>
                
                <div className="space-y-3">
                  {product.coverage.description.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {locale === "en" ? "Close" : "關閉"}
          </Button>
          <Button className="flex-1">
            {locale === "en" ? "Apply Now" : "立即申請"}
          </Button>
          <Button variant="secondary" className="flex-1">
            {locale === "en" ? "Add to Compare" : "加入比較"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}