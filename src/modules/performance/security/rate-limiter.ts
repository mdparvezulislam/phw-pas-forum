import "server-only";
import { redisService } from "@/modules/performance/cache/redis-service";
import { RATE_LIMITS, RATE_LIMIT_DEFAULTS } from "@/constants";
import { getEnv } from "@/validations/env";
import { logger } from "@/lib/logger";

type RateLimitKey = keyof typeof RATE_LIMITS;

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number;
  retryAfter: number;
  limit: number;
}

interface RateLimitConfig {
  window: number;
  max: number;
}

class EnhancedRateLimiter {
  private async getCount(
    key: string,
    window: number,
  ): Promise<{ count: number; resetAt: number }> {
    const now = Math.floor(Date.now() / 1000);
    const data = await redisService.get<{ count: number; resetAt: number }>(
      key,
    );

    if (!data || now >= data.resetAt) {
      return { count: 0, resetAt: now + window };
    }

    return data;
  }

  async check(
    key: RateLimitKey,
    identifier: string,
    configOverride?: Partial<RateLimitConfig>,
  ): Promise<RateLimitResult> {
    if (!getEnv().RATE_LIMIT_ENABLED) {
      const config = configOverride ?? RATE_LIMITS[key];
      return {
        allowed: true,
        remaining: config?.max ?? 999999,
        reset: Math.floor(Date.now() / 1000) + 3600,
        retryAfter: 0,
        limit: config?.max ?? 999999,
      };
    }

    const config = {
      ...RATE_LIMITS[key],
      ...configOverride,
    };

    const cacheKey = `ratelimit:${key}:${identifier}`;
    const { count, resetAt } = await this.getCount(cacheKey, config.window);
    const now = Math.floor(Date.now() / 1000);

    if (count >= config.max) {
      return {
        allowed: false,
        remaining: 0,
        reset: resetAt,
        retryAfter: Math.max(0, resetAt - now),
        limit: config.max,
      };
    }

    const pipeline = [
      redisService.set(
        cacheKey,
        { count: count + 1, resetAt },
        { ttl: config.window },
      ),
    ];

    const remaining = config.max - (count + 1);
    if (remaining >= 0) {
      const headerKey = `ratelimit:remaining:${identifier}`;
      pipeline.push(
        redisService.set(headerKey, remaining, { ttl: config.window }),
      );
    }

    await Promise.all(pipeline);

    return {
      allowed: true,
      remaining,
      reset: resetAt,
      retryAfter: 0,
      limit: config.max,
    };
  }

  async checkGlobal(identifier: string): Promise<RateLimitResult> {
    return this.checkCustom(
      "global",
      identifier,
      RATE_LIMIT_DEFAULTS.GLOBAL.window,
      RATE_LIMIT_DEFAULTS.GLOBAL.max,
    );
  }

  async checkPerUser(userId: string): Promise<RateLimitResult> {
    return this.checkCustom(
      "user",
      userId,
      RATE_LIMIT_DEFAULTS.PER_USER.window,
      RATE_LIMIT_DEFAULTS.PER_USER.max,
    );
  }

  async checkPerIP(ip: string): Promise<RateLimitResult> {
    return this.checkCustom(
      "ip",
      ip,
      RATE_LIMIT_DEFAULTS.PER_IP.window,
      RATE_LIMIT_DEFAULTS.PER_IP.max,
    );
  }

  async checkCustom(
    key: string,
    identifier: string,
    window: number,
    max: number,
  ): Promise<RateLimitResult> {
    if (!getEnv().RATE_LIMIT_ENABLED) {
      return {
        allowed: true,
        remaining: max,
        reset: Math.floor(Date.now() / 1000) + window,
        retryAfter: 0,
        limit: max,
      };
    }

    const cacheKey = `ratelimit:${key}:${identifier}`;
    const { count, resetAt } = await this.getCount(cacheKey, window);
    const now = Math.floor(Date.now() / 1000);

    if (count >= max) {
      return {
        allowed: false,
        remaining: 0,
        reset: resetAt,
        retryAfter: Math.max(0, resetAt - now),
        limit: max,
      };
    }

    await redisService.set(
      cacheKey,
      { count: count + 1, resetAt },
      { ttl: window },
    );

    return {
      allowed: true,
      remaining: max - (count + 1),
      reset: resetAt,
      retryAfter: 0,
      limit: max,
    };
  }

  async getUsage(
    key: RateLimitKey,
    identifier: string,
  ): Promise<{ used: number; limit: number; reset: number }> {
    const config = RATE_LIMITS[key];
    const cacheKey = `ratelimit:${key}:${identifier}`;
    const data = await redisService.get<{ count: number; resetAt: number }>(
      cacheKey,
    );

    if (!data) {
      return {
        used: 0,
        limit: config.max,
        reset: Math.floor(Date.now() / 1000) + config.window,
      };
    }

    return {
      used: data.count,
      limit: config.max,
      reset: data.resetAt,
    };
  }

  async reset(key: RateLimitKey, identifier: string): Promise<void> {
    const cacheKey = `ratelimit:${key}:${identifier}`;
    await redisService.del(cacheKey);
  }

  async getRateLimitHealth(): Promise<{
    enabled: boolean;
    currentKeys: number;
    blockedIPs: number;
  }> {
    const keys =
      (await redisService.get<string[]>("ratelimit:keys:*" as any)) ?? [];
    const blockedIPs = keys.filter((k: string) => k.includes("ip:")).length;
    return {
      enabled: getEnv().RATE_LIMIT_ENABLED,
      currentKeys: keys.length,
      blockedIPs,
    };
  }
}

export const enhancedRateLimiter = new EnhancedRateLimiter();
export type { RateLimitResult, RateLimitKey };
