import { and, desc, eq, gte, lte, ne, sql } from "drizzle-orm";
import { getDatabase, schema } from "@/db";
import { cache } from "@/lib/redis";

export class AIRecommendationEngine {
  /**
   * Generates a personalized "For You" feed matching the user's forum activity, cached in Redis.
   */
  static async getForYouFeed(params: {
    userId: string;
    limit?: number;
  }): Promise<{
    recommendedThreads: any[];
    recommendedListings: any[];
  }> {
    const { userId, limit = 5 } = params;
    const db = getDatabase();
    const cacheKey = `ai:recs:user:${userId}`;

    // Try cache first
    try {
      const cached = await cache.get<any>(cacheKey);
      if (cached) return cached;
    } catch {
      // ignore
    }

    try {
      // 1. Fetch user's recent posts to understand interests
      const recentPosts = await db.query.posts.findMany({
        where: eq(schema.posts.authorId, userId),
        orderBy: [desc(schema.posts.createdAt)],
        limit: 10,
        with: {
          thread: true,
        },
      });

      const activeForumIds = Array.from(
        new Set(recentPosts.map((p) => p.thread?.forumId).filter(Boolean)),
      );

      let recommendedThreads: any[] = [];
      let recommendedListings: any[] = [];

      // 2. Query threads from matching forum categories
      if (activeForumIds.length > 0) {
        recommendedThreads = await db.query.threads.findMany({
          where: and(
            ne(schema.threads.authorId, userId),
            sql`forum_id IN (${sql.join(activeForumIds, sql`, `)})`,
          ),
          orderBy: [desc(schema.threads.createdAt)],
          limit,
          with: {
            author: {
              columns: {
                id: true,
                username: true,
                displayName: true,
                image: true,
              },
            },
          },
        });
      }

      if (recommendedThreads.length === 0) {
        recommendedThreads = await db.query.threads.findMany({
          where: ne(schema.threads.authorId, userId),
          orderBy: [
            desc(schema.threads.viewCount),
            desc(schema.threads.createdAt),
          ],
          limit,
          with: {
            author: {
              columns: {
                id: true,
                username: true,
                displayName: true,
                image: true,
              },
            },
          },
        });
      }

      // 3. Fetch matching or trending marketplace listings
      recommendedListings = await db.query.marketplaceListings.findMany({
        where: eq(schema.marketplaceListings.status, "ACTIVE"),
        orderBy: [desc(schema.marketplaceListings.createdAt)],
        limit,
        with: {
          seller: {
            columns: {
              id: true,
              userId: true,
              displayName: true,
              avatar: true,
            },
          },
        },
      });

      const result = {
        recommendedThreads,
        recommendedListings,
      };

      // Save to cache (1 hour TTL)
      try {
        await cache.set(cacheKey, result, 3600);
      } catch {
        // ignore
      }

      return result;
    } catch {
      return {
        recommendedThreads: [],
        recommendedListings: [],
      };
    }
  }
}
