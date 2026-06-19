"use server";

import { revalidatePath } from "next/cache";
import { getDatabase, schema } from "@/db";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { auditService } from "@/services/audit";
import { requireAuth } from "@/modules/auth/guards";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";
import { sql } from "drizzle-orm";

export async function watchThread(
  prevState: any,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireAuth();
  const threadId = formData.get("threadId") as string;
  const db = getDatabase();

  const existing = await db.query.threadWatches.findFirst({
    where: (w, { and, eq }) =>
      and(eq(w.userId, user.id), eq(w.threadId, threadId)),
  });

  if (existing) {
    await db
      .delete(schema.threadWatches)
      .where(
        and(
          eq(schema.threadWatches.userId, user.id),
          eq(schema.threadWatches.threadId, threadId),
        ),
      );
    await db
      .update(schema.threads)
      .set({ watchCount: sql`GREATEST(${schema.threads.watchCount} - 1, 0)` })
      .where(eq(schema.threads.id, threadId));
    await auditService.log(user.id, AUDIT_ACTIONS.THREAD_UNWATCH, {
      resource: "thread",
      resourceId: threadId,
    });
  } else {
    await db.insert(schema.threadWatches).values({
      userId: user.id,
      threadId,
    });
    await db
      .update(schema.threads)
      .set({ watchCount: sql`${schema.threads.watchCount} + 1` })
      .where(eq(schema.threads.id, threadId));
    await auditService.log(user.id, AUDIT_ACTIONS.THREAD_WATCH, {
      resource: "thread",
      resourceId: threadId,
    });
  }

  revalidatePath(`/forums`);
  return { success: true };
}

export async function bookmarkThread(
  prevState: any,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireAuth();
  const threadId = formData.get("threadId") as string;
  const db = getDatabase();

  const existing = await db.query.threadBookmarks.findFirst({
    where: (b, { and, eq }) =>
      and(eq(b.userId, user.id), eq(b.threadId, threadId)),
  });

  if (existing) {
    await db
      .delete(schema.threadBookmarks)
      .where(
        and(
          eq(schema.threadBookmarks.userId, user.id),
          eq(schema.threadBookmarks.threadId, threadId),
        ),
      );
    await db
      .update(schema.threads)
      .set({ bookmarkCount: sql`GREATEST(${schema.threads.bookmarkCount} - 1, 0)` })
      .where(eq(schema.threads.id, threadId));
    await auditService.log(user.id, AUDIT_ACTIONS.THREAD_UNBOOKMARK, {
      resource: "thread",
      resourceId: threadId,
    });
  } else {
    await db.insert(schema.threadBookmarks).values({
      userId: user.id,
      threadId,
    });
    await db
      .update(schema.threads)
      .set({ bookmarkCount: sql`${schema.threads.bookmarkCount} + 1` })
      .where(eq(schema.threads.id, threadId));
    await auditService.log(user.id, AUDIT_ACTIONS.THREAD_BOOKMARK, {
      resource: "thread",
      resourceId: threadId,
    });
  }

  revalidatePath(`/forums`);
  return { success: true };
}
