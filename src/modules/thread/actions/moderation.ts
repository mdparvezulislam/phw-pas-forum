"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDatabase, schema } from "@/db";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";
import { auth } from "@/lib/auth";
import { requireAuth, requireRole } from "@/modules/auth/guards";
import { auditService } from "@/services/audit";
import { RoleName } from "@/types/rbac";

export async function pinThread(
  prevState: any,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  await requireRole(RoleName.MODERATOR);
  const id = formData.get("id") as string;
  const db = getDatabase();

  const thread = await db.query.threads.findFirst({
    where: (t, { eq }) => eq(t.id, id),
  });
  if (!thread) return { error: "Thread not found" };

  await db
    .update(schema.threads)
    .set({ isPinned: !thread.isPinned })
    .where(eq(schema.threads.id, id));

  const session = await auth();
  const action = thread.isPinned
    ? AUDIT_ACTIONS.THREAD_UNPIN
    : AUDIT_ACTIONS.THREAD_PIN;
  await auditService.log(session?.user?.id ?? null, action, {
    resource: "thread",
    resourceId: id,
  });

  revalidatePath(`/forums`);
  return { success: true };
}

export async function lockThread(
  prevState: any,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  await requireRole(RoleName.MODERATOR);
  const id = formData.get("id") as string;
  const db = getDatabase();

  const thread = await db.query.threads.findFirst({
    where: (t, { eq }) => eq(t.id, id),
  });
  if (!thread) return { error: "Thread not found" };

  await db
    .update(schema.threads)
    .set({ isLocked: !thread.isLocked })
    .where(eq(schema.threads.id, id));

  const session = await auth();
  const action = thread.isLocked
    ? AUDIT_ACTIONS.THREAD_UNLOCK
    : AUDIT_ACTIONS.THREAD_LOCK;
  await auditService.log(session?.user?.id ?? null, action, {
    resource: "thread",
    resourceId: id,
  });

  revalidatePath(`/forums`);
  return { success: true };
}

export async function featureThread(
  prevState: any,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  await requireRole(RoleName.MODERATOR);
  const id = formData.get("id") as string;
  const db = getDatabase();

  const thread = await db.query.threads.findFirst({
    where: (t, { eq }) => eq(t.id, id),
  });
  if (!thread) return { error: "Thread not found" };

  await db
    .update(schema.threads)
    .set({ isFeatured: !thread.isFeatured })
    .where(eq(schema.threads.id, id));

  const session = await auth();
  const action = thread.isFeatured
    ? AUDIT_ACTIONS.THREAD_UNFEATURE
    : AUDIT_ACTIONS.THREAD_FEATURE;
  await auditService.log(session?.user?.id ?? null, action, {
    resource: "thread",
    resourceId: id,
  });

  revalidatePath(`/forums`);
  return { success: true };
}
