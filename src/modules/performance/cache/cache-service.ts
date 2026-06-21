import "server-only";
import { redisService } from "./redis-service";
import { cacheInvalidator } from "./cache-invalidation";
import { CACHE_TAGS, CACHE_TTL } from "@/constants";
import { logger } from "@/lib/logger";

type CacheLevel = "memory" | "redis" | "none";

interface CacheResult<T> {
  value: T;
  fromCache: boolean;
  cacheLevel: CacheLevel;
  cacheTime?: number;
}

interface CachePolicy {
  ttl: number;
  tags: string[];
  staleWhileRevalidate?: boolean;
  compress?: boolean;
}

const CACHE_POLICIES: Record<string, CachePolicy> = {
  userProfile: {
    ttl: CACHE_TTL.USER_PROFILE,
    tags: [CACHE_TAGS.USER],
  },
  userPermissions: {
    ttl: CACHE_TTL.USER_PERMISSIONS,
    tags: [CACHE_TAGS.USER, CACHE_TAGS.PERMISSION],
  },
  userMembership: {
    ttl: CACHE_TTL.USER_MEMBERSHIP,
    tags: [CACHE_TAGS.USER, CACHE_TAGS.MEMBERSHIP],
  },
  forumTree: {
    ttl: CACHE_TTL.FORUM_TREE,
    tags: [CACHE_TAGS.FORUM, CACHE_TAGS.CATEGORY],
    staleWhileRevalidate: true,
  },
  threadListing: {
    ttl: CACHE_TTL.THREAD_LISTING,
    tags: [CACHE_TAGS.THREAD, CACHE_TAGS.FORUM],
    staleWhileRevalidate: true,
  },
  threadDetail: {
    ttl: CACHE_TTL.THREAD_DETAIL,
    tags: [CACHE_TAGS.THREAD],
  },
  postListing: {
    ttl: CACHE_TTL.POST_LISTING,
    tags: [CACHE_TAGS.POST, CACHE_TAGS.THREAD],
  },
  trendingThreads: {
    ttl: CACHE_TTL.TRENDING_THREADS,
    tags: [CACHE_TAGS.TRENDING, CACHE_TAGS.THREAD],
    staleWhileRevalidate: true,
  },
  marketplaceListings: {
    ttl: CACHE_TTL.MARKETPLACE_LISTING,
    tags: [CACHE_TAGS.MARKETPLACE, CACHE_TAGS.LISTING],
    staleWhileRevalidate: true,
  },
  leaderboard: {
    ttl: CACHE_TTL.LEADERBOARD,
    tags: [CACHE_TAGS.LEADERBOARD, CACHE_TAGS.USER],
    staleWhileRevalidate: true,
  },
  badges: {
    ttl: CACHE_TTL.BADGES,
    tags: [CACHE_TAGS.BADGE],
    staleWhileRevalidate: true,
  },
  trophies: {
    ttl: CACHE_TTL.TROPHIES,
    tags: [CACHE_TAGS.TROPHY],
    staleWhileRevalidate: true,
  },
  notificationCount: {
    ttl: CACHE_TTL.NOTIFICATION_COUNT,
    tags: [CACHE_TAGS.NOTIFICATION, CACHE_TAGS.USER],
  },
  searchSuggestions: {
    ttl: CACHE_TTL.SEARCH_SUGGESTIONS,
    tags: [CACHE_TAGS.SEARCH],
  },
  aiResponse: {
    ttl: CACHE_TTL.AI_RESPONSE,
    tags: [CACHE_TAGS.AI],
    compress: true,
  },
  systemSettings: {
    ttl: CACHE_TTL.SYSTEM_SETTINGS,
    tags: [CACHE_TAGS.SETTINGS],
    staleWhileRevalidate: true,
  },
  recommendations: {
    ttl: CACHE_TTL.RECOMMENDATIONS,
    tags: [CACHE_TAGS.TRENDING],
    staleWhileRevalidate: true,
  },
};

export class CacheService {
  async getOrFetch<T>(
    policyName: string,
    key: string,
    fetchFn: () => Promise<T>,
    overrides?: Partial<CachePolicy>,
  ): Promise<CacheResult<T>> {
    const policy = CACHE_POLICIES[policyName];
    if (!policy) {
      const value = await fetchFn();
      return { value, fromCache: false, cacheLevel: "none" };
    }

    const ttl = overrides?.ttl ?? policy.ttl;
    const tags = overrides?.tags ?? policy.tags;

    const cached = await redisService.getWithTags<T>(key);
    if (cached !== null && cached.value !== null) {
      return {
        value: cached.value,
        fromCache: true,
        cacheLevel: "redis",
      };
    }

    if (policy.staleWhileRevalidate) {
      const stale = await redisService.get<T>(`stale:${key}`);
      if (stale !== null) {
        this.fetchAndCache(key, fetchFn, ttl, tags).catch(() => {});
        return {
          value: stale,
          fromCache: true,
          cacheLevel: "redis",
          cacheTime: undefined,
        };
      }
    }

    const startTime = performance.now();
    const value = await fetchFn();
    const fetchTime = performance.now() - startTime;

    await redisService.set(key, value, { ttl, tags });

    if (policy.staleWhileRevalidate) {
      await redisService.set(`stale:${key}`, value, { ttl: ttl * 2 });
    }

    logger.debug("[Cache] Miss - fetched and cached", {
      policyName,
      key: key.substring(0, 80),
      fetchTimeMs: Math.round(fetchTime),
      ttl,
    });

    return { value, fromCache: false, cacheLevel: "none" };
  }

  private async fetchAndCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number,
    tags: string[],
  ): Promise<void> {
    try {
      const value = await fetchFn();
      await redisService.set(key, value, { ttl, tags });
    } catch (err) {
      logger.error("[Cache] Stale revalidation failed", err as Error, { key });
    }
  }

  async invalidate(...tags: string[]): Promise<void> {
    await cacheInvalidator.invalidate(...tags);
  }

  async invalidatePolicy(policyName: string): Promise<void> {
    const policy = CACHE_POLICIES[policyName];
    if (policy) {
      await cacheInvalidator.invalidate(...policy.tags);
    }
  }

  async clearAll(): Promise<void> {
    await redisService.flush();
  }

  async clearPattern(pattern: string): Promise<void> {
    await redisService.delPattern(pattern);
  }

  async warmCache<T>(
    entries: Array<{
      key: string;
      fetchFn: () => Promise<T>;
      policyName?: string;
    }>,
  ): Promise<void> {
    const results = await Promise.allSettled(
      entries.map(async ({ key, fetchFn, policyName }) => {
        const policy = policyName ? CACHE_POLICIES[policyName] : undefined;
        const value = await fetchFn();
        if (policy) {
          await redisService.set(key, value, {
            ttl: policy.ttl,
            tags: policy.tags,
          });
        } else {
          await redisService.set(key, value, { ttl: CACHE_TTL.STATIC_CONTENT });
        }
      }),
    );

    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length > 0) {
      logger.warn("[Cache] Warm cache had failures", {
        total: entries.length,
        failures: failures.length,
      });
    }
  }

  registerPolicy(name: string, policy: CachePolicy): void {
    CACHE_POLICIES[name] = policy;
  }

  getHealth() {
    return redisService.getCacheHealth();
  }
}

export const cacheService = new CacheService();
