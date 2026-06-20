import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { threads } from "./threads";
import { users } from "./users";

export const featuredListings = pgTable("featured_listing", {
  listingId: text("listing_id")
    .primaryKey()
    .references(() => threads.id, { onDelete: "cascade" }),
  featuredUntil: timestamp("featured_until", { mode: "date" }).notNull(),
  featuredBy: text("featured_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export type FeaturedListing = typeof featuredListings.$inferSelect;
export type NewFeaturedListing = typeof featuredListings.$inferInsert;
