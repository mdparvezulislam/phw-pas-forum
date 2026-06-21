import "server-only";

import { trace, context } from "@opentelemetry/api";
import { getEnv } from "@/validations/env";

export interface LogPayload {
  timestamp: string;
  level: "debug" | "info" | "warn" | "error";
  service: string;
  message: string;
  traceId?: string;
  spanId?: string;
  environment: string;
  metadata?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
  };
}

export class StructuredLogger {
  private serviceName: string;
  private environment: string;

  constructor() {
    const env = getEnv();
    this.serviceName = env.OTEL_SERVICE_NAME;
    this.environment = env.NODE_ENV;
  }

  private write(
    level: LogPayload["level"],
    message: string,
    metadata?: Record<string, any>,
    error?: Error,
  ) {
    const activeSpan = trace.getSpan(context.active());
    const spanContext = activeSpan?.spanContext();

    const payload: LogPayload = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      environment: this.environment,
      traceId: spanContext?.traceId,
      spanId: spanContext?.spanId,
      metadata,
    };

    if (error) {
      payload.error = {
        message: error.message,
        stack: error.stack,
      };
    }

    const output = JSON.stringify(payload);

    if (level === "error") {
      console.error(output);
    } else if (level === "warn") {
      console.warn(output);
    } else {
      console.log(output);
    }
  }

  debug(message: string, metadata?: Record<string, any>): void {
    const env = getEnv();
    if (env.LOG_LEVEL === "debug") {
      this.write("debug", message, metadata);
    }
  }

  info(message: string, metadata?: Record<string, any>): void {
    const env = getEnv();
    if (["debug", "info"].includes(env.LOG_LEVEL)) {
      this.write("info", message, metadata);
    }
  }

  warn(message: string, metadata?: Record<string, any>): void {
    const env = getEnv();
    if (["debug", "info", "warn"].includes(env.LOG_LEVEL)) {
      this.write("warn", message, metadata);
    }
  }

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    this.write("error", message, metadata, error);
  }
}

export const sreLogger = new StructuredLogger();
export default sreLogger;
