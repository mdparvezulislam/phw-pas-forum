import "server-only";

import { search as searchClient } from "@/lib/typesense";
import { getDatabase, schema } from "@/db";
import { sql } from "drizzle-orm";

export interface SearchHealthMetrics {
  isOperational: boolean;
  latencyMs: number;
  pendingJobs: number;
  failedJobs: number;
}

export class SearchMonitor {
  /**
   * Run diagnostic health checks on search client
   */
  async getMetrics(): Promise<SearchHealthMetrics> {
    const startTime = Date.now();
    let isOperational = false;
    let latencyMs = 0;

    try {
      isOperational = await searchClient.health();
      latencyMs = Date.now() - startTime;
    } catch (error) {
      isOperational = false;
      latencyMs = Date.now() - startTime;
    }

    // Check DB indexing queue status
    let pendingJobs = 0;
    let failedJobs = 0;

    try {
      const db = getDatabase();
      const stats = await db
        .select({
          status: schema.searchIndexJobs.status,
          count: sql<number>`count(*)::int`,
        })
        .from(schema.searchIndexJobs)
        .groupBy(schema.searchIndexJobs.status);

      for (const row of stats) {
        if (row.status === "PENDING" || row.status === "PROCESSING") {
          pendingJobs += row.count;
        } else if (row.status === "FAILED") {
          failedJobs += row.count;
        }
      }
    } catch {
      // DB check fail
    }

    return {
      isOperational,
      latencyMs,
      pendingJobs,
      failedJobs,
    };
  }
}

export const searchMonitor = new SearchMonitor();
export default searchMonitor;
