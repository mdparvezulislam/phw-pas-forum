import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  DATABASE_URL: z.string().url(),
  DATABASE_MAX_CONNECTIONS: z.coerce.number().int().positive().default(20),

  AUTH_SECRET: z.string().min(32),
  AUTH_URL: z.string().url().optional(),

  REDIS_URL: z.string().url(),
  REDIS_PREFIX: z.string().default("bhw:"),

  R2_ENDPOINT: z.string().url(),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_NAME: z.string().min(1),
  R2_PUBLIC_URL: z.string().url().optional(),
  R2_REGION: z.string().default("auto"),

  TYPESENSE_HOST: z.string().default("localhost"),
  TYPESENSE_PORT: z.coerce.number().int().positive().default(8108),
  TYPESENSE_PROTOCOL: z.enum(["http", "https"]).default("http"),
  TYPESENSE_API_KEY: z.string().min(1),

  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().default("BHW PAS"),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function getEnv(): Env {
  if (_env) return _env;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error(
      "❌ Invalid environment variables:",
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
