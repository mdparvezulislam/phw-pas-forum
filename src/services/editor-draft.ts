import "server-only";

import { and, eq, lt, isNull } from "drizzle-orm";
import { getDatabase, schema } from "@/db";
import type { EditorDraft, NewEditorDraft } from "@/db/schema/editor-drafts";

export async function saveDraft(data: NewEditorDraft): Promise<EditorDraft> {
  const db = getDatabase();

  const existing = await db.query.editorDrafts.findFirst({
    where: (d, { and, eq, isNull }) =>
      and(
        eq(d.userId, data.userId),
        data.threadId ? eq(d.threadId, data.threadId) : isNull(d.threadId),
        data.postId ? eq(d.postId, data.postId) : isNull(d.postId),
      ),
  });

  if (existing) {
    const [updated] = await db
      .update(schema.editorDrafts)
      .set({
        content: data.content,
        contentJson: data.contentJson,
        title: data.title,
        attachments: data.attachments,
        updatedAt: new Date(),
      })
      .where(eq(schema.editorDrafts.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(schema.editorDrafts)
    .values(data)
    .returning();
  return created;
}

export async function getDraft(
  userId: string,
  threadId?: string,
  postId?: string,
): Promise<EditorDraft | null> {
  const db = getDatabase();
  const result = await db.query.editorDrafts.findFirst({
    where: (d, { and, eq, isNull }) =>
      and(
        eq(d.userId, userId),
        threadId ? eq(d.threadId, threadId) : isNull(d.threadId),
        postId ? eq(d.postId, postId) : isNull(d.postId),
      ),
  });
  return result ?? null;
}

export async function deleteDraft(
  userId: string,
  threadId?: string,
  postId?: string,
): Promise<void> {
  const db = getDatabase();
  await db
    .delete(schema.editorDrafts)
    .where(
      and(
        eq(schema.editorDrafts.userId, userId),
        threadId
          ? eq(schema.editorDrafts.threadId, threadId)
          : isNull(schema.editorDrafts.threadId),
        postId
          ? eq(schema.editorDrafts.postId, postId)
          : isNull(schema.editorDrafts.postId),
      ),
    );
}

export async function getUserDrafts(
  userId: string,
): Promise<EditorDraft[]> {
  const db = getDatabase();
  return db.query.editorDrafts.findMany({
    where: (d, { eq }) => eq(d.userId, userId),
    orderBy: (d, { desc }) => desc(d.updatedAt),
  });
}

export async function cleanupOldDrafts(
  olderThanDays = 30,
): Promise<number> {
  const db = getDatabase();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);

  const result = await db
    .delete(schema.editorDrafts)
    .where(lt(schema.editorDrafts.updatedAt, cutoff))
    .returning();
  return result.length;
}
