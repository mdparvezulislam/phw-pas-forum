import "server-only";

import { cache } from "@/lib/redis";

export type CircuitBreakerState = "CLOSED" | "OPEN" | "HALF_OPEN";

export class CircuitBreaker {
  private memoryState: CircuitBreakerState = "CLOSED";
  private memoryFailures = 0;
  private memoryNextAttempt = 0;

  constructor(
    public readonly name: string,
    private readonly failureThreshold = 5,
    private readonly resetTimeoutMs = 15000, // 15 seconds
  ) {}

  private getRedisClient() {
    return (cache as any).client;
  }

  /**
   * Get current state of the circuit breaker.
   */
  async getState(): Promise<CircuitBreakerState> {
    const client = this.getRedisClient();
    if (!client || (cache as any)._enabled === false) {
      // Memory fallback
      if (this.memoryState === "OPEN" && Date.now() > this.memoryNextAttempt) {
        return "HALF_OPEN";
      }
      return this.memoryState;
    }

    try {
      const stateKey = `circuit:${this.name}:state`;
      const nextAttemptKey = `circuit:${this.name}:next_attempt`;

      const state = (await client.get(stateKey)) as CircuitBreakerState | null;
      if (state === "OPEN") {
        const nextAttempt = Number((await client.get(nextAttemptKey)) || 0);
        if (Date.now() > nextAttempt) {
          await client.set(stateKey, "HALF_OPEN");
          return "HALF_OPEN";
        }
        return "OPEN";
      }

      return state || "CLOSED";
    } catch {
      return this.memoryState;
    }
  }

  /**
   * Record a successful invocation, closing the circuit.
   */
  async recordSuccess(): Promise<void> {
    const client = this.getRedisClient();
    if (!client || (cache as any)._enabled === false) {
      this.memoryFailures = 0;
      this.memoryState = "CLOSED";
      return;
    }

    try {
      await client.del(`circuit:${this.name}:failures`);
      await client.set(`circuit:${this.name}:state`, "CLOSED");
    } catch {
      this.memoryFailures = 0;
      this.memoryState = "CLOSED";
    }
  }

  /**
   * Record a failed invocation, opening the circuit if threshold exceeded.
   */
  async recordFailure(): Promise<void> {
    const client = this.getRedisClient();
    if (!client || (cache as any)._enabled === false) {
      this.memoryFailures++;
      if (this.memoryFailures >= this.failureThreshold) {
        this.memoryState = "OPEN";
        this.memoryNextAttempt = Date.now() + this.resetTimeoutMs;
        console.warn(
          `[CircuitBreaker] Memory circuit for ${this.name} is now OPEN.`,
        );
      }
      return;
    }

    try {
      const failuresKey = `circuit:${this.name}:failures`;
      const stateKey = `circuit:${this.name}:state`;
      const nextAttemptKey = `circuit:${this.name}:next_attempt`;

      const failures = await client.incr(failuresKey);
      if (failures === 1) {
        await client.expire(
          failuresKey,
          Math.ceil(this.resetTimeoutMs / 1000) * 10,
        );
      }

      if (failures >= this.failureThreshold) {
        await client.set(stateKey, "OPEN");
        await client.set(
          nextAttemptKey,
          Date.now() + this.resetTimeoutMs,
          "EX",
          Math.ceil(this.resetTimeoutMs / 1000) * 2,
        );
        console.warn(
          `[CircuitBreaker] Redis-backed circuit for ${this.name} is now OPEN (failing fast).`,
        );
      }
    } catch (error) {
      console.error(
        "[CircuitBreaker] Failed to record failure in Redis:",
        error,
      );
    }
  }

  /**
   * Execute an action protected by the circuit breaker.
   */
  async execute<T>(
    fn: () => Promise<T>,
    fallback?: () => Promise<T>,
  ): Promise<T> {
    const state = await this.getState();

    if (state === "OPEN") {
      if (fallback) {
        console.log(
          `[CircuitBreaker] ${this.name} is OPEN. Directing to fallback.`,
        );
        return fallback();
      }
      throw new Error(
        `[CircuitBreaker] ${this.name} is OPEN. Bypassing request.`,
      );
    }

    try {
      const result = await fn();
      await this.recordSuccess();
      return result;
    } catch (error) {
      await this.recordFailure();
      if (fallback) {
        console.warn(
          `[CircuitBreaker] ${this.name} failed invocation. Executing fallback.`,
        );
        return fallback();
      }
      throw error;
    }
  }
}

// Export preconfigured instances for infrastructure integrations
export const openRouterBreaker = new CircuitBreaker("openrouter-ai", 5, 20000);
export const ablyBreaker = new CircuitBreaker("ably-realtime", 5, 15000);
export const typesenseBreaker = new CircuitBreaker(
  "typesense-search",
  4,
  10000,
);
export const emailBreaker = new CircuitBreaker("email-provider", 3, 30000);
export const storageBreaker = new CircuitBreaker("cloudflare-r2", 5, 10000);
export const paymentsBreaker = new CircuitBreaker("stripe-payments", 3, 30000);
