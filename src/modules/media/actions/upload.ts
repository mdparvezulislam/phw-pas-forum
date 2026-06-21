"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { hasPermission } from "@/config/rbac";
import { FILE_LIMITS } from "@/constants";
import { getDatabase, schema } from "@/db";
import { storage } from "@/lib/r2";
import { requireAuth } from "@/modules/auth/guards";
import { auditService } from "@/services/audit";
import { rateLimiter } from "@/services/rate-limit";
import { Permission } from "@/types/rbac";

export async function getSignedUploadUrl(
  fileName: string,
  mimeType: string,
  fileSize: number,
): Promise<
  { uploadUrl: string; key: string; url: string } | { error: string }
> {
  const user = await requireAuth();

  const rateLimit = await rateLimiter.check("FORUM_POST", user.id);
  if (!rateLimit.allowed) {
    return { error: "Upload rate limit exceeded. Please wait." };
  }

  if (!FILE_LIMITS.ATTACHMENT_ALLOWED_TYPES.includes(mimeType as any)) {
    return {
      error: `File type "${mimeType}" is not allowed. Accepted types: ${FILE_LIMITS.ATTACHMENT_ALLOWED_TYPES.join(", ")}`,
    };
  }

  if (fileSize > FILE_LIMITS.ATTACHMENT_MAX_SIZE) {
    const maxMB = Math.round(FILE_LIMITS.ATTACHMENT_MAX_SIZE / (1024 * 1024));
    return {
      error: `File size exceeds the maximum limit of ${maxMB}MB.`,
    };
  }

  if (fileSize <= 0) {
    return { error: "File is empty." };
  }

  const ext = fileName.split(".").pop() || "bin";
  const uuid = crypto.randomUUID();
  const key = `attachments/${user.id}/${uuid}.${ext}`;

  const uploadUrl = await storage.getSignedUrl(key, 600);
  const url = await storage.getPublicUrl(key);

  return { uploadUrl, key, url };
}

export async function saveAttachment(data: {
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  storageKey: string;
  url: string;
  width?: number;
  height?: number;
}): Promise<{ attachment: any } | { error: string }> {
  const user = await requireAuth();

  const db = getDatabase();

  const [attachment] = await db
    .insert(schema.attachments)
    .values({
      uploaderId: user.id,
      fileName: data.fileName,
      originalName: data.originalName,
      mimeType: data.mimeType,
      fileSize: data.fileSize,
      storageKey: data.storageKey,
      url: data.url,
      width: data.width,
      height: data.height,
      status: "ACTIVE",
    })
    .returning();

  await auditService.log(user.id, "ATTACHMENT_UPLOAD", {
    resource: "attachment",
    resourceId: attachment.id,
    metadata: {
      fileName: data.originalName,
      mimeType: data.mimeType,
      fileSize: data.fileSize,
    },
  });

  revalidatePath("/");
  return { attachment };
}

export async function deleteAttachment(
  attachmentId: string,
): Promise<{ success: boolean } | { error: string }> {
  const user = await requireAuth();

  const db = getDatabase();

  const attachment = await db.query.attachments.findFirst({
    where: (a, { eq }) => eq(a.id, attachmentId),
  });

  if (!attachment) {
    return { error: "Attachment not found" };
  }

  const isOwner = attachment.uploaderId === user.id;
  const isModerator = hasPermission(user, Permission.MEDIA_DELETE);

  if (!isOwner && !isModerator) {
    return { error: "Not authorized to delete this attachment" };
  }

  try {
    await storage.delete(attachment.storageKey);
  } catch {
    // File may already be deleted from storage
  }

  await db
    .update(schema.attachments)
    .set({ status: "DELETED" })
    .where(eq(schema.attachments.id, attachmentId));

  await db
    .delete(schema.threadAttachments)
    .where(eq(schema.threadAttachments.attachmentId, attachmentId));

  await db
    .delete(schema.postAttachments)
    .where(eq(schema.postAttachments.attachmentId, attachmentId));

  await auditService.log(user.id, "ATTACHMENT_DELETE", {
    resource: "attachment",
    resourceId: attachmentId,
    metadata: {
      fileName: attachment.originalName,
      storageKey: attachment.storageKey,
      ownerDeleted: isOwner,
    },
  });

  revalidatePath("/");
  return { success: true };
}

export async function getUserAttachments(
  userId: string,
  page: number = 1,
  perPage: number = 20,
): Promise<{
  attachments: any[];
  total: number;
  page: number;
  perPage: number;
}> {
  const db = getDatabase();

  const whereCondition = and(
    eq(schema.attachments.uploaderId, userId),
    eq(schema.attachments.status, "ACTIVE"),
  );

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.attachments)
    .where(whereCondition);

  const total = countResult?.count ?? 0;
  const offset = (page - 1) * perPage;

  const attachments = await db.query.attachments.findMany({
    where: whereCondition,
    orderBy: [desc(schema.attachments.createdAt)],
    limit: perPage,
    offset,
  });

  return { attachments, total, page, perPage };
}

export async function getPostAttachments(
  postId: string,
): Promise<{ attachments: any[] }> {
  const db = getDatabase();

  const results = await db
    .select({
      id: schema.attachments.id,
      uploaderId: schema.attachments.uploaderId,
      fileName: schema.attachments.fileName,
      originalName: schema.attachments.originalName,
      mimeType: schema.attachments.mimeType,
      fileSize: schema.attachments.fileSize,
      storageKey: schema.attachments.storageKey,
      url: schema.attachments.url,
      width: schema.attachments.width,
      height: schema.attachments.height,
      status: schema.attachments.status,
      createdAt: schema.attachments.createdAt,
    })
    .from(schema.postAttachments)
    .innerJoin(
      schema.attachments,
      eq(schema.postAttachments.attachmentId, schema.attachments.id),
    )
    .where(
      and(
        eq(schema.postAttachments.postId, postId),
        eq(schema.attachments.status, "ACTIVE"),
      ),
    )
    .orderBy(desc(schema.attachments.createdAt));

  return { attachments: results };
}

export async function getThreadAttachments(
  threadId: string,
): Promise<{ attachments: any[] }> {
  const db = getDatabase();

  const results = await db
    .select({
      id: schema.attachments.id,
      uploaderId: schema.attachments.uploaderId,
      fileName: schema.attachments.fileName,
      originalName: schema.attachments.originalName,
      mimeType: schema.attachments.mimeType,
      fileSize: schema.attachments.fileSize,
      storageKey: schema.attachments.storageKey,
      url: schema.attachments.url,
      width: schema.attachments.width,
      height: schema.attachments.height,
      status: schema.attachments.status,
      createdAt: schema.attachments.createdAt,
    })
    .from(schema.threadAttachments)
    .innerJoin(
      schema.attachments,
      eq(schema.threadAttachments.attachmentId, schema.attachments.id),
    )
    .where(
      and(
        eq(schema.threadAttachments.threadId, threadId),
        eq(schema.attachments.status, "ACTIVE"),
      ),
    )
    .orderBy(desc(schema.attachments.createdAt));

  return { attachments: results };
}

export async function getAttachmentDownloadUrl(
  attachmentId: string,
): Promise<{ url: string } | { error: string }> {
  const user = await requireAuth();

  const db = getDatabase();

  const attachment = await db.query.attachments.findFirst({
    where: (a, { eq }) => eq(a.id, attachmentId),
  });

  if (!attachment) {
    return { error: "Attachment not found" };
  }

  const url = await storage.getSignedUrl(attachment.storageKey, 3600);

  return { url };
}

export async function bulkDeleteAttachments(
  attachmentIds: string[],
): Promise<{ success: boolean; deleted: number } | { error: string }> {
  const user = await requireAuth();

  if (!hasPermission(user, Permission.MEDIA_MANAGE)) {
    return { error: "Not authorized" };
  }

  const db = getDatabase();
  let deleted = 0;

  for (const id of attachmentIds) {
    const attachment = await db.query.attachments.findFirst({
      where: (a, { eq }) => eq(a.id, id),
    });

    if (!attachment) continue;

    try {
      await storage.delete(attachment.storageKey);
    } catch {
      // Continue even if storage delete fails
    }

    await db
      .update(schema.attachments)
      .set({ status: "DELETED" })
      .where(eq(schema.attachments.id, id));

    deleted++;
  }

  await auditService.log(user.id, "ATTACHMENT_BULK_DELETE", {
    resource: "attachment",
    metadata: { count: deleted, ids: attachmentIds },
  });

  revalidatePath("/");
  return { success: true, deleted };
}
