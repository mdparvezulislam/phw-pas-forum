"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDatabase, schema } from "@/db";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";
import { requireAuth } from "@/modules/auth/guards";
import { auditService } from "@/services/audit";
import { requireRole } from "@/modules/auth/guards";
import { RoleName } from "@/types/rbac";
import {
  createBadgeSchema,
  updateBadgeSchema,
  adminBadgeAssignSchema,
} from "@/validations/reputation";

export async function createBadge(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireAuth();
  await requireRole(RoleName.ADMIN);

  const parsed = createBadgeSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    icon: formData.get("icon"),
    description: formData.get("description") || undefined,
    color: formData.get("color") || "slate",
    category: formData.get("category") || "ACHIEVEMENT",
    isSystem: formData.get("isSystem") === "true",
  });

  if (!parsed.success) {
    return { error: "Invalid badge data" };
  }

  const db = getDatabase();

  const existing = await db.query.badges.findFirst({
    where: (b, { eq }) => eq(b.slug, parsed.data.slug),
  });
  if (existing) return { error: "Badge with this slug already exists" };

  await db.insert(schema.badges).values(parsed.data);

  await auditService.log(user.id, AUDIT_ACTIONS.ADMIN_BADGE_ASSIGN, {
    resource: "badge",
    metadata: { name: parsed.data.name, slug: parsed.data.slug },
  });

  revalidatePath("/admin/badges");
  return { success: true };
}

export async function updateBadge(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireAuth();
  await requireRole(RoleName.ADMIN);

  const parsed = updateBadgeSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name") || undefined,
    slug: formData.get("slug") || undefined,
    icon: formData.get("icon") || undefined,
    description: formData.get("description") || undefined,
    color: formData.get("color") || undefined,
    category: formData.get("category") || undefined,
    isSystem: formData.get("isSystem") === "true" || undefined,
  });

  if (!parsed.success) {
    return { error: "Invalid badge data" };
  }

  const db = getDatabase();
  const { id, ...data } = parsed.data;

  await db.update(schema.badges).set(data).where(eq(schema.badges.id, id));

  revalidatePath("/admin/badges");
  return { success: true };
}

export async function assignBadge(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireAuth();
  await requireRole(RoleName.ADMIN);

  const parsed = adminBadgeAssignSchema.safeParse({
    userId: formData.get("userId"),
    badgeId: formData.get("badgeId"),
  });

  if (!parsed.success) return { error: "Invalid data" };

  const db = getDatabase();

  const existing = await db.query.userBadges.findFirst({
    where: (ub, { and: andFn, eq: eqFn }) =>
      andFn(eqFn(ub.userId, parsed.data.userId), eqFn(ub.badgeId, parsed.data.badgeId)),
  });
  if (existing) return { error: "User already has this badge" };

  await db.insert(schema.userBadges).values(parsed.data);

  await db
    .update(schema.userReputation)
    .set({
      badgesEarned: sql`${schema.userReputation.badgesEarned} + 1`,
    })
    .where(eq(schema.userReputation.userId, parsed.data.userId));

  await auditService.log(user.id, AUDIT_ACTIONS.BADGE_EARNED, {
    resource: "badge",
    resourceId: parsed.data.badgeId,
    metadata: { targetUserId: parsed.data.userId },
  });

  revalidatePath("/admin/badges");
  return { success: true };
}

export async function revokeBadge(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireAuth();
  const admin = await requireRole(RoleName.ADMIN).catch(() => null);
  const mod = requireRole(RoleName.MODERATOR).catch(() => null);
  if (!admin && !mod) return { error: "Not authorized" };

  const userBadgeId = formData.get("userBadgeId") as string;
  if (!userBadgeId) return { error: "Invalid data" };

  const db = getDatabase();

  const userBadge = await db.query.userBadges.findFirst({
    where: (ub, { eq }) => eq(ub.id, userBadgeId),
  });
  if (!userBadge) return { error: "Badge not found" };

  await db.delete(schema.userBadges).where(eq(schema.userBadges.id, userBadgeId));

  await db
    .update(schema.userReputation)
    .set({
      badgesEarned: sql`GREATEST(${schema.userReputation.badgesEarned} - 1, 0)`,
    })
    .where(eq(schema.userReputation.userId, userBadge.userId));

  await auditService.log(user.id, AUDIT_ACTIONS.BADGE_REVOKED, {
    resource: "badge",
    resourceId: userBadge.badgeId,
    metadata: { targetUserId: userBadge.userId },
  });

  revalidatePath("/admin/badges");
  return { success: true };
}
