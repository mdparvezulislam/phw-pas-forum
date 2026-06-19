"use server";

import { revalidatePath } from "next/cache";
import { getDatabase, schema } from "@/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/modules/auth/guards";

export async function saveDraft(
  prevState: any,
  formData: FormData,
): Promise<{ error?: string; success?: boolean; draftId?: string }> {
  const user = await requireAuth();
  const db = getDatabase();

  const draftId = formData.get("draftId") as string | null;
  const forumId = formData.get("forumId") as string | null;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (draftId) {
    const existing = await db.query.threadDrafts.findFirst({
      where: (d, { and, eq }) => and(eq(d.id, draftId), eq(d.userId, user.id)),
    });
    if (!existing) return { error: "Draft not found" };

    await db
      .update(schema.threadDrafts)
      .set({ title, content, forumId, updatedAt: new Date() })
      .where(eq(schema.threadDrafts.id, draftId));

    return { success: true, draftId };
  }

  const [draft] = await db
    .insert(schema.threadDrafts)
    .values({
      userId: user.id,
      forumId,
      title,
      content,
    })
    .returning();

  return { success: true, draftId: draft.id };
}

export async function deleteDraft(
  prevState: any,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireAuth();
  const db = getDatabase();
  const draftId = formData.get("draftId") as string;

  await db
    .delete(schema.threadDrafts)
    .where(and(eq(schema.threadDrafts.id, draftId), eq(schema.threadDrafts.userId, user.id)));

  revalidatePath(`/forums`);
  return { success: true };
}

export async function getUserDrafts() {
  const user = await requireAuth();
  const db = getDatabase();

  return db.query.threadDrafts.findMany({
    where: (d, { eq }) => eq(d.userId, user.id),
    orderBy: (d, { desc }) => desc(d.updatedAt),
  });
}
