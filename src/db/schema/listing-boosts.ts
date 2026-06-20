import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { marketplaceListings } from "./marketplace-listings";

export const boostTypes = [
  "FEATURED",
  "TOP_POSITION",
  "CATEGORY_SPOTLIGHT",
  "HOMEPAGE_FEATURED",
] as const;
export type BoostType = (typeof boostTypes)[number];

export const listingBoosts = pgTable("listing_boost", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  listingId: text("listing_id")
    .notNull()
    .references(() => marketplaceListings.id, { onDelete: "cascade" }),
  type: text("type", { enum: boostTypes }).$type<BoostType>().notNull(),
  startedAt: timestamp("started_at", { mode: "date" }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
});

export type ListingBoost = typeof listingBoosts.$inferSelect;
export type NewListingBoost = typeof listingBoosts.$inferInsert;
