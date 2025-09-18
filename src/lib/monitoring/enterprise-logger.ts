/**
 * Enterprise-grade logging and monitoring system
 * Provides structured logging, error tracking, and performance monitoring
 */

export interface LogEvent {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: 'auth' | 'navigation' | 'api' | 'performance' | 'security' | 'business';
  event: string;
  userId?: string;
  userRole?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  trace?: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: string;
  userId?: string;
  userRole?: string;
  metadata?: Record<string, any>;
}

export interface SecurityEvent {
  type: 'login_attempt' | 'unauthorized_access' | 'suspicious_activity' | 'permission_denied';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  path?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

class EnterpriseLogger {
  private sessionId: string;
  private userId?: string;
  private userRole?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  setUser(userId: string, userRole: string) {
    this.userId = userId;
    this.userRole = userRole;
  }

  clearUser() {
    this.userId = undefined;
    this.userRole = undefined;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createBaseEvent(): Partial<LogEvent> {
    return {
      timestamp: new Date().toISOString(),
      userId: this.userId,
      userRole: this.userRole,
      sessionId: this.sessionId,
    };
  }

  // Structured logging methods
  info(category: LogEvent['category'], event: string, metadata?: Record<string, any>) {
    this.log('info', category, event, metadata);
  }

  warn(category: LogEvent['category'], event: string, metadata?: Record<string, any>) {
    this.log('warn', category, event, metadata);
  }

  error(category: LogEvent['category'], event: string, metadata?: Record<string, any>, error?: Error) {
    const logData: Record<string, any> = { ...metadata };
    if (error) {
      logData.error = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };
    }
    this.log('error', category, event, logData);
  }

  debug(category: LogEvent['category'], event: string, metadata?: Record<string, any>) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', category, event, metadata);
    }
  }

  private log(level: LogEvent['level'], category: LogEvent['category'], event: string, metadata?: Record<string, any>) {
    const logEvent: LogEvent = {
      ...this.createBaseEvent(),
      level,
      category,
      event,
      metadata,
    } as LogEvent;

    // In production, send to your logging service (e.g., CloudWatch, Datadog, LogRocket)
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(logEvent);
    } else {
      console.log(`[${level.toUpperCase()}] [${category}] ${event}`, metadata || '');
    }
  }

  // Performance monitoring
  trackPerformance(metric: Omit<PerformanceMetric, 'timestamp' | 'userId' | 'userRole'>) {
    const performanceMetric: PerformanceMetric = {
      ...metric,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      userRole: this.userRole,
    };

    // In production, send to your monitoring service (e.g., DataDog, New Relic)
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(performanceMetric);
    } else {
      console.log(`[PERFORMANCE] ${metric.name}: ${metric.value}${metric.unit}`, metric.metadata || '');
    }
  }

  // Security event logging
  logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    // Security events always go to logging service, even in development
    this.sendToSecurityLoggingService(securityEvent);

    if (process.env.NODE_ENV === 'development') {
      console.warn(`[SECURITY] [${event.severity.toUpperCase()}] ${event.type}`, event);
    }
  }

  // Business analytics
  trackBusinessEvent(event: string, properties?: Record<string, any>) {
    this.info('business', event, {
      ...properties,
      business_metric: true,
    });
  }

  // Route tracking
  trackNavigation(fromPath: string, toPath: string, method: 'client' | 'server' = 'client') {
    this.info('navigation', 'route_change', {
      from_path: fromPath,
      to_path: toPath,
      method,
      navigation_timestamp: Date.now(),
    });
  }

  // Authentication events
  trackAuth(event: 'login' | 'logout' | 'login_failed' | 'session_expired', metadata?: Record<string, any>) {
    if (event === 'login' || event === 'logout') {
      this.info('auth', event, metadata);
    } else {
      this.logSecurityEvent({
        type: event === 'login_failed' ? 'login_attempt' : 'suspicious_activity',
        severity: 'medium',
        userId: this.userId,
        userRole: this.userRole,
        metadata,
      });
    }
  }

  // Error boundary logging
  trackError(error: Error, errorInfo?: any, componentStack?: string) {
    this.error('api', 'react_error_boundary', {
      component_stack: componentStack,
      error_info: errorInfo,
      user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    }, error);
  }

  // Private methods for sending to external services
  private async sendToLoggingService(event: LogEvent) {
    // Implementation would depend on your logging service
    // Example: send to CloudWatch, Datadog, LogRocket, etc.
    try {
      // await fetch('/api/monitoring/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event),
      // });
    } catch (error) {
      console.error('Failed to send log event:', error);
    }
  }

  private async sendToMonitoringService(metric: PerformanceMetric) {
    // Implementation would depend on your monitoring service
    try {
      // await fetch('/api/monitoring/metrics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(metric),
      // });
    } catch (error) {
      console.error('Failed to send performance metric:', error);
    }
  }

  private async sendToSecurityLoggingService(event: SecurityEvent) {
    // Security events should be handled with high priority
    try {
      // await fetch('/api/monitoring/security', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event),
      // });
    } catch (error) {
      console.error('Failed to send security event:', error);
      // In production, you might want to fallback to another service
    }
  }
}

// Global logger instance
export const logger = new EnterpriseLogger();

// React hooks for logging
export function useLogger() {
  return logger;
}

// Performance measurement utilities
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>,
  metadata?: Record<string, any>
): T | Promise<T> {
  const start = performance.now();

  const result = fn();

  if (result instanceof Promise) {
    return result.finally(() => {
      const duration = performance.now() - start;
      logger.trackPerformance({
        name,
        value: Math.round(duration),
        unit: 'ms',
        metadata,
      });
    });
  } else {
    const duration = performance.now() - start;
    logger.trackPerformance({
      name,
      value: Math.round(duration),
      unit: 'ms',
      metadata,
    });
    return result;
  }
}

// Decorator for automatic function performance tracking
export function trackPerformance(name?: string) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const methodName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function(...args: any[]) {
      return measurePerformance(methodName, () => originalMethod.apply(this, args));
    };

    return descriptor;
  };
}