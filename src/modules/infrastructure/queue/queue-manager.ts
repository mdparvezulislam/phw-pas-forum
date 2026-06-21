import "server-only";

import { getEnv } from "@/validations/env";
import { Queue, Worker, type Job, type QueueOptions } from "bullmq";
import { Redis } from "ioredis";

// Queue names
export const QUEUES = {
  EMAIL: "email-queue",
  NOTIFICATION: "notification-queue",
  SEARCH: "search-queue",
  AI: "ai-queue",
  MODERATION: "moderation-queue",
  MARKETPLACE: "marketplace-queue",
  ANALYTICS: "analytics-queue",
  MEDIA: "media-queue",
  BACKUP: "backup-queue",
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

let _redisConnection: Redis | null = null;
let _queues: Record<string, Queue> = {};
let _workers: Record<string, Worker> = {};

function getRedisConnection(): Redis {
  if (_redisConnection) return _redisConnection;

  const env = getEnv();
  const url = env.BULLMQ_REDIS_URL || env.REDIS_URL;

  if (!url) {
    throw new Error(
      "[QueueManager] REDIS_URL or BULLMQ_REDIS_URL is required for BullMQ",
    );
  }

  _redisConnection = new Redis(url, {
    maxRetriesPerRequest: null, // Required by BullMQ
  });

  return _redisConnection;
}

export class QueueManager {
  /**
   * Get or create a BullMQ Queue instance
   */
  getQueue(name: QueueName): Queue {
    if (_queues[name]) return _queues[name];

    const connection = getRedisConnection();
    const env = getEnv();

    const queueOptions: QueueOptions = {
      connection: connection as any,
      prefix: env.BULLMQ_PREFIX,
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: "exponential",
          delay: 2000, // Starts at 2s, then 4s, 8s, 16s, 32s
        },
        removeOnComplete: { age: 3600 * 24 }, // Keep completed jobs for 24h
        removeOnFail: { age: 3600 * 24 * 7 }, // Keep failed jobs for 7 days (DLQ)
      },
    };

    const queue = new Queue(name, queueOptions);
    _queues[name] = queue;
    return queue;
  }

  /**
   * Add a job to a specific queue
   */
  async addJob<T = any>(
    queueName: QueueName,
    jobName: string,
    data: T,
    options: { delay?: number; priority?: number } = {},
  ): Promise<Job> {
    const queue = this.getQueue(queueName);
    return queue.add(jobName, data, {
      delay: options.delay,
      priority: options.priority,
    });
  }

  /**
   * Register a worker for a queue
   */
  registerWorker<T = any>(
    queueName: QueueName,
    processor: (job: Job<T>) => Promise<any>,
  ): Worker {
    if (_workers[queueName]) return _workers[queueName];

    const connection = getRedisConnection();
    const env = getEnv();

    const worker = new Worker(
      queueName,
      async (job) => {
        try {
          return await processor(job);
        } catch (error: any) {
          // Log inside processor to trigger DLQ logic
          console.error(
            `[QueueWorker] Job ${job.id} failed in queue ${queueName}:`,
            error,
          );
          throw error;
        }
      },
      {
        connection: connection as any,
        prefix: env.BULLMQ_PREFIX,
        concurrency: 5,
      },
    );

    // DLQ Architecture: Handle failed events
    worker.on("failed", async (job: Job | undefined, error: Error) => {
      if (!job) return;
      await this.handleDeadLetterQueue(queueName, job, error);
    });

    _workers[queueName] = worker;
    return worker;
  }

  /**
   * Dead Letter Queue (DLQ) handler
   */
  private async handleDeadLetterQueue(
    queueName: string,
    job: Job,
    error: Error,
  ): Promise<void> {
    console.warn(
      `[DLQ] Job ${job.id} [${job.name}] in queue ${queueName} failed after ${job.attemptsMade} attempts. Error: ${error.message}`,
    );

    // Log to PostgreSQL audit log for persistent record and operations dashboard
    try {
      const { getDatabase, schema } = await import("@/db");
      const db = getDatabase();

      await db.insert(schema.auditLogs).values({
        action: "queue:job_failed",
        resource: "queue_job",
        resourceId: job.id,
        metadata: {
          queueName,
          jobName: job.name,
          attempts: job.attemptsMade,
          error: error.message,
          stack: error.stack,
          data: job.data,
        },
      });
    } catch (dbErr) {
      console.error("[QueueManager] Failed to log DLQ status to DB:", dbErr);
    }
  }

  /**
   * Get metrics for all active queues
   */
  async getMetrics(): Promise<
    Record<
      string,
      {
        active: number;
        completed: number;
        failed: number;
        delayed: number;
        waiting: number;
      }
    >
  > {
    const metrics: Record<string, any> = {};

    for (const key of Object.values(QUEUES)) {
      try {
        const queue = this.getQueue(key);
        const [active, completed, failed, delayed, waiting] = await Promise.all(
          [
            queue.getActiveCount(),
            queue.getCompletedCount(),
            queue.getFailedCount(),
            queue.getDelayedCount(),
            queue.getWaitingCount(),
          ],
        );

        metrics[key] = {
          active,
          completed,
          failed,
          delayed,
          waiting,
        };
      } catch (err) {
        metrics[key] = {
          active: 0,
          completed: 0,
          failed: 0,
          delayed: 0,
          waiting: 0,
        };
      }
    }

    return metrics;
  }

  /**
   * Manually retry a failed job in DLQ
   */
  async retryJob(queueName: QueueName, jobId: string): Promise<boolean> {
    try {
      const queue = this.getQueue(queueName);
      const job = await queue.getJob(jobId);
      if (job && (await job.isFailed())) {
        await job.retry();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Clean up and close all queue systems
   */
  async shutdown(): Promise<void> {
    for (const worker of Object.values(_workers)) {
      await worker.close();
    }
    for (const queue of Object.values(_queues)) {
      await queue.close();
    }
    if (_redisConnection) {
      await _redisConnection.quit();
      _redisConnection = null;
    }
    _workers = {};
    _queues = {};
  }
}

export const queueManager = new QueueManager();
export default queueManager;
