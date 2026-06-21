import "server-only";

import { cache } from "@/lib/redis";
import { getEnv } from "@/validations/env";

export class RedisRateLimiter {
  private getClient() {
    return (cache as any).client;
  }

  /**
   * Check rate limit atomically using Redis pipeline commands.
   * Returns whether the request is allowed, remaining tokens, and reset time.
   */
  async check(
    identifier: string,
    limit: number,
    windowSeconds: number,
  ): Promise<{ allowed: boolean; remaining: number; reset: number }> {
    const env = getEnv();
    if (!env.RATE_LIMIT_ENABLED) {
      return {
        allowed: true,
        remaining: limit,
        reset: Math.floor(Date.now() / 1000) + windowSeconds,
      };
    }

    const client = this.getClient();
    if (!client || (cache as any)._enabled === false) {
      // Fallback if Redis is unavailable
      return {
        allowed: true,
        remaining: limit,
        reset: Math.floor(Date.now() / 1000) + windowSeconds,
      };
    }

    const cacheKey = `ratelimit:${identifier}`;
    const now = Math.floor(Date.now() / 1000);

    try {
      const pipeline = client.pipeline();
      pipeline.incr(cacheKey);
      pipeline.ttl(cacheKey);

      const results = await pipeline.exec();
      if (!results || results.length < 2) {
        return { allowed: true, remaining: limit, reset: now + windowSeconds };
      }

      const count = results[0][1] as number;
      let ttl = results[1][1] as number;

      // If key is fresh, set TTL
      if (ttl < 0) {
        await client.expire(cacheKey, windowSeconds);
        ttl = windowSeconds;
      }

      const allowed = count <= limit;
      const remaining = Math.max(0, limit - count);
      const reset = now + ttl;

      return { allowed, remaining, reset };
    } catch (error) {
      console.error(
        "[RateLimiter] Redis command failed, bypassing limit check:",
        error,
      );
      return { allowed: true, remaining: limit, reset: now + windowSeconds };
    }
  }

  /**
   * Reset rate limit bucket
   */
  async reset(identifier: string): Promise<void> {
    const client = this.getClient();
    if (!client) return;
    try {
      await client.del(`ratelimit:${identifier}`);
    } catch {
      // Ignore
    }
  }
}

export const rateLimiter = new RedisRateLimiter();
export default rateLimiter;
