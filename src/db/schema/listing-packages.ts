import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { marketplaceListings } from "./marketplace-listings";

export const listingPackages = pgTable(
  "listing_package",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    listingId: text("listing_id")
      .notNull()
      .references(() => marketplaceListings.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    price: integer("price").default(0).notNull(),
    deliveryDays: integer("delivery_days").default(0).notNull(),
    revisions: integer("revisions").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("listing_package_listing_id_idx").on(table.listingId),
    index("listing_package_price_idx").on(table.price),
  ],
);

export type ListingPackage = typeof listingPackages.$inferSelect;
export type NewListingPackage = typeof listingPackages.$inferInsert;
