"use client";

import { Button } from "@/components/ui/button";
import { GridPattern } from "@/components/ui/GridPattern";
import {
  useRevealAnimation,
  useStaggeredReveal,
} from "@/hooks/use-reveal-animation";
import { cn } from "@/lib/utils";
import { Search, Users, FileText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface HomeProps {
  params: Promise<{ locale: string }>;
}

export default function Home({ params }: HomeProps) {
  const [locale, setLocale] = useState<string>("zh-TW");

  // Animation hooks with staggered delays for smooth reveal effect
  const titleAnimation = useRevealAnimation({
    delay: 200,
    duration: 1000,
    distance: 40,
  });
  const subtitleAnimation = useRevealAnimation({
    delay: 800,
    duration: 800,
    distance: 30,
  });
  const buttonsAnimation = useRevealAnimation({
    delay: 1200,
    duration: 800,
    distance: 30,
  });
  const descriptionAnimation = useRevealAnimation({
    delay: 1600,
    duration: 800,
    distance: 30,
  });
  const featuresAnimation = useStaggeredReveal(3, 200);

  useEffect(() => {
    params.then(({ locale: paramLocale }) => {
      setLocale(paramLocale);
    });
  }, [params]);
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center -mt-16 relative overflow-hidden">
        <GridPattern
          x={500}
          y={500}
          squares={[
            [4, 4],
            [5, 1],
            [8, 2],
            [5, 3],
            [5, 5],
            [10, 10],
            [12, 15],
            [15, 10],
            [10, 15],
            [14, 12],
            [11, 16],
            [16, 8],
          ]}
          className={cn(
            "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12",
          )}
        />
        <div className="container max-w-7xl mx-auto text-center py-6 relative z-10">
          <h1
            ref={titleAnimation.ref}
            style={titleAnimation.animationStyle}
            className="text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight mb-8"
          >
            Prinsur.com
          </h1>
          <p
            ref={subtitleAnimation.ref}
            style={subtitleAnimation.animationStyle}
            className="text-2xl lg:text-3xl text-muted-foreground mb-8 leading-relaxed"
          >
            {locale === "en"
              ? "A transparent, efficient, and user-centric insurance ecosystem"
              : "一個透明、高效且以使用者為中心的保險生態系統"}
          </p>
          <div
            ref={buttonsAnimation.ref}
            style={buttonsAnimation.animationStyle}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center my-16 px-6"
          >
            <Button
              size="lg"
              className="h-12 px-8 text-lg w-full sm:w-auto max-w-48"
              asChild
            >
              <Link href={`/${locale}/insurance`}>
                {locale === "en" ? "Get Started" : "立即開始"}
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8 text-lg w-full sm:w-auto max-w-48"
            >
              {locale === "en" ? "Learn More" : "了解更多"}
            </Button>
          </div>
          <div 
            ref={descriptionAnimation.ref}
            style={descriptionAnimation.animationStyle}
            className="max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-12">
              <div className="text-center">
                <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
                  {locale === "en" ? "Higher Success Rate" : "成交率提升"}
                </p>
                <div className="text-2xl sm:text-3xl lg:text-5xl font-bold text-primary mb-1 my-1 sm:my-2">
                  85%
                </div>
                <p className="text-xs lg:text-sm text-muted-foreground/70 mt-1">
                  {locale === "en" ? "vs traditional methods" : "相較傳統方式"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
                  {locale === "en" ? "Premium Savings" : "保費節省"}
                </p>
                <div className="text-2xl sm:text-3xl lg:text-5xl font-bold text-primary mb-1 my-1 sm:my-2">
                  30%
                </div>
                <p className="text-xs lg:text-sm text-muted-foreground/70 mt-1">
                  {locale === "en" ? "through smart comparison" : "透過智慧比價"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
                  {locale === "en" ? "Fast Matching" : "快速媒合"}
                </p>
                <div className="text-2xl sm:text-3xl lg:text-5xl font-bold text-primary mb-1 my-1 sm:my-2">
                  24h
                </div>
                <p className="text-xs lg:text-sm text-muted-foreground/70 mt-1">
                  {locale === "en" ? "average response time" : "平均回應時間"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-t relative">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-medium mb-4">
              {locale === "en" ? "Core Features" : "核心功能"}
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {locale === "en"
                ? "Complete insurance service ecosystem for consumers and agents"
                : "為消費者、業務員提供完整的保險服務生態系統"}
            </p>
          </div>
          <div
            ref={featuresAnimation.ref}
            className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto"
          >
            <div
              style={featuresAnimation.getItemStyle(0)}
              className="text-center group"
            >
              <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-6">
                <Search className="h-5 w-5 text-foreground transition-transform group-hover:scale-110" />
              </div>
              <h3 className="text-lg font-medium mb-3">
                {locale === "en" ? "Smart Comparison" : "智慧比價"}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {locale === "en"
                  ? "Transparent insurance product comparison to help you easily find the most suitable insurance plan"
                  : "透明的保險商品比價，讓您輕鬆找到最適合的保險方案"}
              </p>
            </div>
            <div
              style={featuresAnimation.getItemStyle(1)}
              className="text-center group"
            >
              <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-6">
                <Users className="h-5 w-5 text-foreground transition-transform group-hover:scale-110" />
              </div>
              <h3 className="text-lg font-medium mb-3">
                {locale === "en" ? "Precise Matching" : "精準媒合"}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {locale === "en"
                  ? "Precise matching of suitable insurance agents based on location and needs"
                  : "根據地理位置和需求，精準媒合合適的保險業務專員"}
              </p>
            </div>
            <div
              style={featuresAnimation.getItemStyle(2)}
              className="text-center group"
            >
              <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-6">
                <FileText className="h-5 w-5 text-foreground transition-transform group-hover:scale-110" />
              </div>
              <h3 className="text-lg font-medium mb-3">
                {locale === "en" ? "Policy Management" : "保單管理"}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {locale === "en"
                  ? "Complete policy management system with automatic payment and expiry reminders"
                  : "完整的保單管理系統，自動提醒繳費和到期時間"}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
