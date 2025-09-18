/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Enterprise Authentication Caching System
 * Provides intelligent caching for user sessions, permissions, and auth states
 */

import { User } from "@/contexts/auth-context";
import { logger } from "@/lib/monitoring/enterprise-logger";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  tags?: string[];
}

interface SessionCacheData {
  user: User;
  permissions: string[];
  roles: string[];
  lastActivity: number;
}

interface PermissionCacheData {
  userId: string;
  resource: string;
  action: string;
  allowed: boolean;
  conditions?: any;
}

class AuthCacheSystem {
  private sessionCache: Map<string, CacheEntry<SessionCacheData>> = new Map();
  private permissionCache: Map<string, CacheEntry<PermissionCacheData>> =
    new Map();
  private roleCache: Map<string, CacheEntry<string[]>> = new Map();
  private cleanupInterval: NodeJS.Timeout;
  private static instance: AuthCacheSystem;

  // Default TTL values (in milliseconds)
  private readonly DEFAULT_TTLS = {
    session: 15 * 60 * 1000, // 15 minutes
    permission: 5 * 60 * 1000, // 5 minutes
    role: 30 * 60 * 1000, // 30 minutes
    validation: 1 * 60 * 1000, // 1 minute
  };

  static getInstance(): AuthCacheSystem {
    if (!AuthCacheSystem.instance) {
      AuthCacheSystem.instance = new AuthCacheSystem();
    }
    return AuthCacheSystem.instance;
  }

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      5 * 60 * 1000,
    );

    // Clean up when page unloads
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        this.destroy();
      });
    }
  }

  // Session caching
  cacheSession(
    userId: string,
    sessionData: SessionCacheData,
    ttl?: number,
  ): void {
    const cacheKey = `session_${userId}`;
    const entry: CacheEntry<SessionCacheData> = {
      data: sessionData,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTLS.session,
      tags: ["session", `user_${userId}`],
    };

    this.sessionCache.set(cacheKey, entry);

    logger.debug("auth", "session_cached", {
      user_id: userId,
      ttl: entry.ttl,
      cache_size: this.sessionCache.size,
    });
  }

  getSessionFromCache(userId: string): SessionCacheData | null {
    const cacheKey = `session_${userId}`;
    const entry = this.sessionCache.get(cacheKey);

    if (!entry || this.isExpired(entry)) {
      if (entry) {
        this.sessionCache.delete(cacheKey);
        logger.debug("auth", "session_cache_expired", { user_id: userId });
      }
      return null;
    }

    // Update last activity
    entry.data.lastActivity = Date.now();

    logger.debug("auth", "session_cache_hit", {
      user_id: userId,
      age_ms: Date.now() - entry.timestamp,
    });

    return entry.data;
  }

  invalidateSession(userId: string): void {
    const cacheKey = `session_${userId}`;
    const deleted = this.sessionCache.delete(cacheKey);

    if (deleted) {
      logger.info("auth", "session_cache_invalidated", { user_id: userId });
    }

    // Also invalidate related permission caches
    this.invalidateByTag(`user_${userId}`);
  }

  // Permission caching
  cachePermission(
    userId: string,
    resource: string,
    action: string,
    allowed: boolean,
    conditions?: any,
    ttl?: number,
  ): void {
    const cacheKey = `perm_${userId}_${resource}_${action}`;
    const entry: CacheEntry<PermissionCacheData> = {
      data: {
        userId,
        resource,
        action,
        allowed,
        conditions,
      },
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTLS.permission,
      tags: ["permission", `user_${userId}`, `resource_${resource}`],
    };

    this.permissionCache.set(cacheKey, entry);

    logger.debug("auth", "permission_cached", {
      user_id: userId,
      resource,
      action,
      allowed,
    });
  }

  getPermissionFromCache(
    userId: string,
    resource: string,
    action: string,
  ): boolean | null {
    const cacheKey = `perm_${userId}_${resource}_${action}`;
    const entry = this.permissionCache.get(cacheKey);

    if (!entry || this.isExpired(entry)) {
      if (entry) {
        this.permissionCache.delete(cacheKey);
      }
      return null;
    }

    logger.debug("auth", "permission_cache_hit", {
      user_id: userId,
      resource,
      action,
      allowed: entry.data.allowed,
    });

    return entry.data.allowed;
  }

  // Role caching
  cacheUserRoles(userId: string, roles: string[], ttl?: number): void {
    const cacheKey = `roles_${userId}`;
    const entry: CacheEntry<string[]> = {
      data: roles,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTLS.role,
      tags: ["role", `user_${userId}`],
    };

    this.roleCache.set(cacheKey, entry);

    logger.debug("auth", "roles_cached", {
      user_id: userId,
      roles: roles.length,
    });
  }

  getUserRolesFromCache(userId: string): string[] | null {
    const cacheKey = `roles_${userId}`;
    const entry = this.roleCache.get(cacheKey);

    if (!entry || this.isExpired(entry)) {
      if (entry) {
        this.roleCache.delete(cacheKey);
      }
      return null;
    }

    return entry.data;
  }

  // Cache invalidation
  invalidateByTag(tag: string): void {
    let invalidatedCount = 0;

    // Invalidate session cache
    for (const [key, entry] of this.sessionCache.entries()) {
      if (entry.tags?.includes(tag)) {
        this.sessionCache.delete(key);
        invalidatedCount++;
      }
    }

    // Invalidate permission cache
    for (const [key, entry] of this.permissionCache.entries()) {
      if (entry.tags?.includes(tag)) {
        this.permissionCache.delete(key);
        invalidatedCount++;
      }
    }

    // Invalidate role cache
    for (const [key, entry] of this.roleCache.entries()) {
      if (entry.tags?.includes(tag)) {
        this.roleCache.delete(key);
        invalidatedCount++;
      }
    }

    if (invalidatedCount > 0) {
      logger.info("auth", "cache_invalidated_by_tag", {
        tag,
        invalidated_count: invalidatedCount,
      });
    }
  }

  // Cache statistics
  getStats() {
    const now = Date.now();

    const calculateStats = <T>(cache: Map<string, CacheEntry<T>>) => {
      let expired = 0;
      let valid = 0;
      let totalAge = 0;

      for (const entry of cache.values()) {
        if (this.isExpired(entry)) {
          expired++;
        } else {
          valid++;
          totalAge += now - entry.timestamp;
        }
      }

      return {
        total: cache.size,
        valid,
        expired,
        averageAge: valid > 0 ? Math.round(totalAge / valid) : 0,
      };
    };

    return {
      session: calculateStats(this.sessionCache),
      permission: calculateStats(this.permissionCache),
      role: calculateStats(this.roleCache),
      totalMemoryUsage: this.estimateMemoryUsage(),
    };
  }

  // Cache warming (preload commonly accessed data)
  async warmCache(userId: string, user: User): Promise<void> {
    try {
      // Cache basic session data
      const sessionData: SessionCacheData = {
        user,
        permissions: [], // Would be populated from RBAC system
        roles: [`role_${user.type}`],
        lastActivity: Date.now(),
      };

      this.cacheSession(userId, sessionData);
      this.cacheUserRoles(userId, sessionData.roles);

      // Pre-cache common permissions for this role
      const commonPermissions = this.getCommonPermissionsForRole(user.type);
      for (const perm of commonPermissions) {
        // This would normally query the RBAC system
        const allowed = await this.evaluatePermission(
          userId,
          perm.resource,
          perm.action,
        );
        this.cachePermission(userId, perm.resource, perm.action, allowed);
      }

      logger.info("auth", "cache_warmed", {
        user_id: userId,
        role: user.type,
        permissions_cached: commonPermissions.length,
      });
    } catch (error) {
      logger.error("auth", "cache_warm_failed", {
        user_id: userId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Memory management
  private estimateMemoryUsage(): number {
    // Rough estimation of memory usage in bytes
    let usage = 0;

    const estimateEntrySize = <T>(entry: CacheEntry<T>): number => {
      return JSON.stringify(entry).length * 2; // Rough UTF-16 estimation
    };

    for (const entry of this.sessionCache.values()) {
      usage += estimateEntrySize(entry);
    }

    for (const entry of this.permissionCache.values()) {
      usage += estimateEntrySize(entry);
    }

    for (const entry of this.roleCache.values()) {
      usage += estimateEntrySize(entry);
    }

    return usage;
  }

  private cleanup(): void {
    const beforeStats = this.getStats();
    let cleanedCount = 0;

    // Clean expired entries
    const cleanupCache = <T>(cache: Map<string, CacheEntry<T>>) => {
      for (const [key, entry] of cache.entries()) {
        if (this.isExpired(entry)) {
          cache.delete(key);
          cleanedCount++;
        }
      }
    };

    cleanupCache(this.sessionCache);
    cleanupCache(this.permissionCache);
    cleanupCache(this.roleCache);

    if (cleanedCount > 0) {
      logger.info("auth", "cache_cleanup_completed", {
        cleaned_entries: cleanedCount,
        before_stats: beforeStats,
        after_stats: this.getStats(),
      });
    }

    // Log memory usage if it's getting high
    const memoryUsage = this.estimateMemoryUsage();
    if (memoryUsage > 1024 * 1024) {
      // More than 1MB
      logger.warn("auth", "high_cache_memory_usage", {
        usage_bytes: memoryUsage,
        usage_mb: Math.round(memoryUsage / 1024 / 1024),
      });
    }
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private getCommonPermissionsForRole(
    role: string,
  ): Array<{ resource: string; action: string }> {
    const commonPermissions: Record<
      string,
      Array<{ resource: string; action: string }>
    > = {
      consumer: [
        { resource: "policy", action: "view" },
        { resource: "claim", action: "create" },
        { resource: "profile", action: "edit" },
      ],
      agent: [
        { resource: "client", action: "view" },
        { resource: "policy", action: "manage" },
        { resource: "claim", action: "process" },
      ],
      manager: [
        { resource: "report", action: "view" },
        { resource: "agent", action: "manage" },
      ],
      admin: [
        { resource: "system", action: "configure" },
        { resource: "user", action: "manage" },
      ],
    };

    return commonPermissions[role] || [];
  }

  private async evaluatePermission(
    userId: string,
    resource: string,
    action: string,
  ): Promise<boolean> {
    // This would integrate with your RBAC system
    // For demo purposes, return true for basic permissions
    return true;
  }

  // Cleanup resources
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.sessionCache.clear();
    this.permissionCache.clear();
    this.roleCache.clear();
  }
}

// Export singleton instance
export const authCache = AuthCacheSystem.getInstance();

// Convenience functions
export const cacheUserSession = (
  userId: string,
  sessionData: SessionCacheData,
) => authCache.cacheSession(userId, sessionData);

export const getUserSession = (userId: string) =>
  authCache.getSessionFromCache(userId);

export const invalidateUserCache = (userId: string) =>
  authCache.invalidateSession(userId);

export const checkCachedPermission = (
  userId: string,
  resource: string,
  action: string,
) => authCache.getPermissionFromCache(userId, resource, action);

export const cachePermissionResult = (
  userId: string,
  resource: string,
  action: string,
  allowed: boolean,
) => authCache.cachePermission(userId, resource, action, allowed);
