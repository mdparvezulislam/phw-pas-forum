import { cache } from "@/lib/redis";
import { AIOrchestrator } from "../orchestration/orchestrator";

export class AISummariesService {
  /**
   * Summarizes long thread posts to highlight key resources and answers, cached in Redis.
   */
  static async summarizeThread(params: {
    threadId: string;
    title: string;
    posts: Array<{ authorName: string; content: string }>;
    userId?: string;
  }): Promise<string> {
    const { threadId, title, posts, userId } = params;
    const cacheKey = `ai:summary:thread:${threadId}`;

    // Try cache first
    try {
      const cached = await cache.get<string>(cacheKey);
      if (cached) return cached;
    } catch {
      // ignore cache failure
    }

    const formattedPosts = posts
      .slice(0, 15) // limit context
      .map((p, idx) => `[Post #${idx + 1} by ${p.authorName}]: ${p.content}`)
      .join("\n\n");

    try {
      const result = await AIOrchestrator.run(
        "summarize",
        {
          title,
          posts: formattedPosts,
        },
        {
          userId,
          actionType: "THREAD_SUMMARY",
        },
      );

      if (!result.success) throw new Error(result.error);

      // Save to cache (24 hours TTL)
      try {
        await cache.set(cacheKey, result.text, 86400);
      } catch {
        // ignore cache write error
      }

      return result.text;
    } catch (err: any) {
      return `Failed to generate AI Thread Summary: ${err.message || String(err)}`;
    }
  }
}
