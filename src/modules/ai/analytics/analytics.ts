import { desc, sql } from "drizzle-orm";
import { getDatabase, schema } from "@/db";

export class AIAnalyticsService {
  /**
   * Fetches centralized metrics logs, active caps, and prompt configurations.
   */
  static async getAIAnalytics() {
    const db = getDatabase();

    // Group usage statistics
    const usageSummary = await db
      .select({
        provider: schema.aiUsageLogs.provider,
        model: schema.aiUsageLogs.model,
        totalCalls: sql<number>`count(*)`,
        totalCost: sql<number>`sum(${schema.aiUsageLogs.costMicrocents})`,
        avgLatency: sql<number>`avg(${schema.aiUsageLogs.latencyMs})`,
      })
      .from(schema.aiUsageLogs)
      .groupBy(schema.aiUsageLogs.provider, schema.aiUsageLogs.model);

    const prompts = await db.query.aiPromptTemplates.findMany({
      orderBy: [desc(schema.aiPromptTemplates.updatedAt)],
    });

    const auditLogs = await db.query.aiAuditLogs.findMany({
      orderBy: [desc(schema.aiAuditLogs.createdAt)],
      limit: 30,
      with: {
        user: {
          columns: { username: true, displayName: true },
        },
      },
    });

    const limits = await db.query.aiCostLimits.findMany();

    return {
      usageSummary,
      prompts,
      auditLogs,
      limits,
    };
  }
}
