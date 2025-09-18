/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/monitoring/enterprise-logger";

/**
 * Enterprise middleware chain system
 * Provides composable middleware for request processing with logging and error handling
 */

export interface MiddlewareContext {
  request: NextRequest;
  response?: NextResponse;
  user?: any;
  metadata: Record<string, any>;
  startTime: number;
  requestId: string;
}

export interface Middleware {
  name: string;
  priority: number;
  execute: (
    context: MiddlewareContext,
    next: () => Promise<void>,
  ) => Promise<void>;
  enabled?: boolean;
}

export class MiddlewareChain {
  private middlewares: Middleware[] = [];
  private static instance: MiddlewareChain;

  static getInstance(): MiddlewareChain {
    if (!MiddlewareChain.instance) {
      MiddlewareChain.instance = new MiddlewareChain();
    }
    return MiddlewareChain.instance;
  }

  register(middleware: Middleware): void {
    this.middlewares.push(middleware);
    // Sort by priority (higher number = higher priority)
    this.middlewares.sort((a, b) => b.priority - a.priority);

    logger.debug("api", "middleware_registered", {
      middleware_name: middleware.name,
      priority: middleware.priority,
      total_middlewares: this.middlewares.length,
    });
  }

  async execute(request: NextRequest): Promise<NextResponse> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    const context: MiddlewareContext = {
      request,
      metadata: {},
      startTime,
      requestId,
    };

    logger.info("api", "request_started", {
      request_id: requestId,
      method: request.method,
      url: request.url,
      user_agent: request.headers.get("user-agent"),
    });

    try {
      let currentIndex = 0;
      const enabledMiddlewares = this.middlewares.filter(
        (m) => m.enabled !== false,
      );

      const next = async (): Promise<void> => {
        if (currentIndex >= enabledMiddlewares.length) return;

        const middleware = enabledMiddlewares[currentIndex++];
        const middlewareStart = Date.now();

        try {
          await middleware.execute(context, next);

          logger.trackPerformance({
            name: `middleware_${middleware.name}`,
            value: Date.now() - middlewareStart,
            unit: "ms",
            metadata: {
              request_id: requestId,
              middleware_name: middleware.name,
            },
          });
        } catch (error) {
          logger.error("api", "middleware_error", {
            request_id: requestId,
            middleware_name: middleware.name,
            error: error instanceof Error ? error.message : "Unknown error",
          });
          throw error;
        }
      };

      await next();

      const response = context.response || NextResponse.next();
      const totalDuration = Date.now() - startTime;

      // Add performance and tracing headers
      response.headers.set("X-Request-ID", requestId);
      response.headers.set("X-Response-Time", `${totalDuration}ms`);
      response.headers.set(
        "X-Middlewares-Count",
        enabledMiddlewares.length.toString(),
      );

      logger.info("api", "request_completed", {
        request_id: requestId,
        status: response.status,
        duration_ms: totalDuration,
        middlewares_executed: enabledMiddlewares.length,
      });

      logger.trackPerformance({
        name: "request_total",
        value: totalDuration,
        unit: "ms",
        metadata: {
          request_id: requestId,
          method: request.method,
          status: response.status,
        },
      });

      return response;
    } catch (error) {
      const totalDuration = Date.now() - startTime;

      logger.error(
        "api",
        "request_failed",
        {
          request_id: requestId,
          duration_ms: totalDuration,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        error as Error,
      );

      // Return error response
      return new NextResponse(
        JSON.stringify({
          error: "Internal Server Error",
          request_id: requestId,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "X-Request-ID": requestId,
          },
        },
      );
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get registered middlewares info
  getMiddlewareInfo(): Array<{
    name: string;
    priority: number;
    enabled: boolean;
  }> {
    return this.middlewares.map((m) => ({
      name: m.name,
      priority: m.priority,
      enabled: m.enabled !== false,
    }));
  }

  // Enable/disable specific middleware
  toggleMiddleware(name: string, enabled: boolean): void {
    const middleware = this.middlewares.find((m) => m.name === name);
    if (middleware) {
      middleware.enabled = enabled;
      logger.info("api", "middleware_toggled", {
        middleware_name: name,
        enabled,
      });
    }
  }
}

// Middleware factory functions
export const createLoggingMiddleware = (): Middleware => ({
  name: "logging",
  priority: 1000, // Highest priority
  async execute(context: MiddlewareContext, next: () => Promise<void>) {
    const { request } = context;

    // Log request details
    context.metadata.logged = true;
    context.metadata.method = request.method;
    context.metadata.pathname = new URL(request.url).pathname;

    await next();
  },
});

export const createCorsMiddleware = (
  options: {
    origin?: string | string[];
    methods?: string[];
    headers?: string[];
  } = {},
): Middleware => ({
  name: "cors",
  priority: 900,
  async execute(context: MiddlewareContext, next: () => Promise<void>) {
    const { request } = context;

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      const response = new NextResponse(null, { status: 200 });

      // Set CORS headers
      response.headers.set(
        "Access-Control-Allow-Origin",
        Array.isArray(options.origin)
          ? options.origin.join(", ")
          : options.origin || "*",
      );
      response.headers.set(
        "Access-Control-Allow-Methods",
        options.methods?.join(", ") || "GET, POST, PUT, DELETE, OPTIONS",
      );
      response.headers.set(
        "Access-Control-Allow-Headers",
        options.headers?.join(", ") || "Content-Type, Authorization",
      );
      response.headers.set("Access-Control-Max-Age", "86400");

      context.response = response;
      return;
    }

    await next();

    // Add CORS headers to response
    if (context.response) {
      context.response.headers.set(
        "Access-Control-Allow-Origin",
        Array.isArray(options.origin)
          ? options.origin.join(", ")
          : options.origin || "*",
      );
    }
  },
});

export const createAuthMiddleware = (): Middleware => ({
  name: "auth",
  priority: 800,
  async execute(context: MiddlewareContext, next: () => Promise<void>) {
    const { request } = context;

    // Skip auth for public paths
    const pathname = new URL(request.url).pathname;
    const publicPaths = [
      "/api/auth/",
      "/api/public/",
      "/_next/",
      "/favicon.ico",
    ];

    if (publicPaths.some((path) => pathname.startsWith(path))) {
      await next();
      return;
    }

    // Extract user from session
    try {
      const userCookie = request.cookies.get("prinsur_user");
      if (userCookie?.value) {
        const user = JSON.parse(userCookie.value);
        context.user = user;
        context.metadata.authenticated = true;
        context.metadata.user_id = user.id;
        context.metadata.user_role = user.type;

        // Update logger context
        logger.setUser(user.id, user.type);
      } else {
        context.metadata.authenticated = false;
      }
    } catch (error) {
      logger.warn("api", "auth_middleware_error", {
        error: error instanceof Error ? error.message : "Unknown error",
        request_id: context.requestId,
      });
      context.metadata.authenticated = false;
    }

    await next();
  },
});

// Global middleware chain instance
export const middlewareChain = MiddlewareChain.getInstance();

// Initialize default middlewares
middlewareChain.register(createLoggingMiddleware());
middlewareChain.register(createCorsMiddleware());
middlewareChain.register(createAuthMiddleware());
