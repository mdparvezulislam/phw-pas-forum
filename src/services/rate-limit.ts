import "server-only";

import { RATE_LIMITS } from "@/constants";
import { cache } from "@/lib/redis";

type RateLimitKey = keyof typeof RATE_LIMITS;

export class RateLimiter {
  private getKey(key: RateLimitKey, identifier: string): string {
    return `ratelimit:${key}:${identifier}`;
  }

  async check(
    key: RateLimitKey,
    identifier: string,
  ): Promise<{ allowed: boolean; remaining: number; reset: number }> {
    const config = RATE_LIMITS[key];
    const cacheKey = this.getKey(key, identifier);

    const current = await cache.get<{ count: number; resetAt: number }>(
      cacheKey,
    );
    const now = Math.floor(Date.now() / 1000);

    if (!current || now >= current.resetAt) {
      const resetAt = now + config.window;
      await cache.set(cacheKey, { count: 1, resetAt }, config.window);
      return { allowed: true, remaining: config.max - 1, reset: resetAt };
    }

    if (current.count >= config.max) {
      return {
        allowed: false,
        remaining: 0,
        reset: current.resetAt,
      };
    }

    current.count += 1;
    await cache.set(cacheKey, current, config.window);

    return {
      allowed: true,
      remaining: config.max - current.count,
      reset: current.resetAt,
    };
  }

  async reset(key: RateLimitKey, identifier: string): Promise<void> {
    const cacheKey = this.getKey(key, identifier);
    await cache.del(cacheKey);
  }
}

export const rateLimiter = new RateLimiter();
