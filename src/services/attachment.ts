import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { getDatabase, schema } from "@/db";
import type { Attachment, NewAttachment } from "@/db/schema/attachments";
import type { PaginatedResult } from "@/modules/thread/types";

export async function createAttachment(
  data: NewAttachment,
): Promise<Attachment> {
  const db = getDatabase();
  const [attachment] = await db
    .insert(schema.attachments)
    .values(data)
    .returning();
  return attachment;
}

export async function getAttachmentById(
  id: string,
): Promise<Attachment | null> {
  const db = getDatabase();
  return (
    (await db.query.attachments.findFirst({
      where: (a, { eq }) => eq(a.id, id),
    })) ?? null
  );
}

export async function getAttachmentsByUser(
  userId: string,
  page: number,
  perPage: number,
): Promise<PaginatedResult<Attachment>> {
  const db = getDatabase();

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.attachments)
    .where(
      and(
        eq(schema.attachments.uploaderId, userId),
        eq(schema.attachments.status, "ACTIVE"),
      ),
    )
    .then((r) => Number(r[0].count));

  const items = await db.query.attachments.findMany({
    where: (a, { and, eq }) =>
      and(eq(a.uploaderId, userId), eq(a.status, "ACTIVE")),
    orderBy: (a, { desc }) => desc(a.createdAt),
    limit: perPage,
    offset: (page - 1) * perPage,
  });

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getAttachmentsByPost(
  postId: string,
): Promise<Attachment[]> {
  const db = getDatabase();
  const relations = await db.query.postAttachments.findMany({
    where: (pa, { eq }) => eq(pa.postId, postId),
  });

  if (relations.length === 0) return [];

  const ids = relations.map((r) => r.attachmentId);
  return db.query.attachments.findMany({
    where: (a, { inArray }) => inArray(a.id, ids),
  });
}

export async function getAttachmentsByThread(
  threadId: string,
): Promise<Attachment[]> {
  const db = getDatabase();
  const relations = await db.query.threadAttachments.findMany({
    where: (ta, { eq }) => eq(ta.threadId, threadId),
  });

  if (relations.length === 0) return [];

  const ids = relations.map((r) => r.attachmentId);
  return db.query.attachments.findMany({
    where: (a, { inArray }) => inArray(a.id, ids),
  });
}

export async function deleteAttachment(id: string): Promise<void> {
  const db = getDatabase();
  await db
    .update(schema.attachments)
    .set({ status: "DELETED" })
    .where(eq(schema.attachments.id, id));
}

export async function hardDeleteAttachment(id: string): Promise<void> {
  const db = getDatabase();
  await db.delete(schema.attachments).where(eq(schema.attachments.id, id));
}

export async function linkAttachmentToPost(
  attachmentId: string,
  postId: string,
): Promise<void> {
  const db = getDatabase();
  await db.insert(schema.postAttachments).values({ postId, attachmentId });
}

export async function linkAttachmentToThread(
  attachmentId: string,
  threadId: string,
): Promise<void> {
  const db = getDatabase();
  await db.insert(schema.threadAttachments).values({ threadId, attachmentId });
}

export async function unlinkAttachmentFromPost(
  attachmentId: string,
  postId: string,
): Promise<void> {
  const db = getDatabase();
  await db
    .delete(schema.postAttachments)
    .where(
      and(
        eq(schema.postAttachments.attachmentId, attachmentId),
        eq(schema.postAttachments.postId, postId),
      ),
    );
}

export async function unlinkAttachmentFromThread(
  attachmentId: string,
  threadId: string,
): Promise<void> {
  const db = getDatabase();
  await db
    .delete(schema.threadAttachments)
    .where(
      and(
        eq(schema.threadAttachments.attachmentId, attachmentId),
        eq(schema.threadAttachments.threadId, threadId),
      ),
    );
}
