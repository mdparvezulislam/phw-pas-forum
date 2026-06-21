import "server-only";

import { and, desc, gte, sql } from "drizzle-orm";
import { getDatabase, schema } from "@/db";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string | null;
  displayName: string | null;
  image: string | null;
  value: number;
}

export class LeaderboardService {
  async getReputationLeaderboard(
    timeframe: "weekly" | "monthly" | "all-time" = "all-time",
    limit = 50,
    offset = 0,
  ): Promise<LeaderboardEntry[]> {
    const db = getDatabase();
    const since = this.getSinceDate(timeframe);

    const txTable = schema.reputationTransactions;
    const conditions = since ? [gte(txTable.createdAt, since)] : [];

    const results = await db
      .select({
        userId: txTable.userId,
        totalPoints: sql<number>`cast(sum(${txTable.points}) as integer)`,
      })
      .from(txTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(txTable.userId)
      .orderBy(desc(sql`cast(sum(${txTable.points}) as integer)`))
      .limit(limit)
      .offset(offset);

    const entries: LeaderboardEntry[] = [];
    for (let i = 0; i < results.length; i++) {
      const user = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.id, results[i].userId),
        columns: { id: true, username: true, displayName: true, image: true },
      });
      if (user) {
        entries.push({
          rank: offset + i + 1,
          userId: user.id,
          username: user.username,
          displayName: user.displayName,
          image: user.image,
          value: results[i].totalPoints,
        });
      }
    }

    return entries;
  }

  async getPostLeaderboard(
    timeframe: "weekly" | "monthly" | "all-time" = "all-time",
    limit = 50,
    offset = 0,
  ): Promise<LeaderboardEntry[]> {
    const db = getDatabase();
    const since = this.getSinceDate(timeframe);

    const conditions = [sql`${schema.posts.status} = 'PUBLISHED'`];
    if (since) conditions.push(gte(schema.posts.createdAt, since));

    const results = await db
      .select({
        userId: schema.posts.authorId,
        totalPosts: sql<number>`cast(count(*) as integer)`,
      })
      .from(schema.posts)
      .where(and(...conditions))
      .groupBy(schema.posts.authorId)
      .orderBy(desc(sql`cast(count(*) as integer)`))
      .limit(limit)
      .offset(offset);

    const entries: LeaderboardEntry[] = [];
    for (let i = 0; i < results.length; i++) {
      const user = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.id, results[i].userId),
        columns: { id: true, username: true, displayName: true, image: true },
      });
      if (user) {
        entries.push({
          rank: offset + i + 1,
          userId: user.id,
          username: user.username,
          displayName: user.displayName,
          image: user.image,
          value: results[i].totalPosts,
        });
      }
    }

    return entries;
  }

  async getTrophyLeaderboard(
    limit = 50,
    offset = 0,
  ): Promise<LeaderboardEntry[]> {
    const db = getDatabase();

    const results = await db
      .select({
        userId: schema.userTrophies.userId,
        totalTrophies: sql<number>`cast(count(*) as integer)`,
      })
      .from(schema.userTrophies)
      .groupBy(schema.userTrophies.userId)
      .orderBy(desc(sql`cast(count(*) as integer)`))
      .limit(limit)
      .offset(offset);

    const entries: LeaderboardEntry[] = [];
    for (let i = 0; i < results.length; i++) {
      const user = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.id, results[i].userId),
        columns: { id: true, username: true, displayName: true, image: true },
      });
      if (user) {
        entries.push({
          rank: offset + i + 1,
          userId: user.id,
          username: user.username,
          displayName: user.displayName,
          image: user.image,
          value: results[i].totalTrophies,
        });
      }
    }

    return entries;
  }

  async getBadgeLeaderboard(
    limit = 50,
    offset = 0,
  ): Promise<LeaderboardEntry[]> {
    const db = getDatabase();

    const results = await db
      .select({
        userId: schema.userBadges.userId,
        totalBadges: sql<number>`cast(count(*) as integer)`,
      })
      .from(schema.userBadges)
      .groupBy(schema.userBadges.userId)
      .orderBy(desc(sql`cast(count(*) as integer)`))
      .limit(limit)
      .offset(offset);

    const entries: LeaderboardEntry[] = [];
    for (let i = 0; i < results.length; i++) {
      const user = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.id, results[i].userId),
        columns: { id: true, username: true, displayName: true, image: true },
      });
      if (user) {
        entries.push({
          rank: offset + i + 1,
          userId: user.id,
          username: user.username,
          displayName: user.displayName,
          image: user.image,
          value: results[i].totalBadges,
        });
      }
    }

    return entries;
  }

  private getSinceDate(
    timeframe: "weekly" | "monthly" | "all-time",
  ): Date | null {
    if (timeframe === "all-time") return null;
    const now = new Date();
    if (timeframe === "weekly") {
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

export const leaderboardService = new LeaderboardService();
