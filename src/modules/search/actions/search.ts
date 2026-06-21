"use server";

import { isAtLeast } from "@/config/rbac";
import type { SearchIndexEntityType } from "@/db/schema/search-index-jobs";
import { auth } from "@/lib/auth";
import { requireAuth } from "@/modules/auth/guards";
import { type SearchOptions, searchService } from "@/services/search";
import { typesenseSyncService } from "@/services/typesense-sync";
import { RoleName } from "@/types/rbac";

// Type-safe serializable search options for client communication
export interface SerializableSearchOptions {
  contentType?:
    | "all"
    | "threads"
    | "posts"
    | "users"
    | "forums"
    | "badges"
    | "trophies";
  author?: string;
  forumId?: string;
  categoryId?: string;
  tags?: string[];
  minReputation?: number;
  startDate?: string; // Serialized date
  endDate?: string; // Serialized date
  sortBy?:
    | "relevance"
    | "newest"
    | "oldest"
    | "most_viewed"
    | "most_replies"
    | "reputation";
  page?: number;
  perPage?: number;
}

/**
 * Execute search query
 */
export async function executeSearchAction(
  rawQuery: string,
  options: SerializableSearchOptions = {},
) {
  const session = await auth();
  const currentUser = session?.user ?? null;

  const parsedOptions: SearchOptions = {
    ...options,
    startDate: options.startDate ? new Date(options.startDate) : undefined,
    endDate: options.endDate ? new Date(options.endDate) : undefined,
  };

  try {
    const results = await searchService.executeSearch(
      rawQuery,
      parsedOptions,
      currentUser,
    );
    return { success: true, ...results };
  } catch (error: any) {
    console.error("[SearchAction] Failed to execute search:", error);
    return {
      success: false,
      error: error.message || "Failed to execute search",
    };
  }
}

/**
 * Get autocomplete suggestions
 */
export async function getSuggestionsAction(query: string) {
  try {
    const suggestions = await searchService.getSuggestions(query);
    return { success: true, suggestions };
  } catch (error: any) {
    console.error("[SearchAction] Failed to fetch suggestions:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch suggestions",
    };
  }
}

/**
 * Get history of logged-in user
 */
export async function getSearchHistoryAction() {
  try {
    const user = await requireAuth();
    const history = await searchService.getSearchHistory(user.id);
    return { success: true, history };
  } catch (error: any) {
    console.error("[SearchAction] Failed to fetch search history:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch search history",
    };
  }
}

/**
 * Clear history of logged-in user
 */
export async function clearSearchHistoryAction() {
  try {
    const user = await requireAuth();
    await searchService.clearSearchHistory(user.id);
    return { success: true };
  } catch (error: any) {
    console.error("[SearchAction] Failed to clear search history:", error);
    return {
      success: false,
      error: error.message || "Failed to clear search history",
    };
  }
}

/**
 * Get trending search topics (7 days)
 */
export async function getTrendingSearchesAction() {
  try {
    const trending = await searchService.getTrendingSearches();
    return { success: true, trending };
  } catch (error: any) {
    console.error("[SearchAction] Failed to fetch trending searches:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch trending searches",
    };
  }
}

/**
 * Admin action to trigger bulk reindexing of Typesense collections
 */
export async function adminTriggerReindexAction(
  entityType: SearchIndexEntityType,
) {
  try {
    const user = await requireAuth();

    // RBAC: Verify if the user has admin roles
    if (!isAtLeast(user as any, RoleName.ADMIN)) {
      return { success: false, error: "Unauthorized: Admins only" };
    }

    // Run bulk indexing in background so request does not timeout
    typesenseSyncService.bulkSync(entityType).catch((err) => {
      console.error(
        `[SearchAction] Bulk reindexing failed for ${entityType}:`,
        err,
      );
    });

    return {
      success: true,
      message: `Bulk reindexing started for ${entityType}`,
    };
  } catch (error: any) {
    console.error("[SearchAction] Failed to trigger bulk reindexing:", error);
    return {
      success: false,
      error: error.message || "Failed to trigger bulk reindexing",
    };
  }
}

/**
 * Conversation specific search (only logs in user is matching participantIds)
 */
export async function searchConversationsAction(
  query: string,
  options: { conversationId?: string; page?: number; perPage?: number } = {},
) {
  try {
    const user = await requireAuth();
    const results = await searchService.searchConversations(
      query,
      user.id,
      options,
    );
    return { success: true, ...results };
  } catch (error: any) {
    console.error("[SearchAction] Failed to search conversations:", error);
    return {
      success: false,
      error: error.message || "Failed to search conversations",
    };
  }
}
