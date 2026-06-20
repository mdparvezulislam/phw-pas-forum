import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { getDatabase, schema } from "@/db";
import { search as typesenseClient, COLLECTIONS } from "./typesense-sync";
import { emitEvent } from "@/lib/event-bus";
import { RoleName } from "@/types/rbac";

export interface SearchOptions {
  contentType?: "all" | "threads" | "posts" | "users" | "forums" | "badges" | "trophies";
  author?: string;
  forumId?: string;
  categoryId?: string;
  tags?: string[];
  minReputation?: number;
  startDate?: Date;
  endDate?: Date;
  sortBy?: "relevance" | "newest" | "oldest" | "most_viewed" | "most_replies" | "reputation";
  page?: number;
  perPage?: number;
}

export class SearchService {
  /**
   * Main search executor
   */
  async executeSearch(
    rawQuery: string,
    options: SearchOptions = {},
    currentUser: any | null = null
  ) {
    const db = getDatabase();
    const page = options.page ?? 1;
    const perPage = options.perPage ?? 20;

    // Parse advanced search directives from query
    const { parsedQuery, filters: parsedFilters } = this.parseQueryDirectives(rawQuery);
    const finalQuery = parsedQuery;

    // Build filter array
    const filterByParts: string[] = [];

    // Apply role-based visibility filter for content (threads/posts)
    const visibilityFilter = this.getVisibilityFilter(currentUser);
    filterByParts.push(visibilityFilter);

    // Apply parsed filters (author:john, etc.)
    if (parsedFilters.author) {
      filterByParts.push(`author:=${parsedFilters.author}`);
    }
    if (parsedFilters.forum) {
      filterByParts.push(`forum:=${parsedFilters.forum}`);
    }

    // Apply options filters
    if (options.author) {
      filterByParts.push(`author:=${options.author}`);
    }
    if (options.forumId) {
      filterByParts.push(`forumId:=${options.forumId}`);
    }
    if (options.categoryId) {
      filterByParts.push(`categoryId:=${options.categoryId}`);
    }
    if (options.minReputation !== undefined) {
      filterByParts.push(`reputation:>=${options.minReputation}`);
    }
    if (options.tags && options.tags.length > 0) {
      const tagFilters = options.tags.map((t) => `tags:=${t}`).join(" && ");
      filterByParts.push(tagFilters);
    }
    if (options.startDate) {
      const startSecs = Math.floor(options.startDate.getTime() / 1000);
      filterByParts.push(`createdAt:>=${startSecs}`);
    }
    if (options.endDate) {
      const endSecs = Math.floor(options.endDate.getTime() / 1000);
      filterByParts.push(`createdAt:<=${endSecs}`);
    }

    const filterBy = filterByParts.filter(Boolean).join(" && ");

    // Determine target collection
    const contentType = options.contentType ?? "all";
    const collectionName = this.getCollectionForContentType(contentType);

    // Sorting maps
    const sortBy = this.getSortByExpression(options.sortBy, contentType);

    // Execute search on Typesense
    const searchParams = {
      queryBy: this.getQueryByFields(contentType),
      filterBy,
      sortBy,
      page,
      perPage,
    };

    const searchResult = await (typesenseClient as any).search(collectionName, finalQuery, searchParams);

    // Log query in search analytics
    if (page === 1) {
      await this.logSearchQuery(rawQuery, filterByParts, searchResult.found, currentUser?.id || null);
    }

    // Save search history for authenticated users
    if (currentUser?.id && page === 1 && rawQuery.trim().length > 1) {
      await this.saveSearchHistory(currentUser.id, rawQuery);
    }

    return {
      hits: searchResult.hits || [],
      found: searchResult.found,
      page: searchResult.page,
      totalPages: Math.ceil(searchResult.found / perPage),
    };
  }

  /**
   * Autocomplete search suggestions
   */
  async getSuggestions(query: string, limit = 5) {
    if (!query || query.length < 2) return { threads: [], users: [], forums: [] };

    // Search threads, users, forums in parallel
    const [threadRes, userRes, forumRes] = await Promise.all([
      (typesenseClient as any).search(COLLECTIONS.THREADS, query, {
        queryBy: "title",
        filterBy: "visibility:=[PUBLIC]",
        perPage: limit,
      }),
      (typesenseClient as any).search(COLLECTIONS.USERS, query, {
        queryBy: "username,displayName",
        perPage: limit,
      }),
      (typesenseClient as any).search(COLLECTIONS.FORUMS, query, {
        queryBy: "title",
        perPage: limit,
      }),
    ]);

    return {
      threads: (threadRes.hits || []).map((h: any) => h.document),
      users: (userRes.hits || []).map((h: any) => h.document),
      forums: (forumRes.hits || []).map((h: any) => h.document),
    };
  }

  /**
   * Conversation messages search (isolated to participants)
   */
  async searchConversations(
    query: string,
    userId: string,
    options: { conversationId?: string; page?: number; perPage?: number } = {}
  ) {
    const filterBy = `participantIds:=[${userId}]${
      options.conversationId ? ` && conversationId:=${options.conversationId}` : ""
    }`;

    const searchResult = await (typesenseClient as any).search(
      COLLECTIONS.CONVERSATION_MESSAGES,
      query,
      {
        queryBy: "content",
        filterBy,
        page: options.page ?? 1,
        perPage: options.perPage ?? 20,
      }
    );

    return {
      hits: searchResult.hits || [],
      found: searchResult.found,
      page: searchResult.page,
    };
  }

  /**
   * Log searches for analytics
   */
  async logSearchQuery(query: string, filters: string[], resultCount: number, userId: string | null) {
    const db = getDatabase();
    try {
      await db.insert(schema.searchQueries).values({
        userId,
        query,
        filters,
        resultCount,
      });

      // Emit event
      await emitEvent({
        id: crypto.randomUUID(),
        type: "SEARCH_PERFORMED" as any,
        timestamp: new Date(),
        actorId: userId,
        query,
        resultCount,
      } as any);
    } catch (e) {
      console.error("[SearchAnalytics] Failed to log search query:", e);
    }
  }

  /**
   * Save user search history
   */
  async saveSearchHistory(userId: string, query: string) {
    const db = getDatabase();
    try {
      // Check if duplicate query recently, if so update searchedAt, else insert
      const existing = await db.query.searchHistories.findFirst({
        where: and(
          eq(schema.searchHistories.userId, userId),
          eq(schema.searchHistories.query, query)
        ),
      });

      if (existing) {
        await db
          .update(schema.searchHistories)
          .set({ searchedAt: new Date() })
          .where(eq(schema.searchHistories.id, existing.id));
      } else {
        await db.insert(schema.searchHistories).values({
          userId,
          query,
        });
      }
    } catch (e) {
      console.error("[SearchHistory] Failed to save search history:", e);
    }
  }

  async getSearchHistory(userId: string, limit = 10) {
    const db = getDatabase();
    return db.query.searchHistories.findMany({
      where: eq(schema.searchHistories.userId, userId),
      orderBy: [desc(schema.searchHistories.searchedAt)],
      limit,
    });
  }

  async clearSearchHistory(userId: string) {
    const db = getDatabase();
    await db.delete(schema.searchHistories).where(eq(schema.searchHistories.userId, userId));
  }

  /**
   * Get trending search terms based on analytics (last 7 days)
   */
  async getTrendingSearches(limit = 5) {
    const db = getDatabase();
    const result = await db
      .select({
        query: schema.searchQueries.query,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.searchQueries)
      .where(sql`${schema.searchQueries.searchedAt} >= now() - interval '7 days'`)
      .groupBy(schema.searchQueries.query)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);
    return result.map((r) => r.query);
  }

  // Parse inline filters like author:john and forum:seo
  private parseQueryDirectives(query: string) {
    let parsedQuery = query;
    const filters: { author?: string; forum?: string } = {};

    const authorRegex = /\bauthor:(\w+)\b/i;
    const authorMatch = parsedQuery.match(authorRegex);
    if (authorMatch) {
      filters.author = authorMatch[1];
      parsedQuery = parsedQuery.replace(authorRegex, "");
    }

    const forumRegex = /\bforum:([\w-]+)\b/i;
    const forumMatch = parsedQuery.match(forumRegex);
    if (forumMatch) {
      filters.forum = forumMatch[1];
      parsedQuery = parsedQuery.replace(forumRegex, "");
    }

    return {
      parsedQuery: parsedQuery.trim(),
      filters,
    };
  }

  private getVisibilityFilter(user: any | null): string {
    if (!user) return 'visibility:="PUBLIC"';
    const role = user.role;

    if (role === RoleName.VIP || role === RoleName.ADMIN || role === RoleName.SUPER_ADMIN) {
      return "visibility:=[PUBLIC, PREMIUM, PRIVATE]";
    }
    if (role === RoleName.MEMBER) {
      return "visibility:=[PUBLIC, PRIVATE]";
    }
    return 'visibility:="PUBLIC"';
  }

  private getCollectionForContentType(contentType: string): string {
    switch (contentType) {
      case "threads": return COLLECTIONS.THREADS;
      case "posts": return COLLECTIONS.POSTS;
      case "users": return COLLECTIONS.USERS;
      case "forums": return COLLECTIONS.FORUMS;
      case "badges": return COLLECTIONS.BADGES;
      case "trophies": return COLLECTIONS.TROPHIES;
      default: return COLLECTIONS.THREADS;
    }
  }

  private getQueryByFields(contentType: string): string {
    switch (contentType) {
      case "threads": return "title,content,tags";
      case "posts": return "content,threadTitle";
      case "users": return "username,displayName";
      case "forums": return "title,description";
      case "badges": return "name,description";
      case "trophies": return "title,description";
      default: return "title,content,username,displayName,name,description";
    }
  }

  private getSortByExpression(sortOption?: string, contentType?: string): string | undefined {
    if (!sortOption) return undefined;
    if (sortOption === "newest") return "createdAt:desc";
    if (sortOption === "oldest") return "createdAt:asc";
    if (sortOption === "most_viewed" && contentType === "threads") return "views:desc";
    if (sortOption === "most_replies" && contentType === "threads") return "replies:desc";
    if (sortOption === "reputation" && contentType === "users") return "reputation:desc";
    return undefined;
  }
}

export const searchService = new SearchService();
export default searchService;
