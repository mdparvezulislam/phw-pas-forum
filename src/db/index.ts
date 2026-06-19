import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { getEnv } from "@/validations/env";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDatabase() {
  if (_db) return _db;

  const env = getEnv();
  const client = postgres(env.DATABASE_URL, {
    max: env.DATABASE_MAX_CONNECTIONS,
    prepare: false,
  });

  _db = drizzle(client, { schema });
  return _db;
}

export type Database = ReturnType<typeof getDatabase>;

export { schema };
