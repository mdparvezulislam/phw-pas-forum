"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDatabase, schema } from "@/db";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";
import { requireAuth, requireRole } from "@/modules/auth/guards";
import { auditService } from "@/services/audit";
import { RoleName } from "@/types/rbac";
import {
  adminTrophyAssignSchema,
  createTrophySchema,
  updateTrophySchema,
} from "@/validations/reputation";

export async function createTrophy(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireAuth();
  await requireRole(RoleName.ADMIN);

  const parsed = createTrophySchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    icon: formData.get("icon"),
    reputationReward: Number(formData.get("reputationReward")) || 0,
    conditionType: formData.get("conditionType"),
    conditionValue: Number(formData.get("conditionValue")),
  });

  if (!parsed.success) return { error: "Invalid trophy data" };

  const db = getDatabase();

  await db.insert(schema.trophies).values(parsed.data);

  await auditService.log(user.id, AUDIT_ACTIONS.ADMIN_TROPHY_ASSIGN, {
    resource: "trophy",
    metadata: { title: parsed.data.title },
  });

  revalidatePath("/admin/trophies");
  return { success: true };
}

export async function updateTrophy(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireAuth();
  await requireRole(RoleName.ADMIN);

  const parsed = updateTrophySchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title") || undefined,
    description: formData.get("description") || undefined,
    icon: formData.get("icon") || undefined,
    reputationReward: formData.get("reputationReward")
      ? Number(formData.get("reputationReward"))
      : undefined,
    conditionType: formData.get("conditionType") || undefined,
    conditionValue: formData.get("conditionValue")
      ? Number(formData.get("conditionValue"))
      : undefined,
  });

  if (!parsed.success) return { error: "Invalid trophy data" };

  const db = getDatabase();
  const { id, ...data } = parsed.data;

  await db.update(schema.trophies).set(data).where(eq(schema.trophies.id, id));

  revalidatePath("/admin/trophies");
  return { success: true };
}

export async function assignTrophy(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireAuth();
  await requireRole(RoleName.ADMIN);

  const parsed = adminTrophyAssignSchema.safeParse({
    userId: formData.get("userId"),
    trophyId: formData.get("trophyId"),
  });

  if (!parsed.success) return { error: "Invalid data" };

  const db = getDatabase();

  const existing = await db.query.userTrophies.findFirst({
    where: (ut, { and: andFn, eq: eqFn }) =>
      andFn(
        eqFn(ut.userId, parsed.data.userId),
        eqFn(ut.trophyId, parsed.data.trophyId),
      ),
  });
  if (existing) return { error: "User already has this trophy" };

  await db.insert(schema.userTrophies).values(parsed.data);

  await db
    .update(schema.userReputation)
    .set({
      trophiesEarned: sql`${schema.userReputation.trophiesEarned} + 1`,
    })
    .where(eq(schema.userReputation.userId, parsed.data.userId));

  await auditService.log(user.id, AUDIT_ACTIONS.TROPHY_UNLOCKED, {
    resource: "trophy",
    resourceId: parsed.data.trophyId,
    metadata: { targetUserId: parsed.data.userId },
  });

  revalidatePath("/admin/trophies");
  return { success: true };
}

export async function revokeTrophy(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireAuth();
  await requireRole(RoleName.MODERATOR);

  const userTrophyId = formData.get("userTrophyId") as string;
  if (!userTrophyId) return { error: "Invalid data" };

  const db = getDatabase();

  const userTrophy = await db.query.userTrophies.findFirst({
    where: (ut, { eq }) => eq(ut.id, userTrophyId),
  });
  if (!userTrophy) return { error: "Trophy not found" };

  await db
    .delete(schema.userTrophies)
    .where(eq(schema.userTrophies.id, userTrophyId));

  await db
    .update(schema.userReputation)
    .set({
      trophiesEarned: sql`GREATEST(${schema.userReputation.trophiesEarned} - 1, 0)`,
    })
    .where(eq(schema.userReputation.userId, userTrophy.userId));

  await auditService.log(user.id, AUDIT_ACTIONS.TROPHY_REVOKED, {
    resource: "trophy",
    resourceId: userTrophy.trophyId,
    metadata: { targetUserId: userTrophy.userId },
  });

  revalidatePath("/admin/trophies");
  return { success: true };
}
