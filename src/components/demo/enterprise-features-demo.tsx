/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Database,
  Activity,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { logger } from "@/lib/monitoring/enterprise-logger";
import { auditTrail } from "@/lib/audit/audit-trail";
import { authCache } from "@/lib/cache/auth-cache";

export default function EnterpriseFeaturesDemo() {
  const { user, hasPermission, hasResourcePermission, getUserRoles } =
    useAuth();
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [roles, setRoles] = useState<string[]>([]);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [auditEvents, setAuditEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEnterpriseData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load user roles
      const userRoles = await getUserRoles();
      setRoles(userRoles);

      // Test common permissions
      const permissionTests = [
        "policy.view.own",
        "claim.create.own",
        "client.view.assigned",
        "report.view.team",
        "system.configure.all",
      ];

      const permissionResults: Record<string, boolean> = {};
      for (const perm of permissionTests) {
        permissionResults[perm] = await hasPermission(perm);
      }
      setPermissions(permissionResults);

      // Get cache statistics
      const stats = authCache.getStats();
      setCacheStats(stats);

      // Get recent audit events (demo data)
      const demoAuditEvents = auditTrail.query({
        limit: 5,
        actorIds: [user.id],
      });
      setAuditEvents(demoAuditEvents);
    } catch (error) {
      console.error("Failed to load enterprise data:", error);
    } finally {
      setLoading(false);
    }
  }, [user, getUserRoles, hasPermission]);

  useEffect(() => {
    if (user) {
      loadEnterpriseData();
    }
  }, [user, loadEnterpriseData]);

  const testFeature = async (featureName: string) => {
    if (!user) return;

    try {
      switch (featureName) {
        case "logging":
          logger.info("business", "feature_test", {
            feature: featureName,
            user_id: user.id,
            timestamp: Date.now(),
          });
          alert("日誌記錄成功！請查看開發者控制台。");
          break;

        case "audit":
          await auditTrail.record({
            eventType: "business_transaction",
            category: "operational",
            severity: "low",
            actor: {
              type: "user",
              id: user.id,
              name: user.name,
              role: user.type,
            },
            action: "demo_feature_test",
            outcome: "success",
            details: {
              feature_tested: featureName,
              test_timestamp: Date.now(),
            },
            retentionPolicy: "standard",
          });
          alert("審計記錄已建立！");
          loadEnterpriseData(); // Refresh audit events
          break;

        case "permission":
          const canViewReports = await hasResourcePermission("report", "view");
          alert(
            `權限檢查結果：${canViewReports ? "有權限" : "無權限"} 查看報表`,
          );
          break;

        case "cache":
          if (user) {
            // Test cache warming
            await authCache.warmCache(user.id, user);
            const stats = authCache.getStats();
            setCacheStats(stats);
            alert("快取已更新！");
          }
          break;

        case "security":
          // Simulate a security event
          logger.logSecurityEvent({
            type: "suspicious_activity",
            severity: "low",
            userId: user.id,
            userRole: user.type,
            metadata: {
              test_event: true,
              feature: "security_demo",
            },
          });
          alert("安全事件已記錄！");
          break;
      }
    } catch (error) {
      console.error(`Feature test failed:`, error);
      alert(`功能測試失敗：${error}`);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <p className="text-muted-foreground">請先登入以查看企業級功能</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            企業級功能展示
          </CardTitle>
          <CardDescription>
            展示進階 RBAC、審計軌跡、快取系統和監控功能
          </CardDescription>
        </CardHeader>
      </Card>

      {/* User Role and Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            用戶角色與權限
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">當前角色</h4>
            <div className="flex gap-2">
              {roles.map((role) => (
                <Badge key={role} variant="default">
                  {role.replace("role_", "")}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">權限檢查</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(permissions).map(([perm, hasAccess]) => (
                <div key={perm} className="flex items-center gap-2">
                  {hasAccess ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm">{perm}</span>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={() => testFeature("permission")} variant="outline">
            測試動態權限檢查
          </Button>
        </CardContent>
      </Card>

      {/* Cache System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            快取系統
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cacheStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {cacheStats.session.valid}
                </div>
                <div className="text-sm text-muted-foreground">活躍會話</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {cacheStats.permission.valid}
                </div>
                <div className="text-sm text-muted-foreground">快取權限</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(cacheStats.totalMemoryUsage / 1024)}KB
                </div>
                <div className="text-sm text-muted-foreground">記憶體使用</div>
              </div>
            </div>
          )}

          <Button onClick={() => testFeature("cache")} variant="outline">
            測試快取系統
          </Button>
        </CardContent>
      </Card>

      {/* Audit Trail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            審計軌跡
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">最近的審計事件</h4>
            {auditEvents.length > 0 ? (
              auditEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-2 p-2 border rounded"
                >
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{event.action}</span>
                    <div className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <Badge
                    variant={
                      event.outcome === "success" ? "default" : "destructive"
                    }
                  >
                    {event.outcome}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">暫無審計事件</p>
            )}
          </div>

          <Button onClick={() => testFeature("audit")} variant="outline">
            建立測試審計記錄
          </Button>
        </CardContent>
      </Card>

      {/* Monitoring and Logging */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            監控與日誌
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={() => testFeature("logging")} variant="outline">
              測試日誌記錄
            </Button>
            <Button onClick={() => testFeature("security")} variant="outline">
              測試安全事件
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}
