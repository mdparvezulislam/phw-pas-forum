import "server-only";

import { and, asc, desc, eq, sql } from "drizzle-orm";
import { getDatabase, schema } from "@/db";
import type { Badge } from "@/db/schema/badges";
import type { Post } from "@/db/schema/posts";
import type { UserLevel } from "@/db/schema/user-levels";
import type { UserReputation } from "@/db/schema/user-reputation";
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

export interface PostWithAuthorReputation extends Post {
  author: {
    id: string;
    username: string | null;
    displayName: string | null;
    image: string | null;
    createdAt: Date;
    reputation?: UserReputation | null;
    level?: UserLevel | null;
    badges?: Badge[];
  };
}

export interface PostListOptions {
  threadId: string;
  page: number;
  perPage: number;
  sort?: "asc" | "desc";
  includeDeleted?: boolean;
}

export async function getPosts(
  options: PostListOptions,
): Promise<PaginatedResult<PostWithAuthor>> {
  const db = getDatabase();
  const {
    threadId,
    page,
    perPage,
    sort = "asc",
    includeDeleted = false,
  } = options;

  const conditions = [eq(schema.posts.threadId, threadId)];
  if (!includeDeleted) {
    conditions.push(sql`${schema.posts.status} != 'DELETED'`);
  }

  const where = and(...conditions);

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.posts)
    .where(where)
    .then((r) => Number(r[0].count));

  const orderBy =
    sort === "desc"
      ? [desc(schema.posts.postNumber)]
      : [asc(schema.posts.postNumber)];

  const items = (await db.query.posts.findMany({
    where,
    orderBy,
    limit: perPage,
    offset: (page - 1) * perPage,
    with: {
      author: {
        columns: {
          id: true,
          username: true,
          displayName: true,
          image: true,
          createdAt: true,
        },
      },
    },
  })) as PostWithAuthor[];

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getPostsWithReputation(
  options: PostListOptions,
): Promise<PaginatedResult<PostWithAuthorReputation>> {
  const result = await getPosts(options);
  const db = getDatabase();

  const authorIds = [...new Set(result.items.map((p) => p.author.id))];

  if (authorIds.length === 0) {
    return result as unknown as PaginatedResult<PostWithAuthorReputation>;
  }

  const [reputations, levels, userBadges] = await Promise.all([
    db.query.userReputation.findMany({
      where: (r, { inArray }) => inArray(r.userId, authorIds),
    }),
    db.query.userLevels.findMany({
      orderBy: (l, { desc }) => [desc(l.minPoints)],
    }),
    db.query.userBadges.findMany({
      where: (ub, { inArray }) => inArray(ub.userId, authorIds),
      with: { badge: true },
    }),
  ]);

  const repMap = new Map(reputations.map((r) => [r.userId, r]));
  const badgeMap = new Map<string, Badge[]>();
  for (const ub of userBadges) {
    const existing = badgeMap.get(ub.userId) ?? [];
    existing.push(ub.badge);
    badgeMap.set(ub.userId, existing);
  }

  const enriched = result.items.map((post) => {
    const userRep = repMap.get(post.author.id) ?? null;
    let userLevel: UserLevel | null = null;
    if (userRep) {
      for (const level of levels) {
        if (userRep.reputationPoints >= level.minPoints) {
          userLevel = level;
          break;
        }
      }
    }

    return {
      ...post,
      author: {
        ...post.author,
        reputation: userRep,
        level: userLevel,
        badges: badgeMap.get(post.author.id) ?? [],
      },
    };
  });

  return {
    ...result,
    items: enriched,
  } as PaginatedResult<PostWithAuthorReputation>;
}

export async function getPostById(id: string): Promise<PostWithAuthor | null> {
  const db = getDatabase();
  const post = (await db.query.posts.findFirst({
    where: (posts, { eq }) => eq(posts.id, id),
    with: {
      author: {
        columns: {
          id: true,
          username: true,
          displayName: true,
          image: true,
          createdAt: true,
        },
      },
    },
  })) as PostWithAuthor | null;
  return post;
}

export async function getNextPostNumber(threadId: string): Promise<number> {
  const db = getDatabase();
  const result = await db
    .select({
      maxPostNumber: sql<number>`coalesce(max(${schema.posts.postNumber}), 0)`,
    })
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

export interface PostEditHistoryItem {
  id: string;
  postId: string;
  previousContent: string;
  editedBy: string;
  reason: string | null;
  editedAt: Date;
  editor: {
    id: string;
    username: string | null;
    displayName: string | null;
  };
}

export async function getPostHistory(
  postId: string,
): Promise<PostEditHistoryItem[]> {
  const db = getDatabase();
  return (await db.query.postEditHistory.findMany({
    where: (h, { eq }) => eq(h.postId, postId),
    orderBy: (h, { desc }) => desc(h.editedAt),
    with: {
      editor: {
        columns: { id: true, username: true, displayName: true },
      },
    },
  })) as PostEditHistoryItem[];
}

export interface PostReportItem {
  id: string;
  postId: string;
  reporterId: string;
  reason: string;
  description: string | null;
  status: string;
  resolvedBy: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
  post: {
    id: string;
    content: string;
    postNumber: number;
    thread: {
      id: string;
      title: string;
      slug: string;
    };
    author: {
      id: string;
      username: string | null;
      displayName: string | null;
    };
  };
  reporter: {
    id: string;
    username: string | null;
    displayName: string | null;
  };
}

export async function getOpenReports(
  limit = 50,
  offset = 0,
): Promise<PostReportItem[]> {
  const db = getDatabase();
  return (await db.query.postReports.findMany({
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
  })) as PostReportItem[];
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
