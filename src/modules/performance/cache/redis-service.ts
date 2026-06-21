import "server-only";
import { Redis, Cluster } from "ioredis";
import { getEnv } from "@/validations/env";
import { CACHE_TAGS, CACHE_TTL } from "@/constants";
import { logger } from "@/lib/logger";

type CacheValue = string | number | boolean | Record<string, unknown> | null;

interface CacheEntry<T> {
  value: T;
  tags: string[];
  cachedAt: number;
  ttl: number;
}

interface CacheOptions {
  ttl?: number;
  tags?: string[];
  skipCache?: boolean;
}

let _redis: Redis | Cluster | null = null;
let _enabled = true;

function getRedisClient(): Redis | Cluster {
  if (_redis) return _redis;

  const env = getEnv();

  if (!env.REDIS_URL) {
    _enabled = false;
    logger.warn("[Redis] No REDIS_URL configured, running without cache");
    _redis = null as unknown as Redis;
    return _redis;
  }

  if (env.REDIS_ENABLE_CLUSTER) {
    _redis = new Redis.Cluster([env.REDIS_URL], {
      redisOptions: {
        keyPrefix: env.REDIS_PREFIX,
        enableAutoPipelining: true,
        maxRetriesPerRequest: 3,
      },
    });
  } else {
    _redis = new Redis(env.REDIS_URL, {
      keyPrefix: env.REDIS_PREFIX,
      lazyConnect: true,
      enableAutoPipelining: true,
      retryStrategy: (times) => {
        if (times > env.REDIS_MAX_RETRIES) return null;
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableOfflineQueue: true,
    });
  }

  _redis.on("error", (err) => {
    logger.error("[Redis] Connection error", err as Error);
  });

  _redis.on("connect", () => {
    logger.info("[Redis] Connected");
  });

  _redis.on("close", () => {
    logger.warn("[Redis] Connection closed");
  });

  _redis.on("reconnecting", () => {
    logger.info("[Redis] Reconnecting");
  });

  return _redis;
}

export class RedisService {
  private client: Redis | Cluster;
  private prefix: string;

  constructor() {
    this.client = getRedisClient();
    this.prefix = getEnv().REDIS_PREFIX;
  }

  async connect(): Promise<void> {
    if (!_enabled || !this.client || this.client.status === "ready") return;
    if ("connect" in this.client && this.client.status === "wait") {
      try {
        await (this.client as Redis).connect();
      } catch {
        /* retry handled by ioredis */
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!_enabled) return null;
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (err) {
      logger.error("[Redis] Get failed", err as Error, { key });
      return null;
    }
  }

  async getWithTags<T>(
    key: string,
  ): Promise<{ value: T | null; tags: string[] } | null> {
    if (!_enabled) return null;
    try {
      const raw = await this.client.get(key);
      if (!raw) return null;
      const entry = JSON.parse(raw) as CacheEntry<T>;
      return { value: entry.value, tags: entry.tags };
    } catch {
      return null;
    }
  }

  async set(
    key: string,
    value: unknown,
    options?: CacheOptions | number,
  ): Promise<void> {
    if (!_enabled) return;
    try {
      let ttl: number | undefined;
      let tags: string[] = [];

      if (typeof options === "number") {
        ttl = options;
      } else if (options) {
        ttl = options.ttl;
        tags = options.tags ?? [];
      }

      if (tags.length > 0) {
        const entry: CacheEntry<unknown> = {
          value,
          tags,
          cachedAt: Date.now(),
          ttl: ttl ?? 0,
        };
        const serialized = JSON.stringify(entry);
        if (ttl) {
          await this.client.setex(key, ttl, serialized);
        } else {
          await this.client.set(key, serialized);
        }
        await this.tagKeys(tags, key);
      } else {
        const serialized = JSON.stringify(value);
        if (ttl) {
          await this.client.setex(key, ttl, serialized);
        } else {
          await this.client.set(key, serialized);
        }
      }
    } catch (err) {
      logger.error("[Redis] Set failed", err as Error, { key });
    }
  }

  async del(key: string): Promise<void> {
    if (!_enabled) return;
    try {
      await this.client.del(key);
    } catch {
      /* ignore */
    }
  }

  async delByTag(tag: string): Promise<void> {
    if (!_enabled) return;
    const tagKey = `tag:${tag}`;
    try {
      const keys = await this.client.smembers(tagKey);
      if (keys.length > 0) {
        await this.client.del(...keys, tagKey);
      }
    } catch {
      /* ignore */
    }
  }

  async invalidateTags(tags: string[]): Promise<void> {
    if (!_enabled || tags.length === 0) return;
    const pipeline = this.client.pipeline();
    for (const tag of tags) {
      const tagKey = `tag:${tag}`;
      pipeline.smembers(tagKey);
    }
    const results = await pipeline.exec();
    if (!results) return;
    const delPipeline = this.client.pipeline();
    for (let i = 0; i < tags.length; i++) {
      const result = results[i];
      if (
        result &&
        result[1] &&
        Array.isArray(result[1]) &&
        result[1].length > 0
      ) {
        const keys = result[1] as string[];
        delPipeline.del(...keys, `tag:${tags[i]}`);
      }
    }
    await delPipeline.exec();
  }

  async delPattern(pattern: string): Promise<void> {
    if (!_enabled) return;
    try {
      let cursor = "0";
      do {
        const result = await this.client.scan(
          cursor,
          "MATCH",
          pattern,
          "COUNT",
          100,
        );
        cursor = result[0];
        const keys = result[1];
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } while (cursor !== "0");
    } catch {
      /* ignore */
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!_enabled) return false;
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch {
      return false;
    }
  }

  async expire(key: string, seconds: number): Promise<void> {
    if (!_enabled) return;
    try {
      await this.client.expire(key, seconds);
    } catch {}
  }

  async ttl(key: string): Promise<number> {
    if (!_enabled) return -2;
    try {
      return await this.client.ttl(key);
    } catch {
      return -2;
    }
  }

  async incr(key: string): Promise<number> {
    if (!_enabled) return 0;
    try {
      return await this.client.incr(key);
    } catch {
      return 0;
    }
  }

  async incrby(key: string, amount: number): Promise<number> {
    if (!_enabled) return 0;
    try {
      return await this.client.incrby(key, amount);
    } catch {
      return 0;
    }
  }

  async publish(channel: string, message: unknown): Promise<void> {
    if (!_enabled) return;
    try {
      await this.client.publish(channel, JSON.stringify(message));
    } catch {}
  }

  async subscribe(
    channel: string,
    callback: (message: string) => void,
  ): Promise<void> {
    if (!_enabled) return;
    try {
      const subClient = this.client.duplicate();
      await subClient.subscribe(channel);
      subClient.on("message", (_ch: string, message: string) => {
        callback(message);
      });
    } catch {}
  }

  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    if (options?.skipCache || !_enabled) {
      return fetchFn();
    }

    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetchFn();
    await this.set(key, value, options);
    return value;
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    if (!_enabled || keys.length === 0) return keys.map(() => null);
    try {
      const values = await this.client.mget(keys);
      return values.map((v) => {
        if (!v) return null;
        try {
          return JSON.parse(v) as T;
        } catch {
          return null;
        }
      });
    } catch {
      return keys.map(() => null);
    }
  }

  async mset(
    entries: Record<string, unknown>,
    ttlSeconds?: number,
  ): Promise<void> {
    if (!_enabled) return;
    try {
      const pipeline = this.client.pipeline();
      for (const [key, value] of Object.entries(entries)) {
        const serialized = JSON.stringify(value);
        if (ttlSeconds) {
          pipeline.setex(key, ttlSeconds, serialized);
        } else {
          pipeline.set(key, serialized);
        }
      }
      await pipeline.exec();
    } catch {}
  }

  private async tagKeys(tags: string[], key: string): Promise<void> {
    const pipeline = this.client.pipeline();
    for (const tag of tags) {
      pipeline.sadd(`tag:${tag}`, key);
    }
    await pipeline.exec();
  }

  async getCacheHealth(): Promise<{
    connected: boolean;
    hitRate: number;
    memoryUsage: string;
    uptime: number;
  }> {
    if (!_enabled || !this.client) {
      return { connected: false, hitRate: 0, memoryUsage: "0", uptime: 0 };
    }
    try {
      const info = await this.client.info("stats");
      const mem = await this.client.info("memory");
      const server = await this.client.info("server");
      const keyspaceHits = parseInt(
        info?.match(/keyspace_hits:(\d+)/)?.[1] ?? "0",
      );
      const keyspaceMisses = parseInt(
        info?.match(/keyspace_misses:(\d+)/)?.[1] ?? "0",
      );
      const total = keyspaceHits + keyspaceMisses;
      const hitRate = total > 0 ? keyspaceHits / total : 0;
      const usedMemory = mem?.match(/used_memory_human:([^\r\n]+)/)?.[1] ?? "0";
      const uptime = parseInt(
        server?.match(/uptime_in_seconds:(\d+)/)?.[1] ?? "0",
      );
      return {
        connected: this.client.status === "ready",
        hitRate,
        memoryUsage: usedMemory,
        uptime,
      };
    } catch {
      return { connected: false, hitRate: 0, memoryUsage: "0", uptime: 0 };
    }
  }

  async flush(pattern?: string): Promise<void> {
    if (!_enabled) return;
    if (pattern) {
      await this.delPattern(pattern);
    } else {
      await this.client.flushdb();
    }
  }

  async quit(): Promise<void> {
    if (_redis) {
      _redis.removeAllListeners();
      await _redis.quit().catch(() => {});
      _redis = null;
    }
  }
}

export const redisService = new RedisService();
