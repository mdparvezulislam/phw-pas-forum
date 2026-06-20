import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const reputationTransactionType = [
  "POST_REACTION",
  "THREAD_REACTION",
  "TROPHY_REWARD",
  "ADMIN_AWARD",
  "MARKETPLACE_REVIEW",
  "SYSTEM_REWARD",
] as const;
export type ReputationTransactionType =
  (typeof reputationTransactionType)[number];

export const reputationTransactions = pgTable(
  "reputation_transaction",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sourceUserId: text("source_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    type: text("type", { enum: reputationTransactionType })
      .$type<ReputationTransactionType>()
      .notNull(),
    points: integer("points").notNull(),
    entityId: text("entity_id"),
    entityType: text("entity_type"),
    metadata: text("metadata"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("rep_tx_user_idx").on(table.userId),
    index("rep_tx_entity_idx").on(table.entityId, table.entityType),
  ],
);

export type ReputationTransaction =
  typeof reputationTransactions.$inferSelect;
export type NewReputationTransaction =
  typeof reputationTransactions.$inferInsert;
