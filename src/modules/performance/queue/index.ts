import "server-only";
import {
  Queue,
  Worker,
  type Job,
  type JobsOptions,
  type QueueOptions,
} from "bullmq";
import { getRedisConnection, QUEUE_CONFIGS } from "./config";
import { QUEUE_NAMES } from "@/constants";
import { logger } from "@/lib/logger";
import { getEnv } from "@/validations/env";

interface QueueJobData {
  type: string;
  payload: Record<string, unknown>;
  metadata?: {
    userId?: string;
    ipAddress?: string;
    correlationId?: string;
    timestamp?: string;
  };
}

interface QueueResult {
  jobId: string;
  name: string;
  timestamp: Date;
}

type JobHandler = (job: Job<QueueJobData>) => Promise<void>;

class QueueService {
  private queues: Map<string, Queue<QueueJobData>> = new Map();
  private workers: Map<string, Worker<QueueJobData>> = new Map();
  private handlers: Map<string, JobHandler> = new Map();
  private connection: ReturnType<typeof getRedisConnection> | null = null;
  private initialized = false;

  initialize(): void {
    if (this.initialized) return;
    this.connection = getRedisConnection();
    if (!this.connection) {
      logger.warn("[Queue] Redis not available, queues disabled");
      return;
    }
    this.initialized = true;
    logger.info("[Queue] Service initialized");
  }

  private getQueue(name: string): Queue<QueueJobData> {
    if (!this.initialized) this.initialize();

    if (this.queues.has(name)) {
      return this.queues.get(name)!;
    }

    if (!this.connection) {
      throw new Error("Queue system not available (no Redis connection)");
    }

    const config = QUEUE_CONFIGS[name];
    const options: QueueOptions = {
      connection: this.connection,
      prefix: getEnv().BULLMQ_PREFIX,
      defaultJobOptions: {
        attempts: config.maxAttempts,
        backoff: {
          type: "exponential",
          delay: config.backoffDelay,
        },
        removeOnComplete: {
          count: config.removeOnComplete,
        },
        removeOnFail: {
          count: config.removeOnFail,
        },
      },
    };

    const queue = new Queue<QueueJobData>(name, options);
    this.queues.set(name, queue);
    return queue;
  }

  async enqueue(
    queueName: string,
    jobData: QueueJobData,
    options?: JobsOptions,
  ): Promise<QueueResult | null> {
    if (!this.initialized) this.initialize();
    if (!this.connection) {
      logger.warn("[Queue] Queue system unavailable, running inline", {
        queue: queueName,
        type: jobData.type,
      });
      await this.runInline(queueName, jobData);
      return null;
    }

    try {
      const queue = this.getQueue(queueName);
      const config = QUEUE_CONFIGS[queueName];
      const job = await queue.add(jobData.type, jobData, {
        priority:
          config.priority === "high" ? 1 : config.priority === "medium" ? 2 : 3,
        ...options,
      });

      logger.debug("[Queue] Job enqueued", {
        queue: queueName,
        jobId: job.id,
        type: jobData.type,
      });

      return {
        jobId: job.id ?? "unknown",
        name: jobData.type,
        timestamp: new Date(),
      };
    } catch (err) {
      logger.error("[Queue] Failed to enqueue job", err as Error, {
        queue: queueName,
        type: jobData.type,
      });
      await this.runInline(queueName, jobData);
      return null;
    }
  }

  registerHandler(queueName: string, handler: JobHandler): void {
    this.handlers.set(queueName, handler);

    if (!this.connection) return;

    const config = QUEUE_CONFIGS[queueName];

    const worker = new Worker<QueueJobData>(
      queueName,
      async (job) => {
        const handlerFn = this.handlers.get(queueName);
        if (!handlerFn) {
          logger.warn("[Queue] No handler registered for queue", {
            queue: queueName,
          });
          return;
        }
        logger.debug("[Queue] Processing job", {
          queue: queueName,
          jobId: job.id,
          type: job.data.type,
        });
        await handlerFn(job);
      },
      {
        connection: this.connection,
        prefix: getEnv().BULLMQ_PREFIX,
        concurrency: config.concurrency,
        maxStalledCount: config.maxStalledCount,
        stalledInterval: config.stalledInterval,
        lockDuration: config.stalledInterval,
        removeOnComplete: { count: config.removeOnComplete },
        removeOnFail: { count: config.removeOnFail },
      },
    );

    worker.on("completed", (job) => {
      logger.debug("[Queue] Job completed", {
        queue: queueName,
        jobId: job.id,
        type: job.data.type,
        duration:
          job.processedOn && job.finishedOn
            ? job.finishedOn - job.processedOn
            : undefined,
      });
    });

    worker.on("failed", (job, err) => {
      logger.error("[Queue] Job failed", err, {
        queue: queueName,
        jobId: job?.id,
        type: job?.data.type,
        attempts: job?.attemptsMade,
      });
    });

    worker.on("error", (err) => {
      logger.error("[Queue] Worker error", err, { queue: queueName });
    });

    this.workers.set(queueName, worker);
    logger.info("[Queue] Worker registered", {
      queue: queueName,
      concurrency: config.concurrency,
    });
  }

  registerAllHandlers(): void {
    for (const queueName of Object.values(QUEUE_NAMES)) {
      const handler = this.getDefaultHandler(queueName);
      if (handler) {
        this.registerHandler(queueName, handler);
      }
    }
  }

  private getDefaultHandler(queueName: string): JobHandler | null {
    const handlers: Record<string, JobHandler> = {
      [QUEUE_NAMES.EMAIL]: async (job) => {
        const { to, subject, html } = job.data.payload;
        const { sendEmail } = await import("@/services/email");
        await sendEmail({
          to: to as string,
          subject: subject as string,
          html: html as string,
        });
      },
      [QUEUE_NAMES.SEARCH_INDEX]: async (job) => {
        const { entityType, entityId, action } = job.data.payload;
        const { typesenseSyncService } = await import(
          "@/services/typesense-sync"
        );
        if (action === "BULK_SYNC") {
          await typesenseSyncService.bulkSync(entityType as any);
        } else {
          await typesenseSyncService.queueIndexJob(
            entityType as any,
            entityId as string,
            action as any,
          );
        }
      },
      [QUEUE_NAMES.NOTIFICATION]: async () => {},
      [QUEUE_NAMES.AI]: async () => {},
      [QUEUE_NAMES.ANALYTICS]: async () => {},
      [QUEUE_NAMES.MODERATION]: async () => {},
      [QUEUE_NAMES.MARKETPLACE]: async () => {},
      [QUEUE_NAMES.IMAGE_PROCESSING]: async () => {},
      [QUEUE_NAMES.LEADERBOARD]: async () => {},
      [QUEUE_NAMES.AGGREGATION]: async () => {},
      [QUEUE_NAMES.AUDIT_LOG]: async () => {},
      [QUEUE_NAMES.CLEANUP]: async () => {},
    };

    return handlers[queueName] ?? null;
  }

  private async runInline(
    queueName: string,
    jobData: QueueJobData,
  ): Promise<void> {
    const handler =
      this.handlers.get(queueName) || this.getDefaultHandler(queueName);
    if (handler) {
      try {
        const mockJob = {
          id: "inline",
          data: jobData,
          name: jobData.type,
          attemptsMade: 0,
          timestamp: Date.now(),
          processedOn: Date.now(),
          finishedOn: Date.now(),
          returnvalue: null,
          stacktrace: [],
          failedReason: null,
          opts: {},
          updateProgress: async () => {},
          log: async () => {},
          updateData: async () => {},
          toJSON: () => ({}),
        } as unknown as Job<QueueJobData>;
        await handler(mockJob);
      } catch (err) {
        logger.error("[Queue] Inline processing failed", err as Error, {
          queue: queueName,
          type: jobData.type,
        });
      }
    }
  }

  async getQueueMetrics(queueName: string): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: boolean;
  }> {
    if (!this.connection) {
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
        paused: false,
      };
    }
    try {
      const queue = this.getQueue(queueName);
      const [waiting, active, completed, failed, delayed, isPaused] =
        await Promise.all([
          queue.getWaitingCount(),
          queue.getActiveCount(),
          queue.getCompletedCount(),
          queue.getFailedCount(),
          queue.getDelayedCount(),
          queue.isPaused(),
        ]);
      return {
        waiting,
        active,
        completed,
        failed,
        delayed,
        paused: isPaused,
      };
    } catch {
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
        paused: false,
      };
    }
  }

  async getAllQueueMetrics(): Promise<
    Record<
      string,
      {
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        delayed: number;
        paused: boolean;
      }
    >
  > {
    const metrics: Record<string, any> = {};
    for (const name of Object.values(QUEUE_NAMES)) {
      metrics[name] = await this.getQueueMetrics(name);
    }
    return metrics;
  }

  async pauseQueue(queueName: string): Promise<void> {
    if (!this.connection) return;
    try {
      const queue = this.getQueue(queueName);
      await queue.pause();
      logger.info("[Queue] Queue paused", { queue: queueName });
    } catch (err) {
      logger.error("[Queue] Failed to pause queue", err as Error, {
        queue: queueName,
      });
    }
  }

  async resumeQueue(queueName: string): Promise<void> {
    if (!this.connection) return;
    try {
      const queue = this.getQueue(queueName);
      await queue.resume();
      logger.info("[Queue] Queue resumed", { queue: queueName });
    } catch (err) {
      logger.error("[Queue] Failed to resume queue", err as Error, {
        queue: queueName,
      });
    }
  }

  async close(): Promise<void> {
    for (const [name, worker] of this.workers) {
      await worker.close();
      logger.info("[Queue] Worker closed", { queue: name });
    }
    for (const [name, queue] of this.queues) {
      await queue.close();
      logger.info("[Queue] Queue closed", { queue: name });
    }
    this.queues.clear();
    this.workers.clear();
    this.initialized = false;
  }
}

export const queueService = new QueueService();
export { QUEUE_NAMES };
export type { QueueJobData, QueueResult };
