import crypto from "crypto";
import { cache } from "@/lib/redis";
import { AIOrchestrator } from "../orchestration/orchestrator";
import type { AISearchAnalysis } from "../types";

export class AISearchService {
  /**
   * Perplexity-style Search ranking, summarization, and discoverability, cached in Redis.
   */
  static async searchAssistant(params: {
    query: string;
    typesenseResults: string;
    userId?: string;
  }): Promise<AISearchAnalysis> {
    const { query, typesenseResults, userId } = params;

    const hash = crypto
      .createHash("md5")
      .update(query + typesenseResults)
      .digest("hex");
    const cacheKey = `ai:search:${hash}`;

    // Try cache lookup first
    try {
      const cached = await cache.get<AISearchAnalysis>(cacheKey);
      if (cached) return cached;
    } catch {
      // ignore
    }

    const fallback: AISearchAnalysis = {
      summary: `Search results for "${query}" listed successfully.`,
      keyInsights: [],
      suggestedThreads: [],
      suggestedListings: [],
    };

    try {
      const result = await AIOrchestrator.run(
        "search_assistant",
        {
          query,
          results: typesenseResults,
        },
        {
          userId,
          actionType: "SEARCH_EXPERT",
          responseFormat: "json",
        },
      );

      if (!result.success) throw new Error(result.error);

      let parsed: AISearchAnalysis;
      try {
        parsed = JSON.parse(result.text);
      } catch {
        const cleaned = result.text
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        parsed = JSON.parse(cleaned);
      }

      // Save to cache (1 hour TTL)
      try {
        await cache.set(cacheKey, parsed, 3600);
      } catch {
        // ignore
      }

      return parsed;
    } catch {
      return fallback;
    }
  }
}
