import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";
import { getDatabase, schema } from "@/db";

export class AdminModerationService {
  async getUnifiedModerationQueue(page = 1, limit = 20) {
    const db = getDatabase();

    const reports = await db.query.postReports.findMany({
      where: eq(schema.postReports.status, "OPEN"),
      limit,
      offset: (page - 1) * limit,
      orderBy: [desc(schema.postReports.createdAt)],
      with: {
        post: { with: { thread: true } },
        reporter: true,
      },
    });

    const pendingSubmissions = await db.query.marketplaceSubmissions.findMany({
      where: eq(schema.marketplaceSubmissions.status, "PENDING"),
      limit,
      offset: (page - 1) * limit,
      orderBy: [desc(schema.marketplaceSubmissions.submittedAt)],
      with: { listing: true, seller: true },
    });

    const flaggedListings = await db.query.marketplaceFlags.findMany({
      where: eq(schema.marketplaceFlags.status, "PENDING"),
      limit,
      offset: (page - 1) * limit,
      orderBy: [desc(schema.marketplaceFlags.createdAt)],
      with: { listing: true, user: true },
    });

    const pendingDisputes = await db.query.disputes.findMany({
      where: eq(schema.disputes.status, "OPEN"),
      limit,
      orderBy: [desc(schema.disputes.createdAt)],
      with: { order: true, buyer: true, seller: true },
    });

    return {
      reports,
      pendingSubmissions,
      flaggedListings,
      pendingDisputes,
      totals: {
        reports: reports.length,
        submissions: pendingSubmissions.length,
        flags: flaggedListings.length,
        disputes: pendingDisputes.length,
      },
    };
  }

  async resolveReport(params: {
    reportId: string;
    moderatorId: string;
    action: "WARN" | "BAN" | "DELETE" | "DISMISS" | "ESCALATE";
    notes?: string;
  }) {
    const db = getDatabase();

    await db
      .update(schema.postReports)
      .set({
        status: "RESOLVED",
        resolvedBy: params.moderatorId,
        resolvedAt: new Date(),
      })
      .where(eq(schema.postReports.id, params.reportId));
  }

  async getModerationStats() {
    const db = getDatabase();

    const [openReports] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.postReports)
      .where(eq(schema.postReports.status, "OPEN"));

    const [pendingSubmissions] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.marketplaceSubmissions)
      .where(eq(schema.marketplaceSubmissions.status, "PENDING"));

    const [pendingFlags] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.marketplaceFlags)
      .where(eq(schema.marketplaceFlags.status, "PENDING"));

    const [openDisputes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.disputes)
      .where(eq(schema.disputes.status, "OPEN"));

    return {
      openReports: Number(openReports?.count ?? 0),
      pendingSubmissions: Number(pendingSubmissions?.count ?? 0),
      pendingFlags: Number(pendingFlags?.count ?? 0),
      openDisputes: Number(openDisputes?.count ?? 0),
    };
  }
}

export const adminModerationService = new AdminModerationService();
