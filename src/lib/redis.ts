import "server-only";

import { Redis } from "ioredis";
import { getEnv } from "@/validations/env";

let _redis: Redis | null = null;

function getRedisClient(): Redis {
  if (_redis) return _redis;

  const env = getEnv();

  _redis = new Redis(env.REDIS_URL, {
    keyPrefix: env.REDIS_PREFIX,
    lazyConnect: true,
    enableAutoPipelining: true,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
  });

  _redis.on("error", (err) => {
    console.error("[Redis] Connection error:", err);
  });

  _redis.on("connect", () => {
    console.log("[Redis] Connected");
  });

  return _redis;
}

export class RedisCache {
  private client: Redis;

  constructor() {
    this.client = getRedisClient();
  }

  async connect(): Promise<void> {
    if (this.client.status === "wait") {
      await this.client.connect();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error("[Redis] Get error:", error);
      return null;
    }
  }

  async set(
    key: string,
    value: unknown,
    ttlSeconds?: number,
  ): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (error) {
      console.error("[Redis] Set error:", error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error("[Redis] Del error:", error);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      console.error("[Redis] DelPattern error:", error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch {
      return false;
    }
  }

  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.client.expire(key, seconds);
    } catch (error) {
      console.error("[Redis] Expire error:", error);
    }
  }

  async publish(channel: string, message: unknown): Promise<void> {
    try {
      await this.client.publish(channel, JSON.stringify(message));
    } catch (error) {
      console.error("[Redis] Publish error:", error);
    }
  }

  async quit(): Promise<void> {
    if (_redis) {
      await _redis.quit();
      _redis = null;
    }
  }
}

export const cache = new RedisCache();
