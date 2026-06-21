import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  DATABASE_URL: z.string().url(),
  DATABASE_MAX_CONNECTIONS: z.coerce.number().int().positive().default(20),
  DATABASE_REPLICA_URL: z.string().url().optional(),

  AUTH_SECRET: z.string().min(32),
  AUTH_URL: z.string().url().optional(),

  REDIS_URL: z.string().url().optional(),
  REDIS_PREFIX: z.string().default("bhw:"),
  REDIS_MAX_RETRIES: z.coerce.number().int().positive().default(10),
  REDIS_ENABLE_CLUSTER: z.coerce.boolean().default(false),

  BULLMQ_REDIS_URL: z.string().url().optional(),
  BULLMQ_PREFIX: z.string().default("bhw:bull"),

  R2_ENDPOINT: z.string().url(),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_NAME: z.string().min(1),
  R2_PUBLIC_URL: z.string().url().optional(),
  R2_REGION: z.string().default("auto"),
  R2_AVATAR_BUCKET: z.string().optional(),
  R2_ATTACHMENT_BUCKET: z.string().optional(),
  R2_MEDIA_BUCKET: z.string().optional(),

  TYPESENSE_HOST: z.string().default("localhost"),
  TYPESENSE_PORT: z.coerce.number().int().positive().default(8108),
  TYPESENSE_PROTOCOL: z.enum(["http", "https"]).default("http"),
  TYPESENSE_API_KEY: z.string().min(1),

  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),
  SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0.1),
  SENTRY_PROFILES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0.05),

  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().default("BHW PAS"),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),

  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  LOG_FORMAT: z.enum(["json", "pretty"]).default("pretty"),
  LOG_INCLUDE_METADATA: z.coerce.boolean().default(true),

  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
  OTEL_SERVICE_NAME: z.string().default("bhw-pas"),
  OTEL_SERVICE_VERSION: z.string().default("0.1.0"),

  HEALTH_CHECK_SECRET: z.string().optional(),
  HEALTH_CHECK_ENABLED: z.coerce.boolean().default(true),

  CSP_REPORT_URI: z.string().url().optional(),
  CSP_ENFORCE: z.coerce.boolean().default(true),

  EMAIL_FROM: z.string().email().optional(),
  EMAIL_PROVIDER: z
    .enum(["resend", "sendgrid", "ses", "console"])
    .default("console"),
  RESEND_API_KEY: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),

  AI_PROVIDER: z.string().default("openrouter"),
  AI_CACHE_ENABLED: z.coerce.boolean().default(true),
  AI_CACHE_TTL: z.coerce.number().int().positive().default(3600),
  AI_COST_LIMIT_DAILY: z.coerce.number().int().positive().default(1000),
  AI_COST_LIMIT_MONTHLY: z.coerce.number().int().positive().default(25000),

  RATE_LIMIT_ENABLED: z.coerce.boolean().default(true),
  RATE_LIMIT_GLOBAL_MAX: z.coerce.number().int().positive().default(1000),
  RATE_LIMIT_GLOBAL_WINDOW: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_USER_MAX: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_USER_WINDOW: z.coerce.number().int().positive().default(60),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function getEnv(): Env {
  if (_env) return _env;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error(
      "Invalid environment variables:",
      result.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment variables");
  }

  _env = result.data;
  return _env;
}

export function resetEnv(): void {
  _env = null;
}
