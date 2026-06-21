import "server-only";

import { getDatabase, schema } from "@/db";
import {
  queueManager,
  QUEUES,
} from "@/modules/infrastructure/queue/queue-manager";
import { typesenseSyncService } from "@/services/typesense-sync";
import { eq } from "drizzle-orm";

export class SearchManager {
  /**
   * Initialize BullMQ worker for search index jobs
   */
  initializeWorker(): void {
    queueManager.registerWorker(QUEUES.SEARCH, async (job) => {
      const { entityType, entityId, action } = job.data as {
        entityType: any;
        entityId: string;
        action: "CREATE" | "UPDATE" | "DELETE";
      };

      console.log(
        `[SearchQueue] Processing ${action} for ${entityType} ID: ${entityId}`,
      );

      const collection = (typesenseSyncService as any).getCollectionName(
        entityType,
      );

      if (action === "DELETE") {
        await (typesenseSyncService as any).client.deleteDocument(
          collection,
          entityId,
        );
      } else {
        const doc = await (typesenseSyncService as any).buildDocument(
          entityType,
          entityId,
        );
        if (doc) {
          await (typesenseSyncService as any).client.indexDocument(
            collection,
            doc,
          );
        }
      }
    });
  }

  /**
   * Queue a search indexing job via BullMQ
   */
  async queueSync(
    entityType: string,
    entityId: string,
    action: "CREATE" | "UPDATE" | "DELETE",
  ): Promise<void> {
    await queueManager.addJob(QUEUES.SEARCH, `sync-${entityType}-${entityId}`, {
      entityType,
      entityId,
      action,
    });
  }

  /**
   * Index recovery: Re-sync all pending / failed jobs from searchIndexJobs DB table
   */
  async recoverIndexJobs(): Promise<{ recoveredCount: number }> {
    const db = getDatabase();
    const failedJobs = await db.query.searchIndexJobs.findMany({
      where: eq(schema.searchIndexJobs.status, "FAILED"),
      limit: 100,
    });

    for (const job of failedJobs) {
      await this.queueSync(job.entityType, job.entityId, job.action);

      // Update DB status to QUEUED
      await db
        .update(schema.searchIndexJobs)
        .set({ status: "PROCESSING", processedAt: new Date() })
        .where(eq(schema.searchIndexJobs.id, job.id));
    }

    return { recoveredCount: failedJobs.length };
  }
}

export const searchManager = new SearchManager();
export default searchManager;
