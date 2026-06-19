import "server-only";

import { getDatabase, schema } from "@/db";
import { eq, and, desc, asc, sql, count } from "drizzle-orm";
import type { Post, PostStatus } from "@/db/schema/posts";
import type { PostReportStatus } from "@/db/schema/post-reports";
import type { PaginatedResult } from "@/modules/thread/types";

export interface PostWithAuthor extends Post {
  author: {
    id: string;
    username: string | null;
    displayName: string | null;
    image: string | null;
    createdAt: Date;
  };
}

export interface PostListOptions {
  threadId: string;
  page: number;
  perPage: number;
  sort?: "asc" | "desc";
  includeDeleted?: boolean;
}

const postWithAuthor = {
  with: {
    author: {
      columns: { id: true, username: true, displayName: true, image: true, createdAt: true },
    },
  },
} as any;

export async function getPosts(
  options: PostListOptions,
): Promise<PaginatedResult<PostWithAuthor>> {
  const db = getDatabase();
  const { threadId, page, perPage, sort = "asc", includeDeleted = false } = options;

  const conditions: any[] = [eq(schema.posts.threadId, threadId)];
  if (!includeDeleted) {
    conditions.push(sql`${schema.posts.status} != 'DELETED'`);
  }

  const where = and(...conditions);

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.posts)
    .where(where)
    .then((r) => Number(r[0].count));

  const orderBy = sort === "desc" ? [desc(schema.posts.postNumber)] : [asc(schema.posts.postNumber)];

  const items = await (db.query.posts as any).findMany({
    where,
    orderBy,
    limit: perPage,
    offset: (page - 1) * perPage,
    ...postWithAuthor,
  }) as PostWithAuthor[];

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getPostById(id: string): Promise<PostWithAuthor | null> {
  const db = getDatabase();
  const post = await (db.query.posts as any).findFirst({
    where: (p: any, { eq }: any) => eq(p.id, id),
    ...postWithAuthor,
  }) as PostWithAuthor | null;
  return post;
}

export async function getNextPostNumber(threadId: string): Promise<number> {
  const db = getDatabase();
  const result = await db
    .select({ maxPostNumber: sql<number>`coalesce(max(${schema.posts.postNumber}), 0)` })
    .from(schema.posts)
    .where(eq(schema.posts.threadId, threadId))
    .then((r) => Number(r[0].maxPostNumber));
  return result + 1;
}

export async function getPostCount(threadId: string): Promise<number> {
  const db = getDatabase();
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.posts)
    .where(
      and(
        eq(schema.posts.threadId, threadId),
        sql`${schema.posts.status} != 'DELETED'`,
      ),
    )
    .then((r) => Number(r[0].count));
  return result;
}

export async function getPostHistory(postId: string) {
  const db = getDatabase();
  return db.query.postEditHistory.findMany({
    where: (h, { eq }) => eq(h.postId, postId),
    orderBy: (h, { desc }) => desc(h.editedAt),
    with: {
      editor: {
        columns: { id: true, username: true, displayName: true },
      },
    },
  }) as any[];
}

export async function getOpenReports(limit = 50, offset = 0) {
  const db = getDatabase();
  return db.query.postReports.findMany({
    where: (r, { eq }) => eq(r.status, "OPEN"),
    orderBy: (r, { desc }) => desc(r.createdAt),
    limit,
    offset,
    with: {
      post: {
        columns: { id: true, content: true, postNumber: true },
        with: {
          thread: {
            columns: { id: true, title: true, slug: true },
          },
          author: {
            columns: { id: true, username: true, displayName: true },
          },
        },
      },
      reporter: {
        columns: { id: true, username: true, displayName: true },
      },
    },
  }) as any[];
}

export async function getReportCount(): Promise<number> {
  const db = getDatabase();
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.postReports)
    .where(eq(schema.postReports.status, "OPEN"))
    .then((r) => Number(r[0].count));
  return result;
}
