"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { UserProfile } from "@/utils/premium-calculator";

interface ConsumerHomeProps {
  params: Promise<{ locale: string }>;
}

export default function ConsumerHome({ params }: ConsumerHomeProps) {
  const pathname = usePathname();
  const localeFromPath = pathname.split("/")[1] || "zh-TW";
  const [locale, setLocale] = useState<string>(localeFromPath);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Set mounted state on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load user profile for checking completeness
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
            gender: profile.gender,
            medicalConditions: profile.medicalConditions,
          });
        } catch (error) {
          console.error("Error loading user profile:", error);
        }
      }
    }
  }, [user?.id]);

  useEffect(() => {
    params.then(({ locale: paramLocale }) => {
      setLocale(paramLocale);
    });
  }, [params]);

  // Helper function to check if profile is complete
  const isProfileIncomplete = () => {
    if (!user) return false;

    // Check if basic profile fields are missing
    const basicFieldsMissing =
      !userProfile.age ||
      !userProfile.weight ||
      !userProfile.height ||
      !userProfile.gender;

    return basicFieldsMissing;
  };

  // Smart redirect logic based on profile completeness
  useEffect(() => {
    if (!isLoading && mounted && user) {
      if (isProfileIncomplete()) {
        // Profile incomplete -> redirect to profile page
        router.push(`/${locale}/consumer/profile`);
      } else {
        // Profile complete -> redirect to insurance page
        router.push(`/${locale}/consumer/insurance`);
      }
    }
  }, [isLoading, mounted, user, userProfile, locale, router, isProfileIncomplete]);

  // Show loading while checking auth and profile
  if (isLoading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no user, this should be handled by auth guard, but show loading as fallback
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}