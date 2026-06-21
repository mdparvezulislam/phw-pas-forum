"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { hasPermission } from "@/config/rbac";
import { getDatabase, schema } from "@/db";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";
import { requireAuth } from "@/modules/auth/guards";
import { AIModerationEngine } from "@/modules/ai/moderation/moderation";
import { auditService } from "@/services/audit";
import { getNextPostNumber, getPostById } from "@/services/post";
import { rateLimiter } from "@/services/rate-limit";
import { Permission } from "@/types/rbac";
import {
  type CreatePostInput,
  createPostSchema,
  reportPostSchema,
  updatePostSchema,
} from "@/validations/post";

export async function createPost(
  _prevState:
    | { error?: string; success?: boolean; postId?: string }
    | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean; postId?: string }> {
  const user = await requireAuth();

  const raw: CreatePostInput = {
    threadId: formData.get("threadId") as string,
    content: formData.get("content") as string,
    contentJson: (formData.get("contentJson") as string) || null,
  };

  const parsed = createPostSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: parsed.error.flatten().fieldErrors.content?.[0] ?? "Invalid input",
    };
  }

  const rateLimit = await rateLimiter.check("FORUM_POST", user.id);
  if (!rateLimit.allowed) {
    return { error: "You are posting too quickly. Please wait a moment." };
  }

  const db = getDatabase();

  const thread = await db.query.threads.findFirst({
    where: (t, { eq }) => eq(t.id, parsed.data.threadId),
  });
  if (!thread) return { error: "Thread not found" };
  if (thread.isLocked) return { error: "This thread is locked" };

  const postNumber = await getNextPostNumber(parsed.data.threadId);

  const [post] = await db
    .insert(schema.posts)
    .values({
      threadId: parsed.data.threadId,
      authorId: user.id,
      content: parsed.data.content,
      contentJson: parsed.data.contentJson ?? undefined,
      postNumber,
      status: "PUBLISHED",
    })
    .returning();

  // AI safety checks scan
  const modScan = await AIModerationEngine.scanContent({
    targetId: post.id,
    targetType: "POST",
    title: `Post #${postNumber} in thread ${parsed.data.threadId}`,
    body: parsed.data.content,
    userId: user.id,
  });

  if (modScan.decision === "BLOCKED") {
    await db
      .update(schema.posts)
      .set({ status: "DELETED" })
      .where(eq(schema.posts.id, post.id));
    return {
      error: `Content blocked by safety policy: ${modScan.explanation}`,
    };
  }

  await db
    .update(schema.threads)
    .set({
      replyCount: sql`${schema.threads.replyCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(schema.threads.id, parsed.data.threadId));

  await db
    .update(schema.forums)
    .set({
      postCount: sql`${schema.forums.postCount} + 1`,
      lastActivityAt: new Date(),
    })
    .where(eq(schema.forums.id, thread.forumId));

  await auditService.log(user.id, AUDIT_ACTIONS.POST_CREATE, {
    resource: "post",
    resourceId: post.id,
    metadata: { threadId: parsed.data.threadId, postNumber },
  });

  revalidatePath(`/forums`);
  return { success: true, postId: post.id };
}

export async function updatePost(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireAuth();

  const raw = {
    id: formData.get("id") as string,
    content: formData.get("content") as string,
    contentJson: (formData.get("contentJson") as string) || null,
    reason: formData.get("reason") as string | null,
  };

  const parsed = updatePostSchema.safeParse({
    ...raw,
    reason: raw.reason || undefined,
  });
  if (!parsed.success) {
    return {
      error: parsed.error.flatten().fieldErrors.content?.[0] ?? "Invalid input",
    };
  }

  const db = getDatabase();
  const post = await getPostById(parsed.data.id);
  if (!post) return { error: "Post not found" };

  const isOwner = post.authorId === user.id;
  const isModerator = hasPermission(user, Permission.POST_MODERATE);

  if (!isOwner && !isModerator) {
    return { error: "Not authorized" };
  }

  await db.insert(schema.postEditHistory).values({
    postId: post.id,
    previousContent: post.content,
    editedBy: user.id,
    reason: parsed.data.reason,
  });

  await db
    .update(schema.posts)
    .set({
      content: parsed.data.content,
      contentJson: parsed.data.contentJson ?? undefined,
      isEdited: true,
      editedAt: new Date(),
    })
    .where(eq(schema.posts.id, parsed.data.id));

  await auditService.log(user.id, AUDIT_ACTIONS.POST_UPDATE, {
    resource: "post",
    resourceId: post.id,
    metadata: { threadId: post.threadId, reason: parsed.data.reason },
  });

  revalidatePath(`/forums`);
  return { success: true };
}

export async function deletePost(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireAuth();
  const postId = formData.get("postId") as string;
  const reason = formData.get("reason") as string | null;

  const db = getDatabase();
  const post = await getPostById(postId);
  if (!post) return { error: "Post not found" };

  const isOwner = post.authorId === user.id;
  const isModerator = hasPermission(user, Permission.POST_MODERATE);

  if (!isOwner && !isModerator) {
    return { error: "Not authorized" };
  }

  await db
    .update(schema.posts)
    .set({ status: "DELETED" })
    .where(eq(schema.posts.id, postId));

  await db
    .update(schema.threads)
    .set({
      replyCount: sql`GREATEST(${schema.threads.replyCount} - 1, 0)`,
    })
    .where(eq(schema.threads.id, post.threadId));

  const thread = await db.query.threads.findFirst({
    where: (t, { eq }) => eq(t.id, post.threadId),
  });
  if (thread) {
    await db
      .update(schema.forums)
      .set({
        postCount: sql`GREATEST(${schema.forums.postCount} - 1, 0)`,
      })
      .where(eq(schema.forums.id, thread.forumId));
  }

  await auditService.log(user.id, AUDIT_ACTIONS.POST_DELETE, {
    resource: "post",
    resourceId: postId,
    metadata: { threadId: post.threadId, reason },
  });

  revalidatePath(`/forums`);
  return { success: true };
}

export async function hidePost(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireAuth();
  const postId = formData.get("postId") as string;

  if (!hasPermission(user, Permission.POST_MODERATE)) {
    return { error: "Not authorized" };
  }

  const db = getDatabase();
  const post = await getPostById(postId);
  if (!post) return { error: "Post not found" };

  await db
    .update(schema.posts)
    .set({ status: "HIDDEN" })
    .where(eq(schema.posts.id, postId));

  await auditService.log(user.id, AUDIT_ACTIONS.POST_HIDE, {
    resource: "post",
    resourceId: postId,
  });

  revalidatePath(`/forums`);
  return { success: true };
}

export async function unhidePost(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireAuth();
  const postId = formData.get("postId") as string;

  if (!hasPermission(user, Permission.POST_MODERATE)) {
    return { error: "Not authorized" };
  }

  const db = getDatabase();
  await db
    .update(schema.posts)
    .set({ status: "PUBLISHED" })
    .where(eq(schema.posts.id, postId));

  await auditService.log(user.id, AUDIT_ACTIONS.POST_UNHIDE, {
    resource: "post",
    resourceId: postId,
  });

  revalidatePath(`/forums`);
  return { success: true };
}

export async function restorePost(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireAuth();
  const postId = formData.get("postId") as string;

  if (!hasPermission(user, Permission.POST_MODERATE)) {
    return { error: "Not authorized" };
  }

  const db = getDatabase();
  const post = await db.query.posts.findFirst({
    where: (p, { eq }) => eq(p.id, postId),
  });
  if (!post || post.status !== "DELETED")
    return { error: "Post not found or not deleted" };

  await db
    .update(schema.posts)
    .set({ status: "PUBLISHED" })
    .where(eq(schema.posts.id, postId));

  await db
    .update(schema.threads)
    .set({
      replyCount: sql`${schema.threads.replyCount} + 1`,
    })
    .where(eq(schema.threads.id, post.threadId));

  const thread = await db.query.threads.findFirst({
    where: (t, { eq }) => eq(t.id, post.threadId),
  });
  if (thread) {
    await db
      .update(schema.forums)
      .set({
        postCount: sql`${schema.forums.postCount} + 1`,
      })
      .where(eq(schema.forums.id, thread.forumId));
  }

  await auditService.log(user.id, AUDIT_ACTIONS.POST_RESTORE, {
    resource: "post",
    resourceId: postId,
  });

  revalidatePath(`/forums`);
  return { success: true };
}

export async function reportPost(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireAuth();

  const raw = {
    postId: formData.get("postId") as string,
    reason: formData.get("reason") as
      | "SPAM"
      | "ABUSE"
      | "SCAM"
      | "DUPLICATE"
      | "OTHER",
    description: formData.get("description") as string | null,
  };

  const parsed = reportPostSchema.safeParse({
    ...raw,
    description: raw.description || undefined,
  });
  if (!parsed.success) {
    return { error: "Invalid report data" };
  }

  const db = getDatabase();

  const existing = await db.query.postReports.findFirst({
    where: (r, { and, eq }) =>
      and(
        eq(r.postId, parsed.data.postId),
        eq(r.reporterId, user.id),
        eq(r.status, "OPEN"),
      ),
  });
  if (existing) {
    return { error: "You have already reported this post" };
  }

  await db.insert(schema.postReports).values({
    postId: parsed.data.postId,
    reporterId: user.id,
    reason: parsed.data.reason,
    description: parsed.data.description,
  });

  await auditService.log(user.id, AUDIT_ACTIONS.POST_REPORT_CREATE, {
    resource: "post_report",
    resourceId: parsed.data.postId,
    metadata: { reason: parsed.data.reason },
  });

  revalidatePath(`/forums`);
  return { success: true };
}

export async function resolveReport(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireAuth();
  const reportId = formData.get("reportId") as string;
  const action = formData.get("action") as "RESOLVED" | "REJECTED";

  if (!hasPermission(user, Permission.POST_MODERATE)) {
    return { error: "Not authorized" };
  }

  const db = getDatabase();
  const report = await db.query.postReports.findFirst({
    where: (r, { eq }) => eq(r.id, reportId),
  });
  if (!report) return { error: "Report not found" };

  await db
    .update(schema.postReports)
    .set({
      status: action,
      resolvedBy: user.id,
      resolvedAt: new Date(),
    })
    .where(eq(schema.postReports.id, reportId));

  const auditAction =
    action === "RESOLVED"
      ? AUDIT_ACTIONS.POST_REPORT_RESOLVE
      : AUDIT_ACTIONS.POST_REPORT_REJECT;
  await auditService.log(user.id, auditAction, {
    resource: "post_report",
    resourceId: reportId,
  });

  revalidatePath(`/mod/reports`);
  return { success: true };
}
