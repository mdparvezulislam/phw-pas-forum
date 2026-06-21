import "server-only";

import { getDatabase } from "@/db";
import { cache } from "@/lib/redis";
import { search } from "@/lib/typesense";
import { storage } from "@/lib/r2";
import { openRouterBreaker } from "@/modules/infrastructure/availability/circuit-breaker";
import { sql } from "drizzle-orm";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getEnv } from "@/validations/env";

export interface HealthCheckReport {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  details: Record<
    string,
    { status: "up" | "down" | "degraded"; latencyMs: number; error?: string }
  >;
}

export class HealthService {
  /**
   * Check PostgreSQL connectivity
   */
  async checkDatabase(): Promise<{
    status: "up" | "down";
    latencyMs: number;
    error?: string;
  }> {
    const start = Date.now();
    try {
      const db = getDatabase();
      await db.execute(sql`SELECT 1`);
      return { status: "up", latencyMs: Date.now() - start };
    } catch (error: any) {
      return {
        status: "down",
        latencyMs: Date.now() - start,
        error: error.message || String(error),
      };
    }
  }

  /**
   * Check Redis connectivity
   */
  async checkRedis(): Promise<{
    status: "up" | "down";
    latencyMs: number;
    error?: string;
  }> {
    const start = Date.now();
    try {
      await cache.connect();
      const client = (cache as any).client;
      if (!client || (cache as any)._enabled === false) {
        throw new Error("Redis is disabled or not initialized");
      }
      await client.ping();
      return { status: "up", latencyMs: Date.now() - start };
    } catch (error: any) {
      return {
        status: "down",
        latencyMs: Date.now() - start,
        error: error.message || String(error),
      };
    }
  }

  /**
   * Check Typesense Search connectivity
   */
  async checkSearch(): Promise<{
    status: "up" | "down";
    latencyMs: number;
    error?: string;
  }> {
    const start = Date.now();
    try {
      const isOperational = await search.health();
      if (!isOperational) {
        throw new Error("Typesense health retrieve returned false");
      }
      return { status: "up", latencyMs: Date.now() - start };
    } catch (error: any) {
      return {
        status: "down",
        latencyMs: Date.now() - start,
        error: error.message || String(error),
      };
    }
  }

  /**
   * Check Cloudflare R2 Storage connectivity
   */
  async checkStorage(): Promise<{
    status: "up" | "down";
    latencyMs: number;
    error?: string;
  }> {
    const start = Date.now();
    try {
      const client = (storage as any).client;
      const bucket = getEnv().R2_BUCKET_NAME;
      // Perform a light-weight list command to check bucket access
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        MaxKeys: 1,
      });
      await client.send(command);
      return { status: "up", latencyMs: Date.now() - start };
    } catch (error: any) {
      return {
        status: "down",
        latencyMs: Date.now() - start,
        error: error.message || String(error),
      };
    }
  }

  /**
   * Check AI Provider circuit breaker status
   */
  async checkAI(): Promise<{
    status: "up" | "down" | "degraded";
    latencyMs: number;
  }> {
    const start = Date.now();
    const state = await openRouterBreaker.getState();
    const latencyMs = Date.now() - start;

    if (state === "OPEN") {
      return { status: "down", latencyMs };
    }
    if (state === "HALF_OPEN") {
      return { status: "degraded", latencyMs };
    }
    return { status: "up", latencyMs };
  }

  /**
   * Generate a comprehensive system health report
   */
  async getFullHealth(): Promise<HealthCheckReport> {
    const [db, redis, searchStat, store, ai] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkSearch(),
      this.checkStorage(),
      this.checkAI(),
    ]);

    const details = { db, redis, search: searchStat, storage: store, ai };

    // Overall status calculations
    const states = [db.status, redis.status, searchStat.status, store.status];

    let status: "healthy" | "unhealthy" | "degraded" = "healthy";
    if (states.includes("down")) {
      status = "unhealthy";
    } else if (ai.status === "down" || ai.status === "degraded") {
      status = "degraded";
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      details,
    };
  }
}

export const healthService = new HealthService();
export default healthService;
