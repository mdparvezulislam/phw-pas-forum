import "server-only";
import { logger } from "@/lib/logger";
import { getEnv } from "@/validations/env";

interface SentryConfig {
  dsn: string;
  environment: string;
  tracesSampleRate: number;
  profilesSampleRate: number;
  release: string;
}

type Severity = "fatal" | "error" | "warning" | "log" | "info" | "debug";

interface ErrorEvent {
  message: string;
  error?: Error;
  severity?: Severity;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  userId?: string;
  request?: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
  };
}

class SentryService {
  private enabled = false;
  private config: SentryConfig | null = null;
  private initialized = false;

  initialize(): void {
    if (this.initialized) return;

    const env = getEnv();
    const dsn = env.SENTRY_DSN || env.NEXT_PUBLIC_SENTRY_DSN;

    if (!dsn) {
      logger.info("[Sentry] No DSN configured, running without error tracking");
      this.initialized = true;
      return;
    }

    this.config = {
      dsn,
      environment: env.SENTRY_ENVIRONMENT || env.NODE_ENV,
      tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE,
      profilesSampleRate: env.SENTRY_PROFILES_SAMPLE_RATE,
      release: `bhw-pas@${env.OTEL_SERVICE_VERSION}`,
    };

    this.enabled = true;
    this.initialized = true;
    logger.info("[Sentry] Initialized", {
      environment: this.config.environment,
    });
  }

  captureError(event: ErrorEvent): void {
    if (!this.enabled) {
      if (event.severity === "fatal" || event.severity === "error") {
        logger.error(`[Sentry] ${event.message}`, event.error, event.extra);
      }
      return;
    }

    try {
      const Sentry = require("@sentry/nextjs");

      if (event.error) {
        Sentry.captureException(event.error, {
          level: event.severity ?? "error",
          tags: event.tags,
          extra: event.extra,
          user: event.userId ? { id: event.userId } : undefined,
        });
      } else {
        Sentry.captureMessage(event.message, {
          level: event.severity ?? "error",
          tags: event.tags,
          extra: event.extra,
          user: event.userId ? { id: event.userId } : undefined,
        });
      }

      if (event.request) {
        Sentry.addBreadcrumb({
          category: "request",
          message: `${event.request.method ?? "GET"} ${event.request.url ?? "unknown"}`,
          level: "info",
          data: event.request,
        });
      }
    } catch (err) {
      logger.error("[Sentry] Failed to capture error", err as Error);
    }
  }

  captureException(error: Error, extra?: Record<string, unknown>): void {
    this.captureError({
      message: error.message,
      error,
      severity: "error",
      extra,
    });
  }

  captureMessage(message: string, severity?: Severity): void {
    this.captureError({ message, severity });
  }

  setUser(userId: string | null): void {
    if (!this.enabled) return;
    try {
      const Sentry = require("@sentry/nextjs");
      if (userId) {
        Sentry.setUser({ id: userId });
      } else {
        Sentry.setUser(null);
      }
    } catch {}
  }

  setTags(tags: Record<string, string>): void {
    if (!this.enabled) return;
    try {
      const Sentry = require("@sentry/nextjs");
      Sentry.setTags(tags);
    } catch {}
  }

  setExtra(extra: Record<string, unknown>): void {
    if (!this.enabled) return;
    try {
      const Sentry = require("@sentry/nextjs");
      Sentry.setExtra("metadata", extra);
    } catch {}
  }

  startSpan(name: string, operation: () => Promise<unknown>): Promise<unknown> {
    if (!this.enabled) return operation();

    try {
      const Sentry = require("@sentry/nextjs");
      return Sentry.startSpan({ name, op: "function" }, operation);
    } catch {
      return operation();
    }
  }

  async getHealth(): Promise<{ enabled: boolean; dsn: boolean }> {
    return {
      enabled: this.enabled,
      dsn: !!this.config?.dsn,
    };
  }

  async flush(): Promise<void> {
    if (!this.enabled) return;
    try {
      const Sentry = require("@sentry/nextjs");
      await Sentry.flush(5000);
    } catch {}
  }
}

export const sentryService = new SentryService();
