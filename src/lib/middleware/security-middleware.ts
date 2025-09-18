import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/monitoring/enterprise-logger';
import { Middleware, MiddlewareContext } from './middleware-chain';

/**
 * Enterprise security middleware collection
 * Provides rate limiting, security headers, and threat detection
 */

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export const createRateLimitMiddleware = (config: RateLimitConfig): Middleware => ({
  name: 'rate_limit',
  priority: 950,
  async execute(context: MiddlewareContext, next: () => Promise<void>) {
    const { request } = context;
    const key = config.keyGenerator ? config.keyGenerator(request) : getClientIP(request);

    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Clean up expired entries
    cleanupExpiredEntries(windowStart);

    const clientData = rateLimitStore.get(key);
    const currentCount = clientData && clientData.resetTime > now ? clientData.count : 0;

    if (currentCount >= config.maxRequests) {
      // Rate limit exceeded
      logger.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'medium',
        userId: context.user?.id,
        userRole: context.user?.type,
        ipAddress: getClientIP(request),
        metadata: {
          rate_limit_exceeded: true,
          current_count: currentCount,
          max_requests: config.maxRequests,
          window_ms: config.windowMs,
        },
      });

      const response = new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          retryAfter: Math.ceil((clientData!.resetTime - now) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((clientData!.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': clientData!.resetTime.toString(),
          },
        }
      );

      context.response = response;
      return;
    }

    // Update rate limit counter
    rateLimitStore.set(key, {
      count: currentCount + 1,
      resetTime: clientData?.resetTime && clientData.resetTime > now
        ? clientData.resetTime
        : now + config.windowMs,
    });

    await next();

    // Add rate limit headers to successful responses
    if (context.response) {
      const updatedData = rateLimitStore.get(key)!;
      const remaining = Math.max(0, config.maxRequests - updatedData.count);

      context.response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
      context.response.headers.set('X-RateLimit-Remaining', remaining.toString());
      context.response.headers.set('X-RateLimit-Reset', updatedData.resetTime.toString());
    }
  },
});

export const createSecurityHeadersMiddleware = (): Middleware => ({
  name: 'security_headers',
  priority: 850,
  async execute(context: MiddlewareContext, next: () => Promise<void>) {
    await next();

    if (context.response) {
      // Add security headers
      context.response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
      );
      context.response.headers.set('X-Frame-Options', 'DENY');
      context.response.headers.set('X-Content-Type-Options', 'nosniff');
      context.response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      context.response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

      // Only set HSTS in production with HTTPS
      if (process.env.NODE_ENV === 'production') {
        context.response.headers.set(
          'Strict-Transport-Security',
          'max-age=31536000; includeSubDomains; preload'
        );
      }

      context.metadata.security_headers_added = true;
    }
  },
});

export const createThreatDetectionMiddleware = (): Middleware => ({
  name: 'threat_detection',
  priority: 870,
  async execute(context: MiddlewareContext, next: () => Promise<void>) {
    const { request } = context;
    const threats: string[] = [];

    // SQL Injection detection
    const sqlPatterns = [
      /(\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bunion\b|\bdrop\b)/i,
      /('|(\\x27)|(\\x2D\\x2D)|(%27)|(%2D%2D))/i,
      /(\bor\b|\band\b)\s+\d+\s*=\s*\d+/i,
    ];

    const url = new URL(request.url);
    const queryString = url.search;
    const userAgent = request.headers.get('user-agent') || '';

    sqlPatterns.forEach((pattern, index) => {
      if (pattern.test(queryString) || pattern.test(userAgent)) {
        threats.push(`sql_injection_${index}`);
      }
    });

    // XSS detection
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/i,
      /on\w+\s*=/i,
    ];

    xssPatterns.forEach((pattern, index) => {
      if (pattern.test(queryString) || pattern.test(userAgent)) {
        threats.push(`xss_${index}`);
      }
    });

    // Suspicious user agent detection
    const suspiciousUAPatterns = [
      /bot/i,
      /crawler/i,
      /scanner/i,
      /hack/i,
      /exploit/i,
    ];

    if (suspiciousUAPatterns.some(pattern => pattern.test(userAgent))) {
      threats.push('suspicious_user_agent');
    }

    // Path traversal detection
    if (queryString.includes('../') || queryString.includes('..\\')) {
      threats.push('path_traversal');
    }

    // Log threats if detected
    if (threats.length > 0) {
      logger.logSecurityEvent({
        type: 'suspicious_activity',
        severity: threats.length > 2 ? 'high' : 'medium',
        userId: context.user?.id,
        userRole: context.user?.type,
        ipAddress: getClientIP(request),
        userAgent,
        path: url.pathname,
        metadata: {
          threats_detected: threats,
          query_string: queryString,
          threat_count: threats.length,
        },
      });

      // Block high-risk requests
      if (threats.length > 2 || threats.some(t => t.startsWith('sql_injection'))) {
        const response = new NextResponse(
          JSON.stringify({
            error: 'Request blocked by security policy',
            reference: context.requestId,
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        context.response = response;
        return;
      }
    }

    context.metadata.threats_detected = threats;
    await next();
  },
});

export const createIPWhitelistMiddleware = (allowedIPs: string[]): Middleware => ({
  name: 'ip_whitelist',
  priority: 980,
  async execute(context: MiddlewareContext, next: () => Promise<void>) {
    const clientIP = getClientIP(context.request);

    // Skip in development
    if (process.env.NODE_ENV === 'development') {
      await next();
      return;
    }

    if (!allowedIPs.includes(clientIP)) {
      logger.logSecurityEvent({
        type: 'unauthorized_access',
        severity: 'high',
        ipAddress: clientIP,
        userAgent: context.request.headers.get('user-agent') || undefined,
        path: new URL(context.request.url).pathname,
        metadata: {
          blocked_ip: clientIP,
          allowed_ips: allowedIPs.length,
        },
      });

      const response = new NextResponse(
        JSON.stringify({
          error: 'Access denied from this IP address',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      context.response = response;
      return;
    }

    await next();
  },
});

// Helper functions
function getClientIP(request: NextRequest): string {
  // Try different headers for getting client IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('remote-addr');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return realIP || remoteAddr || 'unknown';
}

function cleanupExpiredEntries(windowStart: number): void {
  for (const [key, data] of rateLimitStore.entries()) {
    if (data.resetTime <= windowStart) {
      rateLimitStore.delete(key);
    }
  }
}

// Export rate limit configs for different endpoints
export const RATE_LIMIT_CONFIGS = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 login attempts per 15 minutes
    keyGenerator: (request: NextRequest) => getClientIP(request),
  },
  api: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    keyGenerator: (request: NextRequest) => {
      const userCookie = request.cookies.get('prinsur_user');
      if (userCookie?.value) {
        try {
          const user = JSON.parse(userCookie.value);
          return `user_${user.id}`;
        } catch {
          return getClientIP(request);
        }
      }
      return getClientIP(request);
    },
  },
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 uploads per hour
    keyGenerator: (request: NextRequest) => getClientIP(request),
  },
};