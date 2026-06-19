const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) ?? "info";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
  }

  private formatEntry(entry: LogEntry): string {
    const base = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`;
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      return `${base} ${JSON.stringify(entry.metadata)}`;
    }
    return base;
  }

  private log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>,
    error?: Error,
  ) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata,
      error,
    };

    const formatted = this.formatEntry(entry);

    switch (level) {
      case "error":
        console.error(formatted, error ?? "");
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "debug":
        console.debug(formatted);
        break;
      default:
        console.log(formatted);
    }
  }

  debug(message: string, metadata?: Record<string, unknown>) {
    this.log("debug", message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>) {
    this.log("info", message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>) {
    this.log("warn", message, metadata);
  }

  error(message: string, error?: Error, metadata?: Record<string, unknown>) {
    this.log("error", message, metadata, error);
  }
}

export const logger = new Logger();
