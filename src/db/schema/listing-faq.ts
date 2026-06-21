import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { marketplaceListings } from "./marketplace-listings";

export const listingFaq = pgTable(
  "listing_faq",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    listingId: text("listing_id")
      .notNull()
      .references(() => marketplaceListings.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    position: integer("position").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("listing_faq_listing_id_idx").on(table.listingId)],
);

export type ListingFaq = typeof listingFaq.$inferSelect;
export type NewListingFaq = typeof listingFaq.$inferInsert;
