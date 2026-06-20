import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { marketplaceListings } from "./marketplace-listings";
import { users } from "./users";

export const favoriteListings = pgTable(
  "favorite_listing",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    listingId: text("listing_id")
      .notNull()
      .references(() => marketplaceListings.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("favorite_listing_unique").on(table.userId, table.listingId),
    index("favorite_listing_user_id_idx").on(table.userId),
    index("favorite_listing_listing_id_idx").on(table.listingId),
  ],
);

export type FavoriteListing = typeof favoriteListings.$inferSelect;
export type NewFavoriteListing = typeof favoriteListings.$inferInsert;
