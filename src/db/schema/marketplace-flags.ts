import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { threads } from "./threads";
import { users } from "./users";

export const marketplaceFlagReason = [
  "SPAM",
  "FRAUD",
  "MISLEADING",
  "COPYRIGHT",
  "DUPLICATE",
  "OTHER",
] as const;

export type MarketplaceFlagReason = (typeof marketplaceFlagReason)[number];

export const marketplaceFlagStatus = [
  "PENDING",
  "INVESTIGATING",
  "RESOLVED",
  "DISMISSED",
] as const;

export type MarketplaceFlagStatus = (typeof marketplaceFlagStatus)[number];

export const marketplaceFlags = pgTable("marketplace_flag", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  listingId: text("listing_id")
    .notNull()
    .references(() => threads.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reason: text("reason", { enum: marketplaceFlagReason })
    .$type<MarketplaceFlagReason>()
    .notNull(),
  notes: text("notes"),
  status: text("status", { enum: marketplaceFlagStatus })
    .$type<MarketplaceFlagStatus>()
    .default("PENDING")
    .notNull(),
  resolvedBy: text("resolved_by").references(() => users.id, {
    onDelete: "set null",
  }),
  resolvedAt: timestamp("resolved_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export type MarketplaceFlag = typeof marketplaceFlags.$inferSelect;
export type NewMarketplaceFlag = typeof marketplaceFlags.$inferInsert;
