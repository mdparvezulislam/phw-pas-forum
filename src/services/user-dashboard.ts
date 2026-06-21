import { and, count, desc, eq, sql } from "drizzle-orm";
import { getDatabase, schema } from "@/db";
import { conversationService } from "@/services/conversation";
import { notificationService } from "@/services/notification";
import { reputationEngine } from "@/services/reputation-engine";

export async function getDashboardData(userId: string) {
  const db = getDatabase();

  const [
    user,
    profile,
    reputation,
    levelInfo,
    unreadNotifications,
    unreadCount,
    recentActivity,
    recentBadges,
  ] = await Promise.all([
    db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, userId),
      with: { role: true },
    }),
    db.query.profiles.findFirst({
      where: (p, { eq }) => eq(p.userId, userId),
    }),
    reputationEngine.getUserReputation(userId),
    reputationEngine.getUserLevel(userId),
    notificationService.getNotifications(userId, { limit: 10 }),
    notificationService.getUnreadCount(userId),
    db
      .select({
        type: sql<string>`'post'`.as("type"),
        id: schema.posts.id,
        createdAt: schema.posts.createdAt,
        threadTitle: schema.threads.title,
        threadSlug: schema.threads.slug,
      })
      .from(schema.posts)
      .innerJoin(schema.threads, eq(schema.posts.threadId, schema.threads.id))
      .where(eq(schema.posts.authorId, userId))
      .orderBy(desc(schema.posts.createdAt))
      .limit(5),
    db
      .select({
        id: schema.userBadges.id,
        badgeId: schema.userBadges.badgeId,
        earnedAt: schema.userBadges.earnedAt,
        badge: {
          name: schema.badges.name,
          icon: schema.badges.icon,
          color: schema.badges.color,
        },
      })
      .from(schema.userBadges)
      .innerJoin(schema.badges, eq(schema.userBadges.badgeId, schema.badges.id))
      .where(eq(schema.userBadges.userId, userId))
      .orderBy(desc(schema.userBadges.earnedAt))
      .limit(3),
  ]);

  const conversationResult = await conversationService.getConversations(
    userId,
    {
      limit: 5,
    },
  );

  const [{ threadCount }] = await db
    .select({ threadCount: count() })
    .from(schema.threads)
    .where(eq(schema.threads.authorId, userId));

  const [{ postCount }] = await db
    .select({ postCount: count() })
    .from(schema.posts)
    .where(eq(schema.posts.authorId, userId));

  return {
    user,
    profile,
    reputation,
    levelInfo,
    unreadNotifications,
    unreadCount,
    recentActivity,
    recentBadges: recentBadges.map((b) => ({
      ...b.badge,
      earnedAt: b.earnedAt,
    })),
    unreadMessages:
      (conversationResult as any).items?.filter((c: any) => c.unreadCount > 0)
        .length ?? 0,
    stats: {
      threadCount,
      postCount,
      badgeCount: reputation?.badgesEarned ?? 0,
      trophyCount: reputation?.trophiesEarned ?? 0,
      reputationPoints: reputation?.reputationPoints ?? 0,
    },
  };
}

export async function getUserStats(userId: string) {
  const db = getDatabase();

  const [threadCount, postCount, reactionCount, watchCount, bookmarkCount] =
    await Promise.all([
      db
        .select({ count: count() })
        .from(schema.threads)
        .where(eq(schema.threads.authorId, userId))
        .then((r) => r[0]?.count ?? 0),
      db
        .select({ count: count() })
        .from(schema.posts)
        .where(eq(schema.posts.authorId, userId))
        .then((r) => r[0]?.count ?? 0),
      db
        .select({ count: count() })
        .from(schema.reactions)
        .where(eq(schema.reactions.userId, userId))
        .then((r) => r[0]?.count ?? 0),
      db
        .select({ count: count() })
        .from(schema.threadWatches)
        .where(eq(schema.threadWatches.userId, userId))
        .then((r) => r[0]?.count ?? 0),
      db
        .select({ count: count() })
        .from(schema.threadBookmarks)
        .where(eq(schema.threadBookmarks.userId, userId))
        .then((r) => r[0]?.count ?? 0),
    ]);

  return {
    threadCount,
    postCount,
    reactionCount,
    watchCount,
    bookmarkCount,
  };
}

export async function getBookmarkedThreads(userId: string) {
  const db = getDatabase();
  return db
    .select({
      id: schema.threadBookmarks.threadId,
      bookmarkedAt: schema.threadBookmarks.createdAt,
      title: schema.threads.title,
      slug: schema.threads.slug,
      replyCount: schema.threads.replyCount,
      viewCount: schema.threads.viewCount,
      createdAt: schema.threads.createdAt,
      author: {
        username: schema.users.username,
        displayName: schema.users.displayName,
      },
      forum: {
        title: schema.forums.title,
        slug: schema.forums.slug,
      },
      category: {
        title: schema.categories.title,
        slug: schema.categories.slug,
      },
    })
    .from(schema.threadBookmarks)
    .innerJoin(
      schema.threads,
      eq(schema.threadBookmarks.threadId, schema.threads.id),
    )
    .innerJoin(schema.users, eq(schema.threads.authorId, schema.users.id))
    .innerJoin(schema.forums, eq(schema.threads.forumId, schema.forums.id))
    .innerJoin(
      schema.categories,
      eq(schema.forums.categoryId, schema.categories.id),
    )
    .where(eq(schema.threadBookmarks.userId, userId))
    .orderBy(desc(schema.threadBookmarks.createdAt));
}

export async function getWatchedThreads(userId: string) {
  const db = getDatabase();
  return db
    .select({
      id: schema.threadWatches.threadId,
      watchedAt: schema.threadWatches.createdAt,
      title: schema.threads.title,
      slug: schema.threads.slug,
      replyCount: schema.threads.replyCount,
      viewCount: schema.threads.viewCount,
      lastActivityAt: schema.threads.updatedAt,
      createdAt: schema.threads.createdAt,
      author: {
        username: schema.users.username,
        displayName: schema.users.displayName,
      },
      forum: {
        title: schema.forums.title,
        slug: schema.forums.slug,
      },
      category: {
        title: schema.categories.title,
        slug: schema.categories.slug,
      },
    })
    .from(schema.threadWatches)
    .innerJoin(
      schema.threads,
      eq(schema.threadWatches.threadId, schema.threads.id),
    )
    .innerJoin(schema.users, eq(schema.threads.authorId, schema.users.id))
    .innerJoin(schema.forums, eq(schema.threads.forumId, schema.forums.id))
    .innerJoin(
      schema.categories,
      eq(schema.forums.categoryId, schema.categories.id),
    )
    .where(eq(schema.threadWatches.userId, userId))
    .orderBy(desc(schema.threadWatches.createdAt));
}

export async function getUserReputationHistory(userId: string) {
  const db = getDatabase();
  const transactions = await db
    .select({
      id: schema.reputationTransactions.id,
      type: schema.reputationTransactions.type,
      points: schema.reputationTransactions.points,
      entityType: schema.reputationTransactions.entityType,
      createdAt: schema.reputationTransactions.createdAt,
      sourceUser: {
        username: schema.users.username,
        displayName: schema.users.displayName,
      },
    })
    .from(schema.reputationTransactions)
    .leftJoin(
      schema.users,
      eq(schema.reputationTransactions.sourceUserId, schema.users.id),
    )
    .where(eq(schema.reputationTransactions.userId, userId))
    .orderBy(desc(schema.reputationTransactions.createdAt))
    .limit(100);

  return transactions;
}
