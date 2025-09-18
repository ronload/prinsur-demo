/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Advanced Role-Based Access Control (RBAC) System
 * Provides granular permissions, resource-based access, and dynamic permission evaluation
 */

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: PermissionCondition[];
  description?: string;
}

export interface PermissionCondition {
  type: "user_property" | "resource_property" | "time" | "location" | "custom";
  field: string;
  operator:
    | "equals"
    | "not_equals"
    | "in"
    | "not_in"
    | "gt"
    | "lt"
    | "gte"
    | "lte"
    | "contains";
  value: any;
  customEvaluator?: (context: PermissionContext) => boolean;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[]; // Permission IDs
  inheritsFrom?: string[]; // Role IDs to inherit from
  isSystem?: boolean; // System roles cannot be deleted
}

export interface PermissionContext {
  user: {
    id: string;
    type: string;
    email: string;
    name: string;
    properties?: Record<string, any>;
  };
  resource?: {
    id: string;
    type: string;
    owner?: string;
    properties?: Record<string, any>;
  };
  environment?: {
    timestamp: number;
    ipAddress?: string;
    userAgent?: string;
    location?: {
      country?: string;
      city?: string;
    };
  };
  metadata?: Record<string, any>;
}

class AdvancedRBACSystem {
  private permissions: Map<string, Permission> = new Map();
  private roles: Map<string, Role> = new Map();
  private userRoleCache: Map<string, string[]> = new Map();
  private static instance: AdvancedRBACSystem;

  static getInstance(): AdvancedRBACSystem {
    if (!AdvancedRBACSystem.instance) {
      AdvancedRBACSystem.instance = new AdvancedRBACSystem();
      AdvancedRBACSystem.instance.initializeDefaultRolesAndPermissions();
    }
    return AdvancedRBACSystem.instance;
  }

  // Permission management
  createPermission(permission: Permission): void {
    this.permissions.set(permission.id, permission);
  }

  createRole(role: Role): void {
    this.roles.set(role.id, role);
    this.clearUserRoleCache(); // Clear cache when roles change
  }

  // Check if user has permission
  async hasPermission(
    userId: string,
    permissionId: string,
    context?: Partial<PermissionContext>,
  ): Promise<boolean> {
    const permission = this.permissions.get(permissionId);
    if (!permission) {
      return false;
    }

    const userRoles = await this.getUserRoles(userId);
    const hasPermissionInRole = userRoles.some((roleId) => {
      const role = this.roles.get(roleId);
      return role?.permissions.includes(permissionId);
    });

    if (!hasPermissionInRole) {
      return false;
    }

    // Evaluate conditions if present
    if (permission.conditions && permission.conditions.length > 0 && context) {
      return this.evaluateConditions(permission.conditions, {
        user: context.user!,
        resource: context.resource,
        environment: context.environment || { timestamp: Date.now() },
        metadata: context.metadata,
      });
    }

    return true;
  }

  // Check resource-based permission
  async hasResourcePermission(
    userId: string,
    resource: string,
    action: string,
    context?: Partial<PermissionContext>,
  ): Promise<boolean> {
    const relevantPermissions = Array.from(this.permissions.values()).filter(
      (p) => p.resource === resource && p.action === action,
    );

    for (const permission of relevantPermissions) {
      if (await this.hasPermission(userId, permission.id, context)) {
        return true;
      }
    }

    return false;
  }

  // Get user roles with inheritance
  async getUserRoles(userId: string): Promise<string[]> {
    // Check cache first
    const cached = this.userRoleCache.get(userId);
    if (cached) {
      return cached;
    }

    // In a real application, this would query your database
    // For demo purposes, we'll derive roles from user type
    const userRoles = await this.deriveUserRoles(userId);
    const expandedRoles = this.expandRolesWithInheritance(userRoles);

    this.userRoleCache.set(userId, expandedRoles);
    return expandedRoles;
  }

  // Expand roles with inheritance
  private expandRolesWithInheritance(roleIds: string[]): string[] {
    const expanded = new Set<string>();
    const toProcess = [...roleIds];

    while (toProcess.length > 0) {
      const roleId = toProcess.pop()!;
      if (expanded.has(roleId)) continue;

      expanded.add(roleId);
      const role = this.roles.get(roleId);
      if (role?.inheritsFrom) {
        toProcess.push(...role.inheritsFrom);
      }
    }

    return Array.from(expanded);
  }

  // Evaluate permission conditions
  private evaluateConditions(
    conditions: PermissionCondition[],
    context: PermissionContext,
  ): boolean {
    return conditions.every((condition) =>
      this.evaluateCondition(condition, context),
    );
  }

  private evaluateCondition(
    condition: PermissionCondition,
    context: PermissionContext,
  ): boolean {
    let actualValue: any;

    switch (condition.type) {
      case "user_property":
        actualValue =
          context.user.properties?.[condition.field] ??
          context.user[condition.field as keyof typeof context.user];
        break;
      case "resource_property":
        if (!context.resource) return false;
        actualValue =
          context.resource.properties?.[condition.field] ??
          context.resource[condition.field as keyof typeof context.resource];
        break;
      case "time":
        actualValue = context.environment?.timestamp || Date.now();
        break;
      case "location":
        actualValue =
          context.environment?.location?.[
            condition.field as keyof NonNullable<
              NonNullable<typeof context.environment>["location"]
            >
          ];
        break;
      case "custom":
        return condition.customEvaluator
          ? condition.customEvaluator(context)
          : false;
      default:
        return false;
    }

    return this.evaluateOperator(
      actualValue,
      condition.operator,
      condition.value,
    );
  }

  private evaluateOperator(
    actual: any,
    operator: string,
    expected: any,
  ): boolean {
    switch (operator) {
      case "equals":
        return actual === expected;
      case "not_equals":
        return actual !== expected;
      case "in":
        return Array.isArray(expected) && expected.includes(actual);
      case "not_in":
        return Array.isArray(expected) && !expected.includes(actual);
      case "gt":
        return actual > expected;
      case "lt":
        return actual < expected;
      case "gte":
        return actual >= expected;
      case "lte":
        return actual <= expected;
      case "contains":
        return typeof actual === "string" && actual.includes(expected);
      default:
        return false;
    }
  }

  // Helper to derive roles from user type (demo implementation)
  private async deriveUserRoles(userId: string): Promise<string[]> {
    // In production, this would query your database
    // For demo, we'll use the user type from the stored user data
    try {
      if (typeof window !== "undefined") {
        const userData = localStorage.getItem("prinsur_user");
        if (userData) {
          const user = JSON.parse(userData);
          if (user.id === userId) {
            return [`role_${user.type}`];
          }
        }
      }
    } catch {
      // Ignore parsing errors
    }

    return ["role_guest"];
  }

  private clearUserRoleCache(): void {
    this.userRoleCache.clear();
  }

  // Initialize default roles and permissions
  private initializeDefaultRolesAndPermissions(): void {
    // Define permissions
    const permissions: Permission[] = [
      // Consumer permissions
      {
        id: "policy.view.own",
        name: "View Own Policies",
        resource: "policy",
        action: "view",
        conditions: [
          {
            type: "resource_property",
            field: "owner",
            operator: "equals",
            value: "current_user",
          },
        ],
      },
      {
        id: "claim.create.own",
        name: "Create Own Claims",
        resource: "claim",
        action: "create",
      },
      {
        id: "profile.edit.own",
        name: "Edit Own Profile",
        resource: "profile",
        action: "edit",
        conditions: [
          {
            type: "user_property",
            field: "id",
            operator: "equals",
            value: "resource_owner",
          },
        ],
      },

      // Agent permissions
      {
        id: "client.view.assigned",
        name: "View Assigned Clients",
        resource: "client",
        action: "view",
        conditions: [
          {
            type: "resource_property",
            field: "assigned_agent",
            operator: "equals",
            value: "current_user",
          },
        ],
      },
      {
        id: "policy.manage.assigned",
        name: "Manage Assigned Policies",
        resource: "policy",
        action: "manage",
      },
      {
        id: "claim.process.assigned",
        name: "Process Assigned Claims",
        resource: "claim",
        action: "process",
      },

      // Manager permissions
      {
        id: "report.view.team",
        name: "View Team Reports",
        resource: "report",
        action: "view",
        conditions: [
          {
            type: "user_property",
            field: "team",
            operator: "equals",
            value: "report_team",
          },
        ],
      },
      {
        id: "agent.manage.team",
        name: "Manage Team Agents",
        resource: "agent",
        action: "manage",
      },

      // Admin permissions
      {
        id: "system.configure.all",
        name: "Configure System",
        resource: "system",
        action: "configure",
      },
      {
        id: "user.manage.all",
        name: "Manage All Users",
        resource: "user",
        action: "manage",
      },
      {
        id: "audit.view.all",
        name: "View All Audit Logs",
        resource: "audit",
        action: "view",
      },
    ];

    permissions.forEach((p) => this.createPermission(p));

    // Define roles
    const roles: Role[] = [
      {
        id: "role_consumer",
        name: "Consumer",
        description: "Regular insurance consumers",
        permissions: [
          "policy.view.own",
          "claim.create.own",
          "profile.edit.own",
        ],
        isSystem: true,
      },
      {
        id: "role_agent",
        name: "Insurance Agent",
        description: "Insurance sales agents",
        permissions: [
          "client.view.assigned",
          "policy.manage.assigned",
          "claim.process.assigned",
        ],
        inheritsFrom: ["role_consumer"], // Agents can also act as consumers
        isSystem: true,
      },
      {
        id: "role_manager",
        name: "Team Manager",
        description: "Manages teams of agents",
        permissions: ["report.view.team", "agent.manage.team"],
        inheritsFrom: ["role_agent"],
        isSystem: true,
      },
      {
        id: "role_admin",
        name: "System Administrator",
        description: "Full system access",
        permissions: [
          "system.configure.all",
          "user.manage.all",
          "audit.view.all",
        ],
        inheritsFrom: ["role_manager"],
        isSystem: true,
      },
      {
        id: "role_guest",
        name: "Guest",
        description: "Unauthenticated users",
        permissions: [],
        isSystem: true,
      },
    ];

    roles.forEach((r) => this.createRole(r));
  }

  // Admin methods
  getAllPermissions(): Permission[] {
    return Array.from(this.permissions.values());
  }

  getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  getUserEffectivePermissions(userId: string): Promise<Permission[]> {
    return this.getUserRoles(userId).then((roleIds) => {
      const permissionIds = new Set<string>();

      roleIds.forEach((roleId) => {
        const role = this.roles.get(roleId);
        if (role) {
          role.permissions.forEach((pId) => permissionIds.add(pId));
        }
      });

      return Array.from(permissionIds)
        .map((id) => this.permissions.get(id))
        .filter(Boolean) as Permission[];
    });
  }
}

// Export singleton instance
export const rbac = AdvancedRBACSystem.getInstance();

// Utility functions for easy permission checking
export const checkPermission = (
  userId: string,
  permissionId: string,
  context?: Partial<PermissionContext>,
) => rbac.hasPermission(userId, permissionId, context);

export const checkResourcePermission = (
  userId: string,
  resource: string,
  action: string,
  context?: Partial<PermissionContext>,
) => rbac.hasResourcePermission(userId, resource, action, context);

// React hook for permission checking
export function usePermissions(userId?: string) {
  return {
    hasPermission: (
      permissionId: string,
      context?: Partial<PermissionContext>,
    ) =>
      userId
        ? checkPermission(userId, permissionId, context)
        : Promise.resolve(false),
    hasResourcePermission: (
      resource: string,
      action: string,
      context?: Partial<PermissionContext>,
    ) =>
      userId
        ? checkResourcePermission(userId, resource, action, context)
        : Promise.resolve(false),
    getUserRoles: () =>
      userId ? rbac.getUserRoles(userId) : Promise.resolve([]),
    getEffectivePermissions: () =>
      userId ? rbac.getUserEffectivePermissions(userId) : Promise.resolve([]),
  };
}
