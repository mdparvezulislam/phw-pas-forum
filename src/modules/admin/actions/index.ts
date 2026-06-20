"use server";

import { revalidatePath } from "next/cache";
import { requireAuth, requireRole, requirePermission } from "@/modules/auth/guards";
import { RoleName, Permission } from "@/types/rbac";
import { adminMetricsService } from "@/services/admin-metrics";
import { adminStaffService } from "@/services/admin-staff";
import { adminSettingsService } from "@/services/admin-settings";
import { adminModerationService } from "@/services/admin-moderation";
import {
  searchUsersSchema,
  banUserSchema,
  warnUserSchema,
  createModeratorNoteSchema,
  assignRoleSchema,
  updateSettingsSchema,
  createFeatureFlagSchema,
  updateFeatureFlagSchema,
  createAnnouncementSchema,
  resolveReportSchema,
} from "@/validations/admin";
import { auditService } from "@/services/audit";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";

// ===================== DASHBOARD =====================

export async function getDashboardOverviewAction() {
  try {
    const user = await requirePermission(Permission.ADMIN_VIEW_DASHBOARD);
    const overview = await adminMetricsService.getPlatformOverview();
    return { success: true, data: overview };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function getUserAnalyticsAction(days = 30) {
  try {
    await requirePermission(Permission.ANALYTICS_VIEW_USERS);
    const data = await adminMetricsService.getUserAnalytics(days);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function getRevenueAnalyticsAction(days = 30) {
  try {
    await requirePermission(Permission.ANALYTICS_VIEW_REVENUE);
    const data = await adminMetricsService.getRevenueAnalytics(days);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

// ===================== USER MANAGEMENT =====================

export async function searchUsersAction(input: unknown) {
  try {
    const user = await requirePermission(Permission.USER_MANAGE);
    const params = searchUsersSchema.parse(input);
    const data = await adminStaffService.searchUsers(params.query, params.role, params.page, params.limit);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function getUserDetailAction(userId: string) {
  try {
    await requirePermission(Permission.USER_MANAGE);
    const data = await adminStaffService.getUserDetail(userId);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function banUserAction(input: unknown) {
  try {
    const user = await requirePermission(Permission.USER_BAN);
    const params = banUserSchema.parse(input);
    await adminStaffService.banUser({
      userId: params.userId,
      reason: params.reason,
      bannedBy: user.id,
      isPermanent: params.isPermanent,
      expiresAt: params.expiresAt ? new Date(params.expiresAt) : undefined,
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function unbanUserAction(userId: string) {
  try {
    const user = await requirePermission(Permission.USER_BAN);
    await adminStaffService.unbanUser(userId, user.id);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function warnUserAction(input: unknown) {
  try {
    const user = await requirePermission(Permission.USER_WARN);
    const params = warnUserSchema.parse(input);
    await adminStaffService.warnUser({
      userId: params.userId,
      moderatorId: user.id,
      reason: params.reason,
      points: params.points,
      expiresAt: params.expiresAt ? new Date(params.expiresAt) : undefined,
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function assignUserRoleAction(input: unknown) {
  try {
    const user = await requirePermission(Permission.USER_MANAGE);
    const params = assignRoleSchema.parse(input);
    await adminStaffService.assignStaffRole(params.userId, params.roleId, user.id);
    revalidatePath("/admin/users");
    revalidatePath("/admin/staff");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function getModeratorNotesAction(targetUserId: string) {
  try {
    await requirePermission(Permission.MODERATION_MANAGE_NOTES);
    const notes = await adminStaffService.getModeratorNotes(targetUserId);
    return { success: true, data: notes };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function createModeratorNoteAction(input: unknown) {
  try {
    const user = await requirePermission(Permission.MODERATION_MANAGE_NOTES);
    const params = createModeratorNoteSchema.parse(input);
    const note = await adminStaffService.createModeratorNote({
      targetUserId: params.targetUserId,
      moderatorId: user.id,
      note: params.note,
      visibility: params.visibility,
    });
    revalidatePath("/admin/moderation");
    return { success: true, data: note };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

// ===================== STAFF MANAGEMENT =====================

export async function getStaffMembersAction() {
  try {
    await requirePermission(Permission.STAFF_ACCESS);
    const staff = await adminStaffService.getStaffMembers();
    return { success: true, data: staff };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function getStaffActivityAction(page = 1) {
  try {
    await requirePermission(Permission.STAFF_VIEW_LOGS);
    const data = await adminStaffService.getStaffActivityLog(page);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

// ===================== MODERATION =====================

export async function getModerationQueueAction(page = 1) {
  try {
    await requirePermission(Permission.MODERATION_MANAGE_QUEUE);
    const data = await adminModerationService.getUnifiedModerationQueue(page);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function getModerationStatsAction() {
  try {
    await requirePermission(Permission.MODERATION_ACCESS);
    const stats = await adminModerationService.getModerationStats();
    return { success: true, data: stats };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function resolveReportAction(input: unknown) {
  try {
    const user = await requirePermission(Permission.MODERATION_MANAGE_REPORTS);
    const params = resolveReportSchema.parse(input);
    await adminModerationService.resolveReport({
      reportId: params.reportId,
      moderatorId: user.id,
      action: params.action,
      notes: params.notes,
    });
    revalidatePath("/admin/moderation");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

// ===================== SETTINGS + FEATURE FLAGS =====================

export async function getSettingsAction() {
  try {
    await requirePermission(Permission.ADMIN_SETTINGS);
    const settings = await adminSettingsService.getAllSettings();
    return { success: true, data: settings };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function updateSettingAction(input: unknown) {
  try {
    const user = await requirePermission(Permission.ADMIN_MANAGE_SETTINGS);
    const params = updateSettingsSchema.parse(input);
    await adminSettingsService.setSetting({
      key: params.key,
      value: params.value,
      category: params.category,
      description: params.description,
      userId: user.id,
    });
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function getFeatureFlagsAction() {
  try {
    await requirePermission(Permission.ADMIN_MANAGE_FEATURE_FLAGS);
    const flags = await adminSettingsService.getFeatureFlags();
    return { success: true, data: flags };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function createFeatureFlagAction(input: unknown) {
  try {
    const user = await requirePermission(Permission.ADMIN_MANAGE_FEATURE_FLAGS);
    const params = createFeatureFlagSchema.parse(input);
    const flag = await adminSettingsService.createFeatureFlag({
      ...params,
      userId: user.id,
    });
    revalidatePath("/admin/settings");
    return { success: true, data: flag };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function toggleFeatureFlagAction(input: unknown) {
  try {
    const user = await requirePermission(Permission.ADMIN_MANAGE_FEATURE_FLAGS);
    const params = updateFeatureFlagSchema.parse(input);
    await adminSettingsService.toggleFeatureFlag(params.flagId, params.enabled, user.id);
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

// ===================== ANALYTICS =====================

export async function getOrderAnalyticsAction(days = 30) {
  try {
    await requirePermission(Permission.ANALYTICS_VIEW);
    const data = await adminMetricsService.getOrderAnalytics(days);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function getMarketplaceAnalyticsAction() {
  try {
    await requirePermission(Permission.ANALYTICS_VIEW);
    const data = await adminMetricsService.getMarketplaceAnalytics();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function getMembershipAnalyticsAction() {
  try {
    await requirePermission(Permission.ANALYTICS_VIEW);
    const data = await adminMetricsService.getMembershipAnalytics();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function getSearchAnalyticsAction(days = 7) {
  try {
    await requirePermission(Permission.ANALYTICS_VIEW);
    const data = await adminMetricsService.getSearchAnalytics(days);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function getStaffActivityAnalyticsAction(days = 7) {
  try {
    await requirePermission(Permission.STAFF_VIEW_LOGS);
    const data = await adminMetricsService.getStaffActivity(days);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

// ===================== AUDIT LOGS =====================

export async function getAuditLogsAction(page = 1, limit = 50, action?: string) {
  try {
    await requirePermission(Permission.ADMIN_MANAGE_AUDIT);
    const { getDatabase, schema } = await import("@/db");
    const { and, desc, eq, sql } = await import("drizzle-orm");
    const db = getDatabase();
    const conditions: any[] = [];
    if (action) conditions.push(eq(schema.auditLogs.action, action));

    const logs = await db.query.auditLogs.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(schema.auditLogs.createdAt)],
      limit,
      offset: (page - 1) * limit,
    });

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.auditLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return {
      success: true,
      data: {
        logs,
        total: Number(countResult[0]?.count ?? 0),
        page,
        limit,
        totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit),
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

// ===================== ANNOUNCEMENTS =====================

export async function createAnnouncementAction(input: unknown) {
  try {
    const user = await requirePermission(Permission.ADMIN_MANAGE_ANNOUNCEMENTS);
    const params = createAnnouncementSchema.parse(input);
    const { getDatabase, schema } = await import("@/db");
    const db = getDatabase();
    const [announcement] = await db
      .insert(schema.announcements)
      .values({
        title: params.title,
        content: params.content,
        type: params.type,
        isActive: true,
        isPermanent: params.isPermanent,
        startsAt: params.startsAt ? new Date(params.startsAt) : null,
        endsAt: params.endsAt ? new Date(params.endsAt) : null,
        createdBy: user.id,
      })
      .returning();

    await auditService.log(user.id, AUDIT_ACTIONS.SYSTEM_ANNOUNCEMENT, {
      resource: "announcement",
      resourceId: announcement.id,
    });

    revalidatePath("/admin/announcements");
    return { success: true, data: announcement };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function getAnnouncementsAction() {
  try {
    await requirePermission(Permission.ADMIN_MANAGE_ANNOUNCEMENTS);
    const { getDatabase, schema } = await import("@/db");
    const { desc } = await import("drizzle-orm");
    const db = getDatabase();
    const announcements = await db.query.announcements.findMany({
      orderBy: [desc(schema.announcements.createdAt)],
    });
    return { success: true, data: announcements };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}
