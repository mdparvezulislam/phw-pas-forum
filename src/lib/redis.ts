import "server-only";

import { Redis } from "ioredis";
import { getEnv } from "@/validations/env";

let _redis: Redis | null = null;
let _enabled = true;

function createNoopClient(): Redis {
  const dummy = new Redis();
  dummy.disconnect();
  return dummy;
}

function getRedisClient(): Redis {
  if (_redis) return _redis;

  const env = getEnv();

  if (!env.REDIS_URL) {
    _enabled = false;
    _redis = createNoopClient();
    return _redis;
  }

  _redis = new Redis(env.REDIS_URL, {
    keyPrefix: env.REDIS_PREFIX,
    lazyConnect: true,
    enableAutoPipelining: true,
    retryStrategy: (times) => {
      if (times > 10) return null;
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
  });

  _redis.on("error", () => {
    /* silently ignore - handled by method-level try/catch */
  });

  _redis.on("connect", () => {
    console.log("[Redis] Connected");
  });

  return _redis;
}

class NoopCache {
  async connect(): Promise<void> {}
  async get<T>(): Promise<T | null> {
    return null;
  }
  async set(): Promise<void> {}
  async del(): Promise<void> {}
  async delPattern(): Promise<void> {}
  async exists(): Promise<boolean> {
    return false;
  }
  async expire(): Promise<void> {}
  async publish(): Promise<void> {}
  async quit(): Promise<void> {}
}

export class RedisCache {
  private client: Redis;

  constructor() {
    this.client = getRedisClient();
  }

  async connect(): Promise<void> {
    if (!_enabled) return;
    if (this.client.status === "wait") {
      try {
        await this.client.connect();
      } catch {
        /* ignore */
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!_enabled) return null;
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    if (!_enabled) return;
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch {
      /* ignore */
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

  async delPattern(pattern: string): Promise<void> {
    if (!_enabled) return;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
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
    } catch {
      /* ignore */
    }
  }

  async publish(channel: string, message: unknown): Promise<void> {
    if (!_enabled) return;
    try {
      await this.client.publish(channel, JSON.stringify(message));
    } catch {
      /* ignore */
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

export const cache = new RedisCache();
