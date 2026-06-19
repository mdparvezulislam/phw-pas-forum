import "server-only";

import { getDatabase, schema } from "@/db";
import type { NewAuditLog } from "@/db/schema/audit-logs";
import { headers } from "next/headers";

export class AuditService {
  async log(
    userId: string | null,
    action: string,
    options: {
      resource?: string;
      resourceId?: string;
      metadata?: Record<string, unknown>;
    } = {},
  ): Promise<void> {
    const db = getDatabase();
    const headersList = await headers();

    const entry: NewAuditLog = {
      userId,
      action,
      resource: options.resource,
      resourceId: options.resourceId,
      ipAddress: headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "unknown",
      userAgent: headersList.get("user-agent") ?? "unknown",
      metadata: options.metadata ?? null,
    };

    await db.insert(schema.auditLogs).values(entry);
  }

  async getByUser(
    userId: string,
    limit = 50,
    offset = 0,
  ) {
    const db = getDatabase();
    return db.query.auditLogs.findMany({
      where: (logs, { eq }) => eq(logs.userId, userId),
      orderBy: (logs, { desc }) => [desc(logs.createdAt)],
      limit,
      offset,
    });
  }
}

export const auditService = new AuditService();
