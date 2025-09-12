"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GridPattern } from "@/components/ui/GridPattern";
import TextType from "@/components/ui/TextType";
import "@/components/ui/TextType.css";
import {
  useRevealAnimation,
  useStaggeredReveal,
} from "@/hooks/use-reveal-animation";
import { cn } from "@/lib/utils";
import { Search, Users, FileText } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface HomeProps {
  params: Promise<{ locale: string }>;
}

export default function Home({ params }: HomeProps) {
  const pathname = usePathname();
  const localeFromPath = pathname.split("/")[1] || "zh-TW";
  const [locale, setLocale] = useState<string>(localeFromPath);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const router = useRouter();

  // Animation hooks - synchronized animations without stagger
  const [showTextType, setShowTextType] = useState(false);
  const loginSuggestionAnimation = useRevealAnimation({
    delay: 200,
    duration: 800,
    distance: 30,
  });
  const descriptionAnimation = useRevealAnimation({
    delay: 200,
    duration: 800,
    distance: 30,
  });
  const featuresAnimation = useStaggeredReveal(3, 200);

  // Trigger TextType after other animations complete
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTextType(true);
    }, 600); // Reduced delay for immediate start after animations begin

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    params.then(({ locale: paramLocale }) => {
      setLocale(paramLocale);
    });
  }, [params]);

  // Force page to top on mount/refresh
  useEffect(() => {
    // Disable browser scroll restoration
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    // Multiple attempts to ensure scroll to top
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    };

    // Immediate scroll
    scrollToTop();

    // Delayed scroll to override any browser restoration
    setTimeout(scrollToTop, 0);
    setTimeout(scrollToTop, 100);

    // Also listen for window load
    const handleLoad = () => scrollToTop();
    window.addEventListener("load", handleLoad);

    return () => {
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  // Handle mobile keyboard issues
  useEffect(() => {
    const handleInputBlur = () => {
      // Force page to scroll back to top when keyboard disappears
      setTimeout(() => {
        window.scrollTo(0, 0);
        // Force viewport recalculation
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        // Trigger a resize to fix viewport
        window.dispatchEvent(new Event("resize"));
      }, 100);
    };

    const searchInput = document.querySelector('input[type="text"]');
    if (searchInput) {
      searchInput.addEventListener("blur", handleInputBlur);
      return () => {
        searchInput.removeEventListener("blur", handleInputBlur);
      };
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/${locale}/insurance?search=${encodeURIComponent(searchQuery.trim())}`,
      );
    }
  };
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center -mt-16 relative overflow-hidden">
        <GridPattern
          x={500}
          y={400}
          squares={[
            [-11, 9],
            [-9, 8],
            [-8, 10],
            [-10, 4],
            [-7, 11],
            [-6, 9],
            [-4, 12],
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
            "[mask-image:radial-gradient(250px_circle_at_center,white,transparent)]",
            "sm:[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
            "md:[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[-40%] h-[200%] skew-y-12",
          )}
        />
        <div className="container mx-auto text-center relative z-10 flex flex-col items-center justify-center flex-1 px-4">
          <div className="flex flex-col items-center justify-center w-full">
            <div className="text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight mb-16 min-h-[4rem] lg:min-h-[5rem] xl:min-h-[6rem]">
              {showTextType && (
                <TextType
                  text="Prinsur.com"
                  typingSpeed={80}
                  showCursor={true}
                  loop={false}
                  className=""
                  cursorCharacter="|"
                  cursorBlinkDuration={0.7}
                  hideCursorWhileTyping={false}
                  pauseDuration={1000}
                  variableSpeed={{ min: 50, max: 100 }}
                />
              )}
            </div>
            <div className="flex flex-col items-center justify-center space-y-8 w-full">
              <div className="w-full max-w-4xl px-2 sm:px-8">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-4 top-[18px] h-5 w-5 text-muted-foreground z-10" />
                    <Input
                      type="text"
                      placeholder={
                        locale === "en"
                          ? "e.g. life insurance, travel insurance"
                          : "例如：壽險、旅平險"
                      }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-14 pl-12 pr-4 text-base sm:text-lg border-2 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full placeholder:text-sm sm:placeholder:text-base bg-white/5 backdrop-blur-sm border-gray-300 dark:border-white/10"
                    />
                  </div>
                </form>
              </div>
              <div
                ref={loginSuggestionAnimation.ref}
                style={loginSuggestionAnimation.animationStyle}
                className="text-center"
              >
                <div className="flex flex-row items-center justify-center gap-1">
                  <span className="text-muted-foreground text-sm">
                    {locale === "en"
                      ? "Login for better results - "
                      : "登入獲得更佳結果 - "}
                  </span>
                  <Button
                    variant="link"
                    className="text-primary p-0 h-auto text-sm underline"
                    onClick={() => router.push(`/${locale}/login`)}
                  >
                    {locale === "en" ? "Go to Login" : "前往登入"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div
            ref={descriptionAnimation.ref}
            style={descriptionAnimation.animationStyle}
            className="max-w-4xl mx-auto mt-16"
          >
            <div className="grid grid-cols-3 gap-2 sm:gap-6 md:gap-12">
              <div className="text-center">
                <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
                  {locale === "en" ? "Success Rate" : "成交率提升"}
                </p>
                <div className="text-2xl sm:text-3xl lg:text-5xl font-bold text-primary mb-1 my-1 sm:my-2">
                  +85%
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
                  +30%
                </div>
                <p className="text-xs lg:text-sm text-muted-foreground/70 mt-1">
                  {locale === "en"
                    ? "through smart comparison"
                    : "透過智慧比價"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
                  {locale === "en" ? "Fast Matching" : "快速媒合"}
                </p>
                <div className="text-2xl sm:text-3xl lg:text-5xl font-bold text-primary mb-1 my-1 sm:my-2">
                  &lt;24h
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
