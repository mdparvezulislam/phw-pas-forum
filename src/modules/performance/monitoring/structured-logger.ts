import "server-only";
import { getEnv } from "@/validations/env";

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

interface StructuredLogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  environment: string;
  trace_id?: string;
  span_id?: string;
  user_id?: string;
  request_id?: string;
  duration_ms?: number;
  error?: {
    message: string;
    name: string;
    stack?: string;
    code?: string;
  };
  metadata?: Record<string, unknown>;
}

class StructuredLogger {
  private level: LogLevel;
  private format: "json" | "pretty";
  private includeMetadata: boolean;
  private service: string;

  constructor() {
    const env = getEnv();
    this.level = env.LOG_LEVEL;
    this.format = env.LOG_FORMAT;
    this.includeMetadata = env.LOG_INCLUDE_METADATA;
    this.service = env.OTEL_SERVICE_NAME;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  private createEntry(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>,
    error?: Error,
  ): StructuredLogEntry {
    const entry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      environment: getEnv().NODE_ENV,
      metadata: this.includeMetadata ? metadata : undefined,
    };

    if (error) {
      entry.error = {
        message: error.message,
        name: error.name,
        stack: error.stack,
        code: (error as any).code,
      };
    }

    return entry;
  }

  private output(entry: StructuredLogEntry): void {
    const fn =
      entry.level === "error"
        ? console.error
        : entry.level === "warn"
          ? console.warn
          : entry.level === "debug"
            ? console.debug
            : console.log;

    if (this.format === "json") {
      fn(JSON.stringify(entry));
    } else {
      const base = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.service}] ${entry.message}`;
      if (
        this.includeMetadata &&
        entry.metadata &&
        Object.keys(entry.metadata).length > 0
      ) {
        fn(base, JSON.stringify(entry.metadata, null, 0));
      } else {
        fn(base);
      }
      if (entry.error) {
        fn(`  Error: ${entry.error.message}`);
        if (entry.error.stack) {
          fn(`  ${entry.error.stack.split("\n").slice(1, 4).join("\n  ")}`);
        }
      }
    }
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    if (!this.shouldLog("debug")) return;
    this.output(this.createEntry("debug", message, metadata));
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    if (!this.shouldLog("info")) return;
    this.output(this.createEntry("info", message, metadata));
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    if (!this.shouldLog("warn")) return;
    this.output(this.createEntry("warn", message, metadata));
  }

  error(
    message: string,
    error?: Error,
    metadata?: Record<string, unknown>,
  ): void {
    if (!this.shouldLog("error")) return;
    this.output(this.createEntry("error", message, metadata, error));
  }

  logRequest(
    method: string,
    path: string,
    statusCode: number,
    durationMs: number,
    metadata?: Record<string, unknown>,
  ): void {
    const level =
      statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";
    const entry = this.createEntry(level, `${method} ${path} ${statusCode}`, {
      ...metadata,
      http: { method, path, statusCode },
      duration_ms: durationMs,
    });
    this.output(entry);
  }

  logQuery(
    query: string,
    durationMs: number,
    metadata?: Record<string, unknown>,
  ): void {
    const level =
      durationMs > 5000 ? "error" : durationMs > 1000 ? "warn" : "debug";
    if (!this.shouldLog(level)) return;

    this.output(
      this.createEntry(level, `Query [${durationMs}ms]`, {
        ...metadata,
        query: query.substring(0, 500),
        duration_ms: durationMs,
      }),
    );
  }

  withRequestContext(requestId: string, userId?: string): StructuredLogger {
    const logger = new StructuredLogger();
    const originalOutput = logger.output.bind(logger);
    logger.output = (entry) => {
      entry.request_id = requestId;
      entry.user_id = userId;
      originalOutput(entry);
    };
    return logger;
  }
}

export const structuredLogger = new StructuredLogger();
