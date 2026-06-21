import "server-only";
import { getEnv } from "@/validations/env";
import { QUEUE_NAMES } from "@/constants";
import { logger } from "@/lib/logger";

interface QueueConfig {
  name: string;
  concurrency: number;
  maxAttempts: number;
  backoffDelay: number;
  removeOnComplete: number;
  removeOnFail: number;
  stalledInterval: number;
  maxStalledCount: number;
  priority: "high" | "medium" | "low";
}

export const QUEUE_CONFIGS: Record<string, QueueConfig> = {
  [QUEUE_NAMES.EMAIL]: {
    name: QUEUE_NAMES.EMAIL,
    concurrency: 5,
    maxAttempts: 3,
    backoffDelay: 5000,
    removeOnComplete: 100,
    removeOnFail: 1000,
    stalledInterval: 30000,
    maxStalledCount: 2,
    priority: "medium",
  },
  [QUEUE_NAMES.NOTIFICATION]: {
    name: QUEUE_NAMES.NOTIFICATION,
    concurrency: 10,
    maxAttempts: 3,
    backoffDelay: 2000,
    removeOnComplete: 1000,
    removeOnFail: 500,
    stalledInterval: 15000,
    maxStalledCount: 3,
    priority: "high",
  },
  [QUEUE_NAMES.AI]: {
    name: QUEUE_NAMES.AI,
    concurrency: 3,
    maxAttempts: 3,
    backoffDelay: 10000,
    removeOnComplete: 50,
    removeOnFail: 100,
    stalledInterval: 60000,
    maxStalledCount: 2,
    priority: "low",
  },
  [QUEUE_NAMES.SEARCH_INDEX]: {
    name: QUEUE_NAMES.SEARCH_INDEX,
    concurrency: 10,
    maxAttempts: 5,
    backoffDelay: 3000,
    removeOnComplete: 500,
    removeOnFail: 100,
    stalledInterval: 30000,
    maxStalledCount: 3,
    priority: "medium",
  },
  [QUEUE_NAMES.ANALYTICS]: {
    name: QUEUE_NAMES.ANALYTICS,
    concurrency: 5,
    maxAttempts: 3,
    backoffDelay: 5000,
    removeOnComplete: 200,
    removeOnFail: 500,
    stalledInterval: 60000,
    maxStalledCount: 2,
    priority: "low",
  },
  [QUEUE_NAMES.MODERATION]: {
    name: QUEUE_NAMES.MODERATION,
    concurrency: 5,
    maxAttempts: 3,
    backoffDelay: 5000,
    removeOnComplete: 200,
    removeOnFail: 500,
    stalledInterval: 30000,
    maxStalledCount: 2,
    priority: "high",
  },
  [QUEUE_NAMES.MARKETPLACE]: {
    name: QUEUE_NAMES.MARKETPLACE,
    concurrency: 5,
    maxAttempts: 3,
    backoffDelay: 5000,
    removeOnComplete: 200,
    removeOnFail: 500,
    stalledInterval: 30000,
    maxStalledCount: 2,
    priority: "medium",
  },
  [QUEUE_NAMES.IMAGE_PROCESSING]: {
    name: QUEUE_NAMES.IMAGE_PROCESSING,
    concurrency: 3,
    maxAttempts: 3,
    backoffDelay: 5000,
    removeOnComplete: 100,
    removeOnFail: 100,
    stalledInterval: 60000,
    maxStalledCount: 2,
    priority: "low",
  },
  [QUEUE_NAMES.LEADERBOARD]: {
    name: QUEUE_NAMES.LEADERBOARD,
    concurrency: 1,
    maxAttempts: 3,
    backoffDelay: 10000,
    removeOnComplete: 10,
    removeOnFail: 10,
    stalledInterval: 120000,
    maxStalledCount: 1,
    priority: "low",
  },
  [QUEUE_NAMES.AGGREGATION]: {
    name: QUEUE_NAMES.AGGREGATION,
    concurrency: 2,
    maxAttempts: 3,
    backoffDelay: 10000,
    removeOnComplete: 20,
    removeOnFail: 50,
    stalledInterval: 120000,
    maxStalledCount: 1,
    priority: "low",
  },
  [QUEUE_NAMES.AUDIT_LOG]: {
    name: QUEUE_NAMES.AUDIT_LOG,
    concurrency: 10,
    maxAttempts: 3,
    backoffDelay: 2000,
    removeOnComplete: 10000,
    removeOnFail: 10000,
    stalledInterval: 30000,
    maxStalledCount: 3,
    priority: "low",
  },
  [QUEUE_NAMES.CLEANUP]: {
    name: QUEUE_NAMES.CLEANUP,
    concurrency: 1,
    maxAttempts: 2,
    backoffDelay: 30000,
    removeOnComplete: 5,
    removeOnFail: 5,
    stalledInterval: 300000,
    maxStalledCount: 1,
    priority: "low",
  },
};

export function getRedisConnection() {
  const env = getEnv();
  const url = env.BULLMQ_REDIS_URL || env.REDIS_URL;

  if (!url) {
    logger.warn("[Queue] No Redis URL configured for queues");
    return null;
  }

  return {
    host: new URL(url).hostname,
    port: parseInt(new URL(url).port || "6379"),
    password: new URL(url).password || undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times: number) => {
      if (times > 10) return null;
      return Math.min(times * 100, 3000);
    },
  };
}
