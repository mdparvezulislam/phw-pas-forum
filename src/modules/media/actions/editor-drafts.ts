"use server";

import { and, eq, desc } from "drizzle-orm";
import { getDatabase, schema } from "@/db";
import { requireAuth } from "@/modules/auth/guards";

interface ActionResponse<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

export async function saveEditorDraftAction(input: {
  content: string;
  title?: string;
  threadId?: string;
  postId?: string;
}): Promise<ActionResponse> {
  const user = await requireAuth();
  const db = getDatabase();

  const existing = await db.query.editorDrafts.findFirst({
    where: and(
      eq(schema.editorDrafts.userId, user.id),
      input.threadId ? eq(schema.editorDrafts.threadId, input.threadId) : undefined,
      input.postId ? eq(schema.editorDrafts.postId, input.postId) : undefined,
    ),
  });

  if (existing) {
    await db
      .update(schema.editorDrafts)
      .set({
        content: input.content,
        title: input.title || existing.title,
        contentJson: input.content,
        updatedAt: new Date(),
      })
      .where(eq(schema.editorDrafts.id, existing.id));
  } else {
    await db.insert(schema.editorDrafts).values({
      userId: user.id,
      threadId: input.threadId || null,
      postId: input.postId || null,
      content: input.content,
      contentJson: input.content,
      title: input.title || null,
    });
  }

  return { success: true };
}

export async function getEditorDraftAction(input: {
  threadId?: string;
  postId?: string;
}): Promise<ActionResponse<{ content: string; title: string | null; updatedAt: string }>> {
  const user = await requireAuth();
  const db = getDatabase();

  const draft = await db.query.editorDrafts.findFirst({
    where: and(
      eq(schema.editorDrafts.userId, user.id),
      input.threadId ? eq(schema.editorDrafts.threadId, input.threadId) : undefined,
      input.postId ? eq(schema.editorDrafts.postId, input.postId) : undefined,
    ),
    orderBy: desc(schema.editorDrafts.updatedAt),
  });

  if (!draft) {
    return { success: false, error: "No draft found" };
  }

  return {
    success: true,
    data: {
      content: draft.content ?? "",
      title: draft.title,
      updatedAt: draft.updatedAt.toISOString(),
    },
  };
}

export async function deleteEditorDraftAction(input: {
  threadId?: string;
  postId?: string;
}): Promise<ActionResponse> {
  const user = await requireAuth();
  const db = getDatabase();

  await db
    .delete(schema.editorDrafts)
    .where(
      and(
        eq(schema.editorDrafts.userId, user.id),
        input.threadId ? eq(schema.editorDrafts.threadId, input.threadId) : undefined,
        input.postId ? eq(schema.editorDrafts.postId, input.postId) : undefined,
      ),
    );

  return { success: true };
}
