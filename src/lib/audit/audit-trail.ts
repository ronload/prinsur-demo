/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Enterprise Audit Trail System
 * Comprehensive auditing for compliance, security, and operational monitoring
 */

import { logger } from "@/lib/monitoring/enterprise-logger";
import { User } from "@/contexts/auth-context";

export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  category: AuditCategory;
  severity: "low" | "medium" | "high" | "critical";
  actor: AuditActor;
  target?: AuditTarget;
  action: string;
  outcome: "success" | "failure" | "partial";
  details: Record<string, any>;
  metadata: AuditMetadata;
  complianceFlags?: string[];
  retentionPolicy: "standard" | "extended" | "permanent";
}

export interface AuditActor {
  type: "user" | "system" | "api" | "service";
  id: string;
  name?: string;
  role?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface AuditTarget {
  type: "user" | "policy" | "claim" | "system" | "document" | "configuration";
  id: string;
  name?: string;
  owner?: string;
  classification?: "public" | "internal" | "confidential" | "restricted";
}

export interface AuditMetadata {
  source: "web" | "mobile" | "api" | "system" | "batch";
  version: string;
  environment: "development" | "staging" | "production";
  correlation_id?: string;
  request_id?: string;
  geographic_location?: string;
  regulatory_context?: string[];
}

export type AuditEventType =
  | "authentication"
  | "authorization"
  | "data_access"
  | "data_modification"
  | "system_configuration"
  | "security_incident"
  | "business_transaction"
  | "compliance_event";

export type AuditCategory =
  | "security"
  | "privacy"
  | "financial"
  | "operational"
  | "compliance"
  | "system"
  | "business";

export interface AuditQuery {
  startDate?: string;
  endDate?: string;
  eventTypes?: AuditEventType[];
  categories?: AuditCategory[];
  actorIds?: string[];
  targetIds?: string[];
  severity?: Array<"low" | "medium" | "high" | "critical">;
  outcomes?: Array<"success" | "failure" | "partial">;
  complianceFlags?: string[];
  limit?: number;
  offset?: number;
}

class AuditTrailSystem {
  private events: Map<string, AuditEvent> = new Map();
  private indices: {
    byActor: Map<string, Set<string>>;
    byTarget: Map<string, Set<string>>;
    byDate: Map<string, Set<string>>;
    byType: Map<AuditEventType, Set<string>>;
  };

  private static instance: AuditTrailSystem;

  static getInstance(): AuditTrailSystem {
    if (!AuditTrailSystem.instance) {
      AuditTrailSystem.instance = new AuditTrailSystem();
    }
    return AuditTrailSystem.instance;
  }

  constructor() {
    this.indices = {
      byActor: new Map(),
      byTarget: new Map(),
      byDate: new Map(),
      byType: new Map(),
    };

    // Set up periodic cleanup
    setInterval(() => this.cleanup(), 24 * 60 * 60 * 1000); // Daily cleanup
  }

  // Record audit event
  async record(
    event: Omit<AuditEvent, "id" | "timestamp" | "metadata"> & {
      metadata?: Partial<AuditMetadata>;
    },
  ): Promise<string> {
    const auditId = this.generateAuditId();

    const fullEvent: AuditEvent = {
      ...event,
      id: auditId,
      timestamp: new Date().toISOString(),
      metadata: {
        source: "web",
        version: "1.0.0",
        environment: (process.env.NODE_ENV as any) || "development",
        ...event.metadata,
      },
    };

    // Store event
    this.events.set(auditId, fullEvent);

    // Update indices
    this.updateIndices(auditId, fullEvent);

    // Log to monitoring system
    logger.info("audit", "event_recorded", {
      audit_id: auditId,
      event_type: fullEvent.eventType,
      category: fullEvent.category,
      severity: fullEvent.severity,
      actor_id: fullEvent.actor.id,
      target_id: fullEvent.target?.id,
      action: fullEvent.action,
      outcome: fullEvent.outcome,
    });

    // Send to external audit storage in production
    if (process.env.NODE_ENV === "production") {
      await this.sendToExternalStorage(fullEvent);
    }

    // Check for compliance violations
    await this.checkComplianceViolations(fullEvent);

    return auditId;
  }

  // Query audit events
  query(criteria: AuditQuery): AuditEvent[] {
    let candidateIds = new Set<string>(this.events.keys());

    // Filter by date range
    if (criteria.startDate || criteria.endDate) {
      candidateIds = this.filterByDateRange(
        candidateIds,
        criteria.startDate,
        criteria.endDate,
      );
    }

    // Filter by event types
    if (criteria.eventTypes && criteria.eventTypes.length > 0) {
      candidateIds = this.intersectSets(
        candidateIds,
        this.unionSets(
          criteria.eventTypes.map(
            (type) => this.indices.byType.get(type) || new Set(),
          ),
        ),
      );
    }

    // Filter by actors
    if (criteria.actorIds && criteria.actorIds.length > 0) {
      candidateIds = this.intersectSets(
        candidateIds,
        this.unionSets(
          criteria.actorIds.map(
            (id) => this.indices.byActor.get(id) || new Set(),
          ),
        ),
      );
    }

    // Filter by targets
    if (criteria.targetIds && criteria.targetIds.length > 0) {
      candidateIds = this.intersectSets(
        candidateIds,
        this.unionSets(
          criteria.targetIds.map(
            (id) => this.indices.byTarget.get(id) || new Set(),
          ),
        ),
      );
    }

    // Get events and apply additional filters
    const events = Array.from(candidateIds)
      .map((id) => this.events.get(id))
      .filter(Boolean) as AuditEvent[];

    let filteredEvents = events;

    // Filter by categories
    if (criteria.categories && criteria.categories.length > 0) {
      filteredEvents = filteredEvents.filter((e) =>
        criteria.categories!.includes(e.category),
      );
    }

    // Filter by severity
    if (criteria.severity && criteria.severity.length > 0) {
      filteredEvents = filteredEvents.filter((e) =>
        criteria.severity!.includes(e.severity),
      );
    }

    // Filter by outcomes
    if (criteria.outcomes && criteria.outcomes.length > 0) {
      filteredEvents = filteredEvents.filter((e) =>
        criteria.outcomes!.includes(e.outcome),
      );
    }

    // Filter by compliance flags
    if (criteria.complianceFlags && criteria.complianceFlags.length > 0) {
      filteredEvents = filteredEvents.filter(
        (e) =>
          e.complianceFlags &&
          criteria.complianceFlags!.some((flag) =>
            e.complianceFlags!.includes(flag),
          ),
      );
    }

    // Sort by timestamp (newest first)
    filteredEvents.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    // Apply pagination
    const offset = criteria.offset || 0;
    const limit = criteria.limit || 100;

    return filteredEvents.slice(offset, offset + limit);
  }

  // Convenience methods for common audit scenarios
  async recordAuthentication(
    user: User,
    action: "login" | "logout" | "login_failed",
    ipAddress?: string,
    userAgent?: string,
  ): Promise<string> {
    return this.record({
      eventType: "authentication",
      category: "security",
      severity: action === "login_failed" ? "medium" : "low",
      actor: {
        type: "user",
        id: user.id,
        name: user.name,
        role: user.type,
        ipAddress,
        userAgent,
      },
      action,
      outcome: action === "login_failed" ? "failure" : "success",
      details: {
        email: user.email,
        user_type: user.type,
      },
      complianceFlags: ["GDPR", "SOX"],
      retentionPolicy: "extended",
    });
  }

  async recordDataAccess(
    user: User,
    target: AuditTarget,
    action: string,
    outcome: "success" | "failure" = "success",
  ): Promise<string> {
    return this.record({
      eventType: "data_access",
      category: "privacy",
      severity: outcome === "failure" ? "medium" : "low",
      actor: {
        type: "user",
        id: user.id,
        name: user.name,
        role: user.type,
      },
      target,
      action,
      outcome,
      details: {
        access_method: "web_interface",
        data_classification: target.classification,
      },
      complianceFlags: ["GDPR", "HIPAA"],
      retentionPolicy: "extended",
    });
  }

  async recordSystemConfiguration(
    user: User,
    configType: string,
    changes: Record<string, any>,
  ): Promise<string> {
    return this.record({
      eventType: "system_configuration",
      category: "system",
      severity: "high",
      actor: {
        type: "user",
        id: user.id,
        name: user.name,
        role: user.type,
      },
      target: {
        type: "system",
        id: configType,
        name: `System Configuration: ${configType}`,
      },
      action: "modify_configuration",
      outcome: "success",
      details: {
        configuration_type: configType,
        changes,
        change_count: Object.keys(changes).length,
      },
      complianceFlags: ["SOX", "COMPLIANCE"],
      retentionPolicy: "permanent",
    });
  }

  async recordSecurityIncident(
    severity: "low" | "medium" | "high" | "critical",
    incidentType: string,
    details: Record<string, any>,
    actor?: Partial<AuditActor>,
  ): Promise<string> {
    return this.record({
      eventType: "security_incident",
      category: "security",
      severity,
      actor: {
        type: "system",
        id: "security_monitor",
        name: "Security Monitoring System",
        ...actor,
      },
      action: `security_incident_${incidentType}`,
      outcome: "partial",
      details: {
        incident_type: incidentType,
        ...details,
      },
      complianceFlags: ["SECURITY", "SOX"],
      retentionPolicy: "permanent",
    });
  }

  // Analytics and reporting
  getAuditSummary(timeRange: { start: string; end: string }) {
    const events = this.query({
      startDate: timeRange.start,
      endDate: timeRange.end,
    });

    const summary = {
      total_events: events.length,
      by_type: {} as Record<string, number>,
      by_category: {} as Record<string, number>,
      by_severity: {} as Record<string, number>,
      by_outcome: {} as Record<string, number>,
      top_actors: {} as Record<string, number>,
      compliance_events: 0,
      security_incidents: 0,
    };

    events.forEach((event) => {
      // Count by type
      summary.by_type[event.eventType] =
        (summary.by_type[event.eventType] || 0) + 1;

      // Count by category
      summary.by_category[event.category] =
        (summary.by_category[event.category] || 0) + 1;

      // Count by severity
      summary.by_severity[event.severity] =
        (summary.by_severity[event.severity] || 0) + 1;

      // Count by outcome
      summary.by_outcome[event.outcome] =
        (summary.by_outcome[event.outcome] || 0) + 1;

      // Count by actor
      summary.top_actors[event.actor.id] =
        (summary.top_actors[event.actor.id] || 0) + 1;

      // Count compliance events
      if (event.complianceFlags && event.complianceFlags.length > 0) {
        summary.compliance_events++;
      }

      // Count security incidents
      if (event.eventType === "security_incident") {
        summary.security_incidents++;
      }
    });

    return summary;
  }

  // Compliance reporting
  generateComplianceReport(
    regulation: string,
    timeRange: { start: string; end: string },
  ) {
    const events = this.query({
      startDate: timeRange.start,
      endDate: timeRange.end,
      complianceFlags: [regulation],
    });

    return {
      regulation,
      time_range: timeRange,
      total_events: events.length,
      events_by_type: events.reduce(
        (acc, event) => {
          acc[event.eventType] = (acc[event.eventType] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
      critical_events: events.filter((e) => e.severity === "critical").length,
      failed_events: events.filter((e) => e.outcome === "failure").length,
      events: events.map((event) => ({
        id: event.id,
        timestamp: event.timestamp,
        type: event.eventType,
        action: event.action,
        actor: event.actor.id,
        outcome: event.outcome,
        severity: event.severity,
      })),
    };
  }

  // Private helper methods
  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private updateIndices(id: string, event: AuditEvent): void {
    // Index by actor
    if (!this.indices.byActor.has(event.actor.id)) {
      this.indices.byActor.set(event.actor.id, new Set());
    }
    this.indices.byActor.get(event.actor.id)!.add(id);

    // Index by target
    if (event.target) {
      if (!this.indices.byTarget.has(event.target.id)) {
        this.indices.byTarget.set(event.target.id, new Set());
      }
      this.indices.byTarget.get(event.target.id)!.add(id);
    }

    // Index by date
    const dateKey = event.timestamp.split("T")[0];
    if (!this.indices.byDate.has(dateKey)) {
      this.indices.byDate.set(dateKey, new Set());
    }
    this.indices.byDate.get(dateKey)!.add(id);

    // Index by type
    if (!this.indices.byType.has(event.eventType)) {
      this.indices.byType.set(event.eventType, new Set());
    }
    this.indices.byType.get(event.eventType)!.add(id);
  }

  private filterByDateRange(
    candidateIds: Set<string>,
    startDate?: string,
    endDate?: string,
  ): Set<string> {
    if (!startDate && !endDate) return candidateIds;

    const filtered = new Set<string>();
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();

    for (const id of candidateIds) {
      const event = this.events.get(id);
      if (event) {
        const eventDate = new Date(event.timestamp);
        if (eventDate >= start && eventDate <= end) {
          filtered.add(id);
        }
      }
    }

    return filtered;
  }

  private intersectSets(set1: Set<string>, set2: Set<string>): Set<string> {
    const result = new Set<string>();
    for (const item of set1) {
      if (set2.has(item)) {
        result.add(item);
      }
    }
    return result;
  }

  private unionSets(sets: Set<string>[]): Set<string> {
    const result = new Set<string>();
    for (const set of sets) {
      for (const item of set) {
        result.add(item);
      }
    }
    return result;
  }

  private async sendToExternalStorage(event: AuditEvent): Promise<void> {
    // In production, send to external audit storage (e.g., AWS CloudTrail, Azure Monitor, etc.)
    try {
      // await externalAuditService.store(event);
    } catch (error) {
      logger.error("audit", "external_storage_failed", {
        audit_id: event.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  private async checkComplianceViolations(event: AuditEvent): Promise<void> {
    // Check for compliance violations and alert if necessary
    if (event.severity === "critical" || event.outcome === "failure") {
      logger.logSecurityEvent({
        type: "suspicious_activity",
        severity: event.severity as any,
        userId: event.actor.id,
        userRole: event.actor.role,
        metadata: {
          audit_event_id: event.id,
          compliance_flags: event.complianceFlags,
          potential_violation: true,
        },
      });
    }
  }

  private cleanup(): void {
    // Remove events that have exceeded their retention policy
    const now = new Date();
    let removedCount = 0;

    for (const [id, event] of this.events.entries()) {
      const eventDate = new Date(event.timestamp);
      let shouldRemove = false;

      switch (event.retentionPolicy) {
        case "standard":
          // Keep for 7 years (regulatory requirement)
          shouldRemove =
            now.getTime() - eventDate.getTime() > 7 * 365 * 24 * 60 * 60 * 1000;
          break;
        case "extended":
          // Keep for 10 years
          shouldRemove =
            now.getTime() - eventDate.getTime() >
            10 * 365 * 24 * 60 * 60 * 1000;
          break;
        case "permanent":
          // Never remove
          shouldRemove = false;
          break;
      }

      if (shouldRemove) {
        this.events.delete(id);
        this.removeFromIndices(id, event);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      logger.info("audit", "cleanup_completed", {
        removed_events: removedCount,
        remaining_events: this.events.size,
      });
    }
  }

  private removeFromIndices(id: string, event: AuditEvent): void {
    this.indices.byActor.get(event.actor.id)?.delete(id);
    if (event.target) {
      this.indices.byTarget.get(event.target.id)?.delete(id);
    }
    const dateKey = event.timestamp.split("T")[0];
    this.indices.byDate.get(dateKey)?.delete(id);
    this.indices.byType.get(event.eventType)?.delete(id);
  }
}

// Export singleton instance
export const auditTrail = AuditTrailSystem.getInstance();

// Convenience functions
export const recordAudit = (event: Parameters<typeof auditTrail.record>[0]) =>
  auditTrail.record(event);

export const queryAudit = (criteria: AuditQuery) => auditTrail.query(criteria);

export const recordUserAuthentication = (
  user: User,
  action: "login" | "logout" | "login_failed",
  ipAddress?: string,
  userAgent?: string,
) => auditTrail.recordAuthentication(user, action, ipAddress, userAgent);

export const recordUserDataAccess = (
  user: User,
  target: AuditTarget,
  action: string,
  outcome?: "success" | "failure",
) => auditTrail.recordDataAccess(user, target, action, outcome);
