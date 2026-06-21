import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const searchIndexEntityType = [
  "USER",
  "THREAD",
  "POST",
  "FORUM",
  "BADGE",
  "TROPHY",
  "CONVERSATION_MESSAGE",
  "MARKETPLACE_LISTING",
  "MARKETPLACE_SELLER",
] as const;
export type SearchIndexEntityType = (typeof searchIndexEntityType)[number];

export const searchIndexAction = ["CREATE", "UPDATE", "DELETE"] as const;
export type SearchIndexAction = (typeof searchIndexAction)[number];

export const searchIndexJobStatus = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
] as const;
export type SearchIndexJobStatus = (typeof searchIndexJobStatus)[number];

export const searchIndexJobs = pgTable(
  "search_index_job",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    entityType: text("entity_type", { enum: searchIndexEntityType })
      .$type<SearchIndexEntityType>()
      .notNull(),
    entityId: text("entity_id").notNull(),
    action: text("action", { enum: searchIndexAction })
      .$type<SearchIndexAction>()
      .notNull(),
    status: text("status", { enum: searchIndexJobStatus })
      .$type<SearchIndexJobStatus>()
      .default("PENDING")
      .notNull(),
    attempts: integer("attempts").default(0).notNull(),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    processedAt: timestamp("processed_at", { mode: "date" }),
  },
  (table) => [
    index("search_index_job_status_idx").on(table.status),
    index("search_index_job_entity_idx").on(table.entityType, table.entityId),
  ],
);

export type SearchIndexJob = typeof searchIndexJobs.$inferSelect;
export type NewSearchIndexJob = typeof searchIndexJobs.$inferInsert;
