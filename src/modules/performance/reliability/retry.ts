import "server-only";
import { RETRY_POLICY } from "@/constants";
import { logger } from "@/lib/logger";

interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  jitter?: boolean;
  retryableErrors?: Array<{ name?: string; message?: RegExp }>;
  onRetry?: (attempt: number, error: Error, delayMs: number) => void;
}

interface RetryResult<T> {
  value: T | null;
  error: Error | null;
  attempts: number;
  success: boolean;
  totalDurationMs: number;
}

interface DeadLetterEntry {
  id: string;
  originalOperation: string;
  error: Error;
  attempts: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

class RetryService {
  private deadLetterQueue: DeadLetterEntry[] = [];
  private maxDeadLetterSize = 1000;

  async withRetry<T>(
    operation: () => Promise<T>,
    options?: RetryOptions,
  ): Promise<RetryResult<T>> {
    const maxAttempts = options?.maxAttempts ?? RETRY_POLICY.MAX_ATTEMPTS;
    const baseDelay = options?.baseDelayMs ?? RETRY_POLICY.BASE_DELAY_MS;
    const maxDelay = options?.maxDelayMs ?? RETRY_POLICY.MAX_DELAY_MS;
    const backoffFactor = options?.backoffFactor ?? RETRY_POLICY.BACKOFF_FACTOR;
    const enableJitter = options?.jitter ?? RETRY_POLICY.JITTER;
    const retryableErrors = options?.retryableErrors;

    const startTime = performance.now();
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await operation();
        const totalDurationMs = performance.now() - startTime;

        return {
          value: result,
          error: null,
          attempts: attempt,
          success: true,
          totalDurationMs,
        };
      } catch (err) {
        lastError = err as Error;

        if (attempt === maxAttempts) {
          break;
        }

        if (!this.isRetryable(err as Error, retryableErrors)) {
          break;
        }

        const delayMs = this.calculateDelay(
          attempt,
          baseDelay,
          maxDelay,
          backoffFactor,
          enableJitter,
        );

        options?.onRetry?.(attempt, err as Error, delayMs);

        logger.debug("[Retry] Attempt failed, retrying", {
          attempt,
          maxAttempts,
          delayMs,
          error: (err as Error).message,
        });

        await this.sleep(delayMs);
      }
    }

    const totalDurationMs = performance.now() - startTime;

    return {
      value: null,
      error: lastError,
      attempts: maxAttempts,
      success: false,
      totalDurationMs,
    };
  }

  private calculateDelay(
    attempt: number,
    baseDelay: number,
    maxDelay: number,
    backoffFactor: number,
    enableJitter: boolean,
  ): number {
    const delay = Math.min(
      baseDelay * Math.pow(backoffFactor, attempt - 1),
      maxDelay,
    );

    if (enableJitter) {
      return delay * (0.5 + Math.random() * 0.5);
    }

    return delay;
  }

  private isRetryable(
    error: Error,
    retryableErrors?: Array<{ name?: string; message?: RegExp }>,
  ): boolean {
    if (!retryableErrors || retryableErrors.length === 0) {
      const nonRetryableMessages = [
        "not found",
        "not found",
        "invalid",
        "bad request",
        "unauthorized",
        "forbidden",
        "validation error",
        "already exists",
      ];
      return !nonRetryableMessages.some((msg) =>
        error.message.toLowerCase().includes(msg),
      );
    }

    return retryableErrors.some((pattern) => {
      if (pattern.name && error.name !== pattern.name) return false;
      if (pattern.message && !pattern.message.test(error.message)) return false;
      return true;
    });
  }

  sendToDeadLetter(
    operationName: string,
    error: Error,
    attempts: number,
    metadata?: Record<string, unknown>,
  ): void {
    const entry: DeadLetterEntry = {
      id: crypto.randomUUID(),
      originalOperation: operationName,
      error,
      attempts,
      timestamp: new Date(),
      metadata,
    };

    this.deadLetterQueue.push(entry);

    if (this.deadLetterQueue.length > this.maxDeadLetterSize) {
      this.deadLetterQueue.shift();
    }

    logger.error("[Retry] Sent to dead letter queue", error, {
      operation: operationName,
      attempts,
      metadata,
    });
  }

  getDeadLetterQueue(): DeadLetterEntry[] {
    return [...this.deadLetterQueue];
  }

  retryFromDeadLetter(id: string): DeadLetterEntry | null {
    const index = this.deadLetterQueue.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const entry = this.deadLetterQueue[index];
    this.deadLetterQueue.splice(index, 1);

    return entry;
  }

  clearDeadLetterQueue(): void {
    this.deadLetterQueue = [];
  }

  getDeadLetterCount(): number {
    return this.deadLetterQueue.length;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const retryService = new RetryService();
