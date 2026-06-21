"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/modules/auth/guards";
import { Permission } from "@/types/rbac";

/**
 * Get dynamic health status of all infrastructure layers
 */
export async function getSystemHealthAction() {
  try {
    await requirePermission(Permission.ADMIN_VIEW_DASHBOARD);
    const { healthService } = await import("../monitoring/health-service");
    const report = await healthService.getFullHealth();
    return { success: true, data: report };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

/**
 * Get BullMQ background queue counts
 */
export async function getQueueMetricsAction() {
  try {
    await requirePermission(Permission.ADMIN_VIEW_DASHBOARD);
    const { queueManager } = await import("../queue/queue-manager");
    const metrics = await queueManager.getMetrics();
    return { success: true, data: metrics };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

/**
 * Extract live Redis stats (memory usage, connected clients, key count)
 */
export async function getCacheMetricsAction() {
  try {
    await requirePermission(Permission.ADMIN_VIEW_DASHBOARD);
    const { cache } = await import("@/lib/redis");

    const client = (cache as any).client;
    if (!client || (cache as any)._enabled === false) {
      return {
        success: true,
        data: {
          enabled: false,
          memoryUsed: "0 MB",
          keysCount: 0,
          hitRate: "0%",
        },
      };
    }

    const info = await client.info();

    // Simple regex parsing of Redis INFO output
    const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
    const hitsMatch = info.match(/keyspace_hits:([^\r\n]+)/);
    const missesMatch = info.match(/keyspace_misses:([^\r\n]+)/);

    const memoryUsed = memoryMatch ? memoryMatch[1] : "0B";
    const hits = hitsMatch ? Number(hitsMatch[1]) : 0;
    const misses = missesMatch ? Number(hitsMatch[1]) : 0;

    const totalRequests = hits + misses;
    const hitRate =
      totalRequests > 0
        ? `${Math.round((hits / totalRequests) * 100)}%`
        : "N/A";

    // Count keys in current DB
    const keysCount = await client.dbsize().catch(() => 0);

    return {
      success: true,
      data: {
        enabled: true,
        memoryUsed,
        keysCount,
        hitRate,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

/**
 * Fetch Typesense Search Engine lag and latency metrics
 */
export async function getSearchMetricsAction() {
  try {
    await requirePermission(Permission.ADMIN_VIEW_DASHBOARD);
    const { searchMonitor } = await import("../search/monitoring");
    const metrics = await searchMonitor.getMetrics();
    return { success: true, data: metrics };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

/**
 * Fetch dynamic security dashboard details
 */
export async function getSecurityMetricsAction() {
  try {
    await requirePermission(Permission.ADMIN_VIEW_DASHBOARD);
    const { getDatabase, schema } = await import("@/db");
    const { and, count, desc, eq, gt, or } = await import("drizzle-orm");

    const db = getDatabase();
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 1. Active User Bans Count
    const [bansResult] = await db
      .select({ count: count() })
      .from(schema.userBans)
      .where(
        or(
          eq(schema.userBans.isPermanent, true),
          gt(schema.userBans.expiresAt, now),
        ),
      );

    // 2. Failed Logins last 24h
    const [failedLoginsResult] = await db
      .select({ count: count() })
      .from(schema.auditLogs)
      .where(
        and(
          eq(schema.auditLogs.action, "auth:login_failed"),
          gt(schema.auditLogs.createdAt, twentyFourHoursAgo),
        ),
      );

    // 3. Suspicious Login Alerts last 24h
    const [suspiciousLoginsResult] = await db
      .select({ count: count() })
      .from(schema.auditLogs)
      .where(
        and(
          eq(schema.auditLogs.action, "security:suspicious_login"),
          gt(schema.auditLogs.createdAt, twentyFourHoursAgo),
        ),
      );

    // 4. Failed Jobs / DLQ Alerts last 24h
    const [failedJobsResult] = await db
      .select({ count: count() })
      .from(schema.auditLogs)
      .where(
        and(
          eq(schema.auditLogs.action, "queue:job_failed"),
          gt(schema.auditLogs.createdAt, twentyFourHoursAgo),
        ),
      );

    // 5. Recent security audit events
    const securityEvents = await db.query.auditLogs.findMany({
      where: or(
        eq(schema.auditLogs.action, "auth:login_failed"),
        eq(schema.auditLogs.action, "security:suspicious_login"),
        eq(schema.auditLogs.action, "admin:user_ban"),
        eq(schema.auditLogs.action, "queue:job_failed"),
      ),
      orderBy: [desc(schema.auditLogs.createdAt)],
      limit: 10,
    });

    return {
      success: true,
      data: {
        activeBans: bansResult?.count ?? 0,
        failedLogins24h: failedLoginsResult?.count ?? 0,
        suspiciousLogins24h: suspiciousLoginsResult?.count ?? 0,
        failedJobs24h: failedJobsResult?.count ?? 0,
        securityEvents,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

/**
 * Manually flush the in-memory L1 cache layer
 */
export async function clearMemoryCacheAction() {
  try {
    await requirePermission(Permission.ADMIN_MANAGE_SETTINGS);
    const { cacheManager } = await import("../cache/cache-manager");
    cacheManager.clearMemoryCache();
    revalidatePath("/admin/operations");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

/**
 * Manually trigger recovery of failed search indexing jobs from the database queue
 */
export async function recoverIndexJobs() {
  try {
    await requirePermission(Permission.ADMIN_MANAGE_SETTINGS);
    const { searchManager } = await import("../search/search-manager");
    const result = await searchManager.recoverIndexJobs();
    revalidatePath("/admin/operations");
    return { success: true, ...result };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}
