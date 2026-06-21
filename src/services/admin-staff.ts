import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";
import { getDatabase, schema } from "@/db";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";
import { auditService } from "@/services/audit";

export class AdminStaffService {
  async getStaffMembers() {
    const db = getDatabase();

    const staffRoles = [
      "MODERATOR",
      "SENIOR_MODERATOR",
      "MARKETPLACE_MODERATOR",
      "SUPPORT_AGENT",
      "CONTENT_MANAGER",
      "ANALYST",
      "ADMIN",
      "SUPER_ADMIN",
    ];

    return db.query.users.findMany({
      where: (u, { inArray }) =>
        inArray(
          sql`(SELECT name FROM ${schema.roles} WHERE id = ${u.roleId})`,
          staffRoles,
        ),
      with: { role: true },
      orderBy: (u, { asc }) => [asc(u.displayName)],
    });
  }

  async assignStaffRole(userId: string, roleId: string, moderatorId: string) {
    const db = getDatabase();

    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId),
      with: { role: true },
    });
    if (!user) throw new Error("User not found");

    const newRole = await db.query.roles.findFirst({
      where: eq(schema.roles.id, roleId),
    });
    if (!newRole) throw new Error("Role not found");

    const oldRoleName = user.role?.name ?? "NONE";

    await db
      .update(schema.users)
      .set({ roleId })
      .where(eq(schema.users.id, userId));

    await auditService.log(moderatorId, AUDIT_ACTIONS.STAFF_ROLE_ASSIGNED, {
      resource: "user",
      resourceId: userId,
      metadata: { oldRole: oldRoleName, newRole: newRole.name },
    });
  }

  async getStaffActivityLog(page = 1, limit = 50) {
    const db = getDatabase();

    const logs = await db.query.staffActionLogs.findMany({
      orderBy: [desc(schema.staffActionLogs.createdAt)],
      limit,
      offset: (page - 1) * limit,
      with: {
        staff: true,
      },
    });

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.staffActionLogs);

    return {
      logs,
      total: Number(countResult[0]?.count ?? 0),
      page,
      limit,
      totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit),
    };
  }

  async logStaffAction(params: {
    staffId: string;
    action: string;
    entityType: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    isAutomated?: boolean;
  }) {
    const db = getDatabase();

    await db.insert(schema.staffActionLogs).values({
      staffId: params.staffId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      metadata: (params.metadata ?? {}) as Record<string, unknown>,
      ipAddress: params.ipAddress ?? null,
      isAutomated: params.isAutomated ?? false,
    });
  }

  // User Management
  async searchUsers(query: string, role?: string, page = 1, limit = 20) {
    const db = getDatabase();
    const conditions: any[] = [];

    if (query) {
      conditions.push(
        sql`(${schema.users.username} ILIKE ${`%${query}%`} OR ${schema.users.displayName} ILIKE ${`%${query}%`} OR ${schema.users.email} ILIKE ${`%${query}%`})`,
      );
    }

    if (role) {
      conditions.push(
        sql`(SELECT name FROM ${schema.roles} WHERE id = ${schema.users.roleId}) = ${role}`,
      );
    }

    const users = await db.query.users.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: { role: true, reputation: true },
      limit,
      offset: (page - 1) * limit,
      orderBy: [desc(schema.users.createdAt)],
    });

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return {
      users,
      total: Number(countResult[0]?.count ?? 0),
      page,
      limit,
      totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit),
    };
  }

  async banUser(params: {
    userId: string;
    reason: string;
    bannedBy: string;
    isPermanent: boolean;
    expiresAt?: Date;
  }) {
    const db = getDatabase();

    const existingBan = await db.query.userBans.findFirst({
      where: and(
        eq(schema.userBans.userId, params.userId),
        eq(schema.userBans.isActive, true),
      ),
    });

    if (existingBan) {
      await db
        .update(schema.userBans)
        .set({
          reason: params.reason,
          bannedBy: params.bannedBy,
          isPermanent: params.isPermanent,
          expiresAt: params.expiresAt ?? null,
          updatedAt: new Date(),
        })
        .where(eq(schema.userBans.id, existingBan.id));
    } else {
      await db.insert(schema.userBans).values({
        userId: params.userId,
        reason: params.reason,
        bannedBy: params.bannedBy,
        isPermanent: params.isPermanent,
        expiresAt: params.expiresAt ?? null,
        isActive: true,
      });
    }

    await db
      .update(schema.users)
      .set({ isBanned: true })
      .where(eq(schema.users.id, params.userId));

    await auditService.log(params.bannedBy, AUDIT_ACTIONS.USER_BAN, {
      resource: "user",
      resourceId: params.userId,
      metadata: { reason: params.reason, isPermanent: params.isPermanent },
    });
  }

  async unbanUser(userId: string, moderatorId: string) {
    const db = getDatabase();

    const ban = await db.query.userBans.findFirst({
      where: and(
        eq(schema.userBans.userId, userId),
        eq(schema.userBans.isActive, true),
      ),
    });

    if (!ban) throw new Error("User is not banned");

    await db
      .update(schema.userBans)
      .set({
        isActive: false,
        liftedBy: moderatorId,
        liftedAt: new Date(),
      })
      .where(eq(schema.userBans.id, ban.id));

    await db
      .update(schema.users)
      .set({ isBanned: false })
      .where(eq(schema.users.id, userId));

    await auditService.log(moderatorId, AUDIT_ACTIONS.USER_UNBAN, {
      resource: "user",
      resourceId: userId,
    });
  }

  async warnUser(params: {
    userId: string;
    moderatorId: string;
    reason: string;
    points?: number;
    expiresAt?: Date;
  }) {
    const db = getDatabase();

    const [warning] = await db
      .insert(schema.userWarnings)
      .values({
        userId: params.userId,
        moderatorId: params.moderatorId,
        reason: params.reason,
        points: params.points ?? 0,
        expiresAt: params.expiresAt ?? null,
      })
      .returning();

    await auditService.log(params.moderatorId, AUDIT_ACTIONS.USER_WARNED, {
      resource: "user",
      resourceId: params.userId,
      metadata: {
        warningId: warning.id,
        points: params.points,
        reason: params.reason,
      },
    });

    return warning;
  }

  async getUserDetail(userId: string) {
    const db = getDatabase();

    return db.query.users.findFirst({
      where: eq(schema.users.id, userId),
      with: {
        role: true,
        reputation: true,
        ordersAsBuyer: { limit: 5 },
        ordersAsSeller: { limit: 5 },
        warnings: {
          where: eq(schema.userWarnings.isActive, 1),
        },
        ban: true,
      },
    });
  }

  async getModeratorNotes(targetUserId: string) {
    const db = getDatabase();
    return db.query.moderatorNotes.findMany({
      where: eq(schema.moderatorNotes.targetUserId, targetUserId),
      with: { moderator: true },
      orderBy: [desc(schema.moderatorNotes.createdAt)],
    });
  }

  async createModeratorNote(params: {
    targetUserId: string;
    moderatorId: string;
    note: string;
    visibility: string;
  }) {
    const db = getDatabase();

    const [modNote] = await db
      .insert(schema.moderatorNotes)
      .values(params)
      .returning();

    return modNote;
  }
}

export const adminStaffService = new AdminStaffService();
