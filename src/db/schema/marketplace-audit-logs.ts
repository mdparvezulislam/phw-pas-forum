import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { threads } from "./threads";
import { users } from "./users";

export const marketplaceAuditLogs = pgTable("marketplace_audit_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  listingId: text("listing_id")
    .notNull()
    .references(() => threads.id, { onDelete: "cascade" }),
  moderatorId: text("moderator_id").references(() => users.id, {
    onDelete: "set null",
  }),
  action: text("action").notNull(), // e.g. "SUBMIT", "APPROVE", "REJECT", "UPDATE"
  previousState: jsonb("previous_state"),
  newState: jsonb("new_state"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export type MarketplaceAuditLog = typeof marketplaceAuditLogs.$inferSelect;
export type NewMarketplaceAuditLog = typeof marketplaceAuditLogs.$inferInsert;
