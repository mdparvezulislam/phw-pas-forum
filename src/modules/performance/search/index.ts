import "server-only";
import { COLLECTIONS } from "@/services/typesense-sync";
import { redisService } from "@/modules/performance/cache/redis-service";
import { QUEUE_NAMES } from "@/constants";
import { queueService } from "@/modules/performance/queue";
import { logger } from "@/lib/logger";
import { search as typesenseSearchClient } from "@/lib/typesense";

interface SearchIndexMetrics {
  collectionName: string;
  documentCount: number;
  fallbackSearchEnabled: boolean;
  lastSyncAt: string | null;
}

interface IndexingJob {
  entityType: string;
  entityId: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  priority: number;
}

export class SearchOptimizationService {
  async getCollectionMetrics(): Promise<SearchIndexMetrics[]> {
    const collectionNames = Object.values(COLLECTIONS);
    const metrics: SearchIndexMetrics[] = [];

    for (const name of collectionNames) {
      try {
        const result = await (typesenseSearchClient as any)
          .collections(name)
          .retrieve();
        metrics.push({
          collectionName: name,
          documentCount: result.num_documents ?? 0,
          fallbackSearchEnabled: false,
          lastSyncAt: await redisService.get<string>(
            `search:last_sync:${name}`,
          ),
        });
      } catch {
        metrics.push({
          collectionName: name,
          documentCount: 0,
          fallbackSearchEnabled: false,
          lastSyncAt: null,
        });
      }
    }

    return metrics;
  }

  async enqueueIndexJob(job: IndexingJob): Promise<void> {
    await queueService.enqueue(
      QUEUE_NAMES.SEARCH_INDEX,
      {
        type: job.action,
        payload: {
          entityType: job.entityType,
          entityId: job.entityId,
          action: job.action,
        },
      },
      {
        priority: job.priority,
        attempts: 5,
      },
    );
  }

  async batchIndex(
    entityType: string,
    ids: string[],
    action: "CREATE" | "UPDATE" | "DELETE",
  ): Promise<void> {
    const batchSize = 50;
    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      await Promise.all(
        batch.map((id) =>
          this.enqueueIndexJob({
            entityType,
            entityId: id,
            action,
            priority: 2,
          }),
        ),
      );
    }
    logger.info("[SearchOptimization] Batch index queued", {
      entityType,
      totalIds: ids.length,
      action,
    });
  }

  async triggerBulkSync(entityType: string): Promise<void> {
    await queueService.enqueue(
      QUEUE_NAMES.SEARCH_INDEX,
      {
        type: "BULK_SYNC",
        payload: {
          entityType,
          entityId: "",
          action: "BULK_SYNC",
        },
      },
      {
        priority: 1,
        attempts: 2,
      },
    );
    logger.info("[SearchOptimization] Bulk sync triggered", { entityType });
  }

  async getFailedJobs(limit = 100): Promise<any[]> {
    const db = (await import("@/db")).getDatabase();
    const schema = (await import("@/db")).schema;
    const { eq } = await import("drizzle-orm");

    return db.query.searchIndexJobs.findMany({
      where: eq(schema.searchIndexJobs.status, "FAILED"),
      orderBy: (jobs: any, { desc }: any) => [desc(jobs.createdAt)],
      limit,
    });
  }

  async retryFailedJobs(): Promise<number> {
    const db = (await import("@/db")).getDatabase();
    const schema = (await import("@/db")).schema;
    const { eq } = await import("drizzle-orm");

    const failedJobs = await db
      .update(schema.searchIndexJobs)
      .set({ status: "PENDING", attempts: 0, lastError: null })
      .where(eq(schema.searchIndexJobs.status, "FAILED"))
      .returning();

    return failedJobs.length;
  }

  async cleanupOldJobs(daysToKeep = 7): Promise<number> {
    const db = (await import("@/db")).getDatabase();
    const schema = (await import("@/db")).schema;
    const { lt } = await import("drizzle-orm");

    const cutoff = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    const result = await db
      .delete(schema.searchIndexJobs)
      .where(lt(schema.searchIndexJobs.createdAt, cutoff));

    return result.length ?? 0;
  }

  async updateSearchConfiguration(): Promise<void> {
    const collectionNames = Object.values(COLLECTIONS);
    for (const name of collectionNames) {
      try {
        await (typesenseSearchClient as any).collections(name).update({
          token_separators: ["-", "_", "@", "."],
          enable_nested_fields: true,
        });
      } catch {
        /* ignore */
      }
    }
  }
}

export const searchOptimizationService = new SearchOptimizationService();
