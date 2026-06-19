"use server";

import { revalidatePath } from "next/cache";
import { getDatabase, schema } from "@/db";
import { eq, and, desc, asc, sql, ne } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { auditService } from "@/services/audit";
import { requireAuth } from "@/modules/auth/guards";
import { Permission } from "@/types/rbac";
import { hasPermission } from "@/config/rbac";
import { slugify } from "@/lib/utils";
import {
  createThreadSchema,
  updateThreadSchema,
  type CreateThreadInput,
} from "@/validations/thread";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";
import type { PaginatedResult, ThreadWithRelations, ThreadListOptions } from "@/modules/thread/types";

function generateUniqueSlug(title: string, existingSlugs: string[]): string {
  let slug = slugify(title);
  if (!existingSlugs.includes(slug)) return slug;

  let counter = 2;
  while (existingSlugs.includes(`${slug}-${counter}`)) {
    counter++;
  }
  return `${slug}-${counter}`;
}

export async function createThread(
  prevState: { error?: string; success?: boolean; threadId?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean; threadId?: string }> {
  const user = await requireAuth();

  const raw: CreateThreadInput = {
    forumId: formData.get("forumId") as string,
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    tags: (formData.get("tags") as string)
      ?.split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    status: (formData.get("status") as "DRAFT" | "PUBLISHED") ?? "PUBLISHED",
  };

  const parsed = createThreadSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.title?.[0] ?? "Invalid input" };
  }

  const db = getDatabase();

  const forum = await db.query.forums.findFirst({
    where: (forums, { eq }) => eq(forums.id, parsed.data.forumId),
  });
  if (!forum) return { error: "Forum not found" };
  if (forum.isLocked) return { error: "This forum is locked" };

  const existingSlugs = await db
    .select({ slug: schema.threads.slug })
    .from(schema.threads)
    .where(eq(schema.threads.forumId, parsed.data.forumId))
    .then((r) => r.map((x) => x.slug));

  const slug = generateUniqueSlug(parsed.data.title, existingSlugs);
  const excerpt = parsed.data.content.replace(/<[^>]*>/g, "").slice(0, 300);

  const [thread] = await db
    .insert(schema.threads)
    .values({
      forumId: parsed.data.forumId,
      authorId: user.id,
      title: parsed.data.title,
      slug,
      content: parsed.data.content,
      excerpt,
      status: parsed.data.status,
      publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
    })
    .returning();

  if (parsed.data.tags && parsed.data.tags.length > 0) {
    await db.insert(schema.threadTags).values(
      parsed.data.tags.map((tag) => ({
        threadId: thread.id,
        tag: tag.toLowerCase(),
      })),
    );
  }

  if (parsed.data.status === "PUBLISHED") {
    await db
      .update(schema.forums)
      .set({
        threadCount: sql`${schema.forums.threadCount} + 1`,
        lastActivityAt: new Date(),
      })
      .where(eq(schema.forums.id, parsed.data.forumId));
  }

  await auditService.log(user.id, AUDIT_ACTIONS.THREAD_CREATE, {
    resource: "thread",
    resourceId: thread.id,
    metadata: { title: parsed.data.title, status: parsed.data.status },
  });

  revalidatePath(`/forums`);
  return { success: true, threadId: thread.id };
}

export async function updateThread(
  prevState: any,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireAuth();
  const db = getDatabase();

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const tagsStr = formData.get("tags") as string;

  const thread = await db.query.threads.findFirst({
    where: (threads, { eq }) => eq(threads.id, id),
  });
  if (!thread) return { error: "Thread not found" };
  if (thread.authorId !== user.id && !hasPermission(user, Permission.MODERATE_THREAD)) {
    return { error: "Not authorized" };
  }

  const parsed = updateThreadSchema.safeParse({
    id,
    title: title || undefined,
    content: content || undefined,
    tags: tagsStr?.split(",").map((t) => t.trim()).filter(Boolean),
  });
  if (!parsed.success) return { error: "Invalid input" };

  await db
    .update(schema.threads)
    .set({
      title: parsed.data.title,
      content: parsed.data.content,
      excerpt: parsed.data.content
        ? parsed.data.content.replace(/<[^>]*>/g, "").slice(0, 300)
        : undefined,
    })
    .where(eq(schema.threads.id, id));

  if (parsed.data.tags) {
    await db.delete(schema.threadTags).where(eq(schema.threadTags.threadId, id));
    await db.insert(schema.threadTags).values(
      parsed.data.tags.map((tag) => ({
        threadId: id,
        tag: tag.toLowerCase(),
      })),
    );
  }

  await auditService.log(user.id, AUDIT_ACTIONS.THREAD_UPDATE, {
    resource: "thread",
    resourceId: id,
  });

  revalidatePath(`/forums`);
  return { success: true };
}

export async function deleteThread(
  prevState: any,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireAuth();
  const db = getDatabase();

  const id = formData.get("id") as string;

  const thread = await db.query.threads.findFirst({
    where: (threads, { eq }) => eq(threads.id, id),
  });
  if (!thread) return { error: "Thread not found" };
  if (thread.authorId !== user.id && !hasPermission(user, Permission.MODERATE_THREAD)) {
    return { error: "Not authorized" };
  }

  await db
    .update(schema.threads)
    .set({ status: "DELETED" })
    .where(eq(schema.threads.id, id));

  await db
    .update(schema.forums)
    .set({
      threadCount: sql`GREATEST(${schema.forums.threadCount} - 1, 0)`,
    })
    .where(eq(schema.forums.id, thread.forumId));

  await auditService.log(user.id, AUDIT_ACTIONS.THREAD_DELETE, {
    resource: "thread",
    resourceId: id,
  });

  revalidatePath(`/forums`);
  return { success: true };
}
