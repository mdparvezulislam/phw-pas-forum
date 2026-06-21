import "server-only";
import { CIRCUIT_BREAKER } from "@/constants";
import { redisService } from "@/modules/performance/cache/redis-service";
import { logger } from "@/lib/logger";

type CircuitState = "closed" | "open" | "half-open";

interface CircuitBreakerConfig {
  errorThreshold: number;
  resetTimeoutMs: number;
  halfOpenMaxRequests: number;
  monitoringWindowMs: number;
}

interface CircuitBreakerState {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureAt: number | null;
  lastSuccessAt: number | null;
  openedAt: number | null;
  halfOpenAttempts: number;
}

interface ServiceHealth {
  service: string;
  state: CircuitState;
  failureCount: number;
  successCount: number;
  uptime: string;
  isAvailable: boolean;
}

class CircuitBreaker {
  private configs: Map<string, CircuitBreakerConfig> = new Map();
  private states: Map<string, CircuitBreakerState> = new Map();
  private fallbacks: Map<string, (...args: any[]) => any> = new Map();
  private stateChangeCallbacks: Map<string, (state: CircuitState) => void> =
    new Map();
  private defaultConfig: CircuitBreakerConfig = {
    errorThreshold: CIRCUIT_BREAKER.ERROR_THRESHOLD,
    resetTimeoutMs: CIRCUIT_BREAKER.RESET_TIMEOUT_MS,
    halfOpenMaxRequests: CIRCUIT_BREAKER.HALF_OPEN_MAX,
    monitoringWindowMs: CIRCUIT_BREAKER.MONITORING_WINDOW_MS,
  };

  register(serviceName: string, config?: Partial<CircuitBreakerConfig>): void {
    this.configs.set(serviceName, {
      ...this.defaultConfig,
      ...config,
    });

    if (!this.states.has(serviceName)) {
      this.states.set(serviceName, {
        state: "closed",
        failureCount: 0,
        successCount: 0,
        lastFailureAt: null,
        lastSuccessAt: null,
        openedAt: null,
        halfOpenAttempts: 0,
      });
    }

    logger.info("[CircuitBreaker] Registered", { service: serviceName });
  }

  registerFallback(
    serviceName: string,
    fallback: (...args: any[]) => any,
  ): void {
    this.fallbacks.set(serviceName, fallback);
  }

  onStateChange(
    serviceName: string,
    callback: (state: CircuitState) => void,
  ): void {
    this.stateChangeCallbacks.set(serviceName, callback);
  }

  async call<T>(
    serviceName: string,
    operation: () => Promise<T>,
    fallbackOperation?: () => Promise<T>,
  ): Promise<T> {
    const config = this.configs.get(serviceName) ?? this.defaultConfig;
    const state = this.states.get(serviceName);

    if (!state) {
      this.register(serviceName);
      return this.call(serviceName, operation, fallbackOperation);
    }

    if (state.state === "open") {
      if (this.shouldAttemptReset(state, config)) {
        state.state = "half-open";
        state.halfOpenAttempts = 0;
        this.notifyStateChange(serviceName, "half-open");
        logger.info("[CircuitBreaker] Half-open attempt", {
          service: serviceName,
        });
      } else {
        return this.executeFallback(serviceName, fallbackOperation);
      }
    }

    if (
      state.state === "half-open" &&
      state.halfOpenAttempts >= config.halfOpenMaxRequests
    ) {
      return this.executeFallback(serviceName, fallbackOperation);
    }

    try {
      if (state.state === "half-open") {
        state.halfOpenAttempts++;
      }

      const result = await operation();

      state.successCount++;
      state.lastSuccessAt = Date.now();
      state.failureCount = 0;

      if (state.state === "half-open") {
        state.state = "closed";
        state.openedAt = null;
        this.notifyStateChange(serviceName, "closed");
        logger.info("[CircuitBreaker] Circuit closed", {
          service: serviceName,
        });
      }

      return result;
    } catch (err) {
      state.failureCount++;
      state.lastFailureAt = Date.now();

      if (state.failureCount >= config.errorThreshold) {
        state.state = "open";
        state.openedAt = Date.now();
        this.notifyStateChange(serviceName, "open");
        logger.warn("[CircuitBreaker] Circuit opened", {
          service: serviceName,
          failures: state.failureCount,
        });
      }

      if (state.state === "half-open") {
        state.state = "open";
        state.openedAt = Date.now();
        this.notifyStateChange(serviceName, "open");
      }

      return this.executeFallback(serviceName, fallbackOperation, err as Error);
    }
  }

  private shouldAttemptReset(
    state: CircuitBreakerState,
    config: CircuitBreakerConfig,
  ): boolean {
    if (!state.openedAt) return true;
    const elapsed = Date.now() - state.openedAt;
    return elapsed >= config.resetTimeoutMs;
  }

  private async executeFallback<T>(
    serviceName: string,
    fallbackOperation?: () => Promise<T>,
    originalError?: Error,
  ): Promise<T> {
    const fallbackFn = this.fallbacks.get(serviceName);

    if (fallbackOperation) {
      try {
        return await fallbackOperation();
      } catch {}
    }

    if (fallbackFn) {
      try {
        return await fallbackFn();
      } catch {}
    }

    throw (
      originalError ??
      new Error(`Circuit breaker: ${serviceName} is unavailable`)
    );
  }

  private notifyStateChange(serviceName: string, state: CircuitState): void {
    const callback = this.stateChangeCallbacks.get(serviceName);
    if (callback) {
      try {
        callback(state);
      } catch {}
    }
  }

  getState(serviceName: string): CircuitState {
    return this.states.get(serviceName)?.state ?? "closed";
  }

  getAllStates(): Record<string, CircuitBreakerState> {
    const result: Record<string, CircuitBreakerState> = {};
    for (const [name, state] of this.states) {
      result[name] = { ...state };
    }
    return result;
  }

  getHealth(): ServiceHealth[] {
    const health: ServiceHealth[] = [];
    for (const [name, state] of this.states) {
      const config = this.configs.get(name) ?? this.defaultConfig;
      const uptime = state.lastSuccessAt
        ? `${Math.round((Date.now() - state.lastSuccessAt) / 1000)}s`
        : "0s";
      health.push({
        service: name,
        state: state.state,
        failureCount: state.failureCount,
        successCount: state.successCount,
        uptime,
        isAvailable: state.state !== "open",
      });
    }
    return health;
  }

  reset(serviceName: string): void {
    this.states.set(serviceName, {
      state: "closed",
      failureCount: 0,
      successCount: 0,
      lastFailureAt: null,
      lastSuccessAt: null,
      openedAt: null,
      halfOpenAttempts: 0,
    });
    this.notifyStateChange(serviceName, "closed");
    logger.info("[CircuitBreaker] Reset", { service: serviceName });
  }

  resetAll(): void {
    for (const name of this.states.keys()) {
      this.reset(name);
    }
  }
}

export const circuitBreaker = new CircuitBreaker();
