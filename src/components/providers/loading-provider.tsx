"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { PageLoading } from "@/components/ui/loading";

interface LoadingContextType {
  isPageLoading: boolean;
  setPageLoading: (loading: boolean) => void;
  triggerPageTransition: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}

interface LoadingProviderProps {
  children: React.ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    // Simulate initial page load
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const setPageLoading = (loading: boolean) => {
    setIsPageLoading(loading);
  };

  const triggerPageTransition = () => {
    setIsPageLoading(true);
    setTimeout(() => {
      setIsPageLoading(false);
    }, 1000);
  };

  return (
    <LoadingContext.Provider
      value={{
        isPageLoading,
        setPageLoading,
        triggerPageTransition,
      }}
    >
      {children}
      {isPageLoading && <PageLoading />}
    </LoadingContext.Provider>
  );
}
