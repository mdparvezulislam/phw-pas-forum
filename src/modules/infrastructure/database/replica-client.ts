import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getEnv } from "@/validations/env";
import { getDatabase, schema } from "@/db";

let _readDb: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Get the read replica database client.
 * Falls back to primary write database if DATABASE_REPLICA_URL is not set.
 */
export function getReadDatabase() {
  if (_readDb) return _readDb;

  const env = getEnv();

  if (!env.DATABASE_REPLICA_URL) {
    console.log(
      "[Database] No replica URL configured, read operations routed to Primary.",
    );
    _readDb = getDatabase();
    return _readDb;
  }

  const client = postgres(env.DATABASE_REPLICA_URL, {
    max: env.DATABASE_MAX_CONNECTIONS,
    prepare: false,
  });

  _readDb = drizzle(client, { schema });
  console.log("[Database] Read replica client initialized.");
  return _readDb;
}

/**
 * Get the primary (write) database client.
 */
export function getWriteDatabase() {
  return getDatabase();
}
