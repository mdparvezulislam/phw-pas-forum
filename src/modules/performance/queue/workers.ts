import "server-only";
import { queueService } from "./index";
import { QUEUE_NAMES } from "@/constants";
import { logger } from "@/lib/logger";

class QueueWorkerManager {
  private initialized = false;

  initialize(): void {
    if (this.initialized) return;

    queueService.registerAllHandlers();
    this.initialized = true;

    logger.info("[QueueWorker] All workers registered");
  }

  initializeSpecific(queues: string[]): void {
    for (const queueName of queues) {
      const handler = this.getHandlerForQueue(queueName);
      if (handler) {
        queueService.registerHandler(queueName, handler);
      }
    }
    logger.info("[QueueWorker] Specific workers initialized", { queues });
  }

  private getHandlerForQueue(queueName: string) {
    const handlers: Record<string, () => Promise<void>> = {
      [QUEUE_NAMES.LEADERBOARD]: async () => {
        const { leaderboardService } = await import("@/services/leaderboard");
        await (leaderboardService as any).recalculateAll?.();
      },
      [QUEUE_NAMES.SEARCH_INDEX]: async () => {
        const { typesenseSyncService } = await import(
          "@/services/typesense-sync"
        );
        await typesenseSyncService.processQueue();
      },
      [QUEUE_NAMES.IMAGE_PROCESSING]: async () => {
        const { mediaOptimizationService } = await import(
          "@/modules/performance/media"
        );
        await mediaOptimizationService.processPendingQueue();
      },
      [QUEUE_NAMES.CLEANUP]: async () => {
        const db = (await import("@/db")).getDatabase();
        const schema = (await import("@/db")).schema;
        const { and, lt } = await import("drizzle-orm");
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        await db
          .delete(schema.searchQueries)
          .where(lt(schema.searchQueries.searchedAt, thirtyDaysAgo));
        await db
          .delete(schema.searchHistories)
          .where(lt(schema.searchHistories.searchedAt, thirtyDaysAgo));
        await db
          .delete(schema.auditLogs)
          .where(
            lt(
              schema.auditLogs.createdAt,
              new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            ),
          );

        logger.info("[QueueWorker] Cleanup completed");
      },
    };

    if (handlers[queueName]) {
      return async () => {
        try {
          await handlers[queueName]();
        } catch (err) {
          logger.error("[QueueWorker] Handler failed", err as Error, {
            queue: queueName,
          });
        }
      };
    }

    return null;
  }

  async warmup(): Promise<void> {
    const { typesenseSyncService } = await import("@/services/typesense-sync");
    try {
      await typesenseSyncService.initializeCollections();
      const { redisService } = await import(
        "@/modules/performance/cache/redis-service"
      );
      await redisService.connect();
    } catch (err) {
      logger.warn("[QueueWorker] Warmup failed", {
        error: (err as Error).message,
      });
    }
  }
}

export const queueWorkerManager = new QueueWorkerManager();
