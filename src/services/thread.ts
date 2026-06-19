import { and, asc, desc, eq, ne, or, sql } from "drizzle-orm";
import { getDatabase, schema } from "@/db";
import type { Thread, ThreadStatus } from "@/db/schema/threads";
import type {
  PaginatedResult,
  ThreadListOptions,
  ThreadWithRelations,
} from "@/modules/thread/types";

const threadWithRelations = {
  with: {
    author: {
      columns: { id: true, username: true, displayName: true, image: true },
    },
    tags: {
      columns: { tag: true },
    },
  },
} as any;

export async function getThreads(
  options: ThreadListOptions,
): Promise<PaginatedResult<ThreadWithRelations>> {
  const db = getDatabase();
  const {
    forumId,
    authorId,
    status,
    isPinned,
    isFeatured,
    page,
    perPage,
    sort,
  } = options;

  const conditions: any[] = [];
  if (forumId) conditions.push(eq(schema.threads.forumId, forumId));
  if (authorId) conditions.push(eq(schema.threads.authorId, authorId));
  if (status) conditions.push(eq(schema.threads.status, status));
  else conditions.push(ne(schema.threads.status, "DELETED"));
  if (isPinned !== undefined)
    conditions.push(eq(schema.threads.isPinned, isPinned));
  if (isFeatured !== undefined)
    conditions.push(eq(schema.threads.isFeatured, isFeatured));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.threads)
    .where(where)
    .then((r) => Number(r[0].count));

  const orderBy = (() => {
    switch (sort) {
      case "oldest":
        return [asc(schema.threads.publishedAt)];
      case "most_viewed":
        return [desc(schema.threads.viewCount)];
      case "most_replies":
        return [desc(schema.threads.replyCount)];
      default:
        return [
          desc(schema.threads.isPinned),
          desc(schema.threads.publishedAt),
        ];
    }
  })();

  const items = (await (db.query.threads as any).findMany({
    where,
    orderBy,
    limit: perPage,
    offset: (page - 1) * perPage,
    ...threadWithRelations,
  })) as ThreadWithRelations[];

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getThread(
  slug: string,
): Promise<ThreadWithRelations | null> {
  const db = getDatabase();
  const thread = (await (db.query.threads as any).findFirst({
    where: (t: any, { eq }: any) => eq(t.slug, slug),
    ...threadWithRelations,
  })) as ThreadWithRelations | null;
  return thread;
}

export async function getThreadById(
  id: string,
): Promise<ThreadWithRelations | null> {
  const db = getDatabase();
  const thread = (await (db.query.threads as any).findFirst({
    where: (t: any, { eq }: any) => eq(t.id, id),
    ...threadWithRelations,
  })) as ThreadWithRelations | null;
  return thread;
}

export async function incrementThreadView(id: string): Promise<void> {
  const db = getDatabase();
  await db
    .update(schema.threads)
    .set({ viewCount: sql`${schema.threads.viewCount} + 1` })
    .where(eq(schema.threads.id, id));
}

export async function getPinnedThreads(
  forumId: string,
): Promise<ThreadWithRelations[]> {
  const db = getDatabase();
  const items = (await (db.query.threads as any).findMany({
    where: (t: any, { and, eq }: any) =>
      and(
        eq(t.forumId, forumId),
        eq(t.isPinned, true),
        ne(t.status, "DELETED"),
      ),
    orderBy: (t: any, { desc }: any) => desc(t.publishedAt),
    ...threadWithRelations,
  })) as ThreadWithRelations[];
  return items;
}

export async function getThreadWithUserState(
  slug: string,
  userId: string | null,
): Promise<
  (ThreadWithRelations & { isWatched: boolean; isBookmarked: boolean }) | null
> {
  const thread = await getThread(slug);
  if (!thread) return null;

  if (!userId) {
    return { ...thread, isWatched: false, isBookmarked: false };
  }

  const db = getDatabase();

  const [watch, bookmark] = await Promise.all([
    db.query.threadWatches.findFirst({
      where: (w: any, { and, eq }: any) =>
        and(eq(w.userId, userId), eq(w.threadId, thread.id)),
    }),
    db.query.threadBookmarks.findFirst({
      where: (b: any, { and, eq }: any) =>
        and(eq(b.userId, userId), eq(b.threadId, thread.id)),
    }),
  ]);

  return {
    ...thread,
    isWatched: !!watch,
    isBookmarked: !!bookmark,
  };
}
