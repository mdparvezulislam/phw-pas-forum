import "server-only";
import { headers } from "next/headers";
import { lt } from "drizzle-orm";
import { getDatabase, schema } from "@/db";
import type { NewAuditLog } from "@/db/schema/audit-logs";
import { QUEUE_NAMES } from "@/constants";
import { queueService } from "@/modules/performance/queue";
import { logger } from "@/lib/logger";
import { redisService } from "@/modules/performance/cache/redis-service";

const SECURITY_EVENTS = new Set([
  "AUTH_LOGIN_SUCCESS",
  "AUTH_LOGIN_FAILED",
  "AUTH_LOGOUT",
  "AUTH_REGISTER",
  "AUTH_PASSWORD_RESET_REQUEST",
  "AUTH_PASSWORD_RESET_COMPLETE",
  "AUTH_EMAIL_VERIFY",
  "AUTH_2FA_ENABLE",
  "AUTH_2FA_DISABLE",
  "AUTH_SESSION_REVOKED",
  "AUTH_DEVICE_TRUSTED",
  "AUTH_DEVICE_REVOKED",
  "AUTH_SUSPICIOUS_LOGIN",
  "USER_ROLE_CHANGED",
  "USER_PERMISSION_CHANGED",
  "USER_BANNED",
  "USER_UNBANNED",
  "USER_WARNED",
  "USER_DELETED",
  "USER_MERGED",
  "ADMIN_ACTION",
  "MODERATION_ACTION",
  "SETTINGS_CHANGED",
  "SECURITY_VIOLATION",
  "RATE_LIMIT_EXCEEDED",
  "CSRF_VIOLATION",
  "API_KEY_CREATED",
  "API_KEY_REVOKED",
  "CONTENT_REPORTED",
  "CONTENT_REMOVED",
  "MARKETPLACE_FLAGGED",
  "PAYMENT_ACTION",
  "MEMBERSHIP_CHANGED",
]);

export class EnhancedAuditService {
  async log(
    userId: string | null,
    action: string,
    options: {
      resource?: string;
      resourceId?: string;
      metadata?: Record<string, unknown>;
      ipAddress?: string;
      userAgent?: string;
      severity?: "low" | "medium" | "high" | "critical";
      bypassQueue?: boolean;
    } = {},
  ): Promise<void> {
    let ip: string;
    let ua: string;

    try {
      const headersList = await headers();
      ip =
        options.ipAddress ??
        headersList.get("x-forwarded-for") ??
        headersList.get("x-real-ip") ??
        "unknown";
      ua = options.userAgent ?? headersList.get("user-agent") ?? "unknown";
    } catch {
      ip = options.ipAddress ?? "unknown";
      ua = options.userAgent ?? "unknown";
    }

    const entry: NewAuditLog = {
      userId,
      action,
      resource: options.resource ?? null,
      resourceId: options.resourceId ?? null,
      ipAddress: ip,
      userAgent: ua,
      metadata: options.metadata
        ? {
            ...options.metadata,
            severity: options.severity ?? "low",
            timestamp: new Date().toISOString(),
          }
        : {
            severity: options.severity ?? "low",
            timestamp: new Date().toISOString(),
          },
    };

    if (SECURITY_EVENTS.has(action) || action.startsWith("SECURITY_")) {
      logger.warn("[Audit] Security event", {
        action,
        userId,
        ip,
        severity: options.severity,
      });

      await redisService.set(
        `security:events:${action}:${Date.now()}`,
        { ...entry, loggedAt: new Date().toISOString() },
        { ttl: 86400 },
      );

      await redisService.expire(`security:events:${action}`, 86400);
    }

    if (options.bypassQueue) {
      try {
        const db = getDatabase();
        await db.insert(schema.auditLogs).values(entry);
      } catch (err) {
        logger.error("[Audit] Direct insert failed, queuing", err as Error, {
          action,
        });
        await this.queueLog(entry);
      }
    } else {
      await this.queueLog(entry);
    }
  }

  private async queueLog(entry: NewAuditLog): Promise<void> {
    await queueService.enqueue(
      QUEUE_NAMES.AUDIT_LOG,
      {
        type: "AUDIT_LOG",
        payload: entry as unknown as Record<string, unknown>,
      },
      {
        attempts: 3,
        removeOnComplete: false,
      },
    );
  }

  async logSecurityEvent(
    event: string,
    userId: string | null,
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    await this.log(userId, event, {
      ...metadata,
      severity: "high",
      resource: "security",
    });
  }

  async logSuspiciousLogin(
    userId: string,
    ipAddress: string,
    userAgent: string,
    reason: string,
  ): Promise<void> {
    await this.log(userId, "AUTH_SUSPICIOUS_LOGIN", {
      resource: "auth",
      resourceId: userId,
      metadata: { reason, ipAddress, userAgent },
      severity: "high",
      ipAddress,
      userAgent,
    });

    const recentLogins = await redisService.get<number>(
      `suspicious:login:${userId}`,
    );
    await redisService.set(
      `suspicious:login:${userId}`,
      (recentLogins ?? 0) + 1,
      { ttl: 86400 },
    );
  }

  async getSecurityEvents(
    action?: string,
    limit = 100,
    offset = 0,
  ): Promise<{
    events: any[];
    total: number;
  }> {
    const db = getDatabase();

    if (action) {
      const events = await db.query.auditLogs.findMany({
        where: (logs: any, { eq }: any) => eq(logs.action, action),
        orderBy: (logs: any, { desc }: any) => [desc(logs.createdAt)],
        limit,
        offset,
      });
      return { events, total: events.length };
    }

    const actions = Array.from(SECURITY_EVENTS);
    const events = await db.query.auditLogs.findMany({
      where: (logs: any, { inArray }: any) => inArray(logs.action, actions),
      orderBy: (logs: any, { desc }: any) => [desc(logs.createdAt)],
      limit,
      offset,
    });

    return { events, total: events.length };
  }

  async getRecentSecurityAlerts(hours = 24): Promise<any[]> {
    const db = getDatabase();
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    return db.query.auditLogs.findMany({
      where: (logs: any, { and, gte, inArray }: any) =>
        and(
          gte(logs.createdAt, since),
          inArray(logs.action, Array.from(SECURITY_EVENTS)),
        ),
      orderBy: (logs: any, { desc }: any) => [desc(logs.createdAt)],
      limit: 50,
    });
  }

  async cleanupOldLogs(daysToKeep = 90): Promise<number> {
    const db = getDatabase();
    const cutoff = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    const result = await db
      .delete(schema.auditLogs)
      .where(lt(schema.auditLogs.createdAt, cutoff));

    return result.length ?? 0;
  }
}

export const enhancedAuditService = new EnhancedAuditService();
