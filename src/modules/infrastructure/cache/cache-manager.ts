import "server-only";

import { cache as redisCache } from "@/lib/redis";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<any>>();

  set<T>(key: string, value: T, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  del(key: string): void {
    this.store.delete(key);
  }

  delPattern(pattern: string): void {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }

  clear(): void {
    this.store.clear();
  }
}

export class CacheManager {
  private l1 = new MemoryCache();
  private l2 = redisCache;

  /**
   * Get an item from cache, or retrieve from database and cache it if not found.
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds = 300,
  ): Promise<T> {
    // 1. Try L1 (Memory)
    const l1Value = this.l1.get<T>(key);
    if (l1Value !== null) {
      return l1Value;
    }

    // 2. Try L2 (Redis)
    await this.l2.connect();
    const l2Value = await this.l2.get<T>(key);
    if (l2Value !== null) {
      // Backfill L1
      this.l1.set(key, l2Value, Math.min(ttlSeconds, 60)); // Keep L1 short-lived (e.g. max 1 min)
      return l2Value;
    }

    // 3. Fallback to L3 (Database/Fetch function)
    const dbValue = await fetchFn();

    // Cache the retrieved value in L1 and L2
    if (dbValue !== undefined && dbValue !== null) {
      this.l1.set(key, dbValue, Math.min(ttlSeconds, 60));
      await this.l2.set(key, dbValue, ttlSeconds);
    }

    return dbValue;
  }

  /**
   * Set value in all cache layers.
   */
  async set<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
    this.l1.set(key, value, Math.min(ttlSeconds, 60));
    await this.l2.connect();
    await this.l2.set(key, value, ttlSeconds);
  }

  /**
   * Invalidate cache for a specific key across all layers.
   */
  async invalidate(key: string): Promise<void> {
    this.l1.del(key);
    await this.l2.connect();
    await this.l2.del(key);
  }

  /**
   * Invalidate cache matching a specific prefix or pattern (e.g. "thread:123:*").
   */
  async invalidatePattern(pattern: string): Promise<void> {
    this.l1.delPattern(pattern);
    await this.l2.connect();
    await this.l2.delPattern(pattern);
  }

  /**
   * Clear all L1 memory cache entries.
   */
  clearMemoryCache(): void {
    this.l1.clear();
  }
}

export const cacheManager = new CacheManager();
export default cacheManager;
