"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { logger } from "@/lib/monitoring/enterprise-logger";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

interface ErrorFallbackProps {
  error: Error | null;
  resetError: () => void;
  locale?: string;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to enterprise monitoring system
    // const { logger } = require("@/lib/monitoring/enterprise-logger");

    logger.trackError(error, errorInfo, errorInfo.componentStack || "");
    logger.logSecurityEvent({
      type: "suspicious_activity",
      severity: "medium",
      metadata: {
        error_boundary: true,
        component_stack: errorInfo.componentStack,
        error_message: error.message,
      },
    });

    // Fallback console log for development
    if (process.env.NODE_ENV === "development") {
      console.error("Error Boundary caught an error:", error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({
  error,
  resetError,
  locale = "zh-TW",
}: ErrorFallbackProps) {
  const handleGoHome = () => {
    window.location.href = `/${locale}/`;
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            系統發生錯誤
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            抱歉，應用程式遇到了意外錯誤
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && process.env.NODE_ENV === "development" && (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-red-600 dark:text-red-400 font-mono">
                {error.message}
              </p>
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-500 cursor-pointer">
                    查看詳細錯誤
                  </summary>
                  <pre className="text-xs text-gray-500 mt-2 overflow-auto">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Button onClick={resetError} className="w-full" variant="default">
              <RotateCcw className="w-4 h-4 mr-2" />
              重試
            </Button>

            <Button onClick={handleReload} className="w-full" variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              重新加載頁面
            </Button>

            <Button onClick={handleGoHome} className="w-full" variant="outline">
              <Home className="w-4 h-4 mr-2" />
              返回首頁
            </Button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            如果問題持續發生，請聯繫系統管理員。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default ErrorBoundary;
export { DefaultErrorFallback, type ErrorFallbackProps };
