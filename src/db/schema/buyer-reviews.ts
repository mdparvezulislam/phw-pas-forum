import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { marketplaceListings } from "./marketplace-listings";
import { orders } from "./orders";
import { users } from "./users";

export const buyerReviews = pgTable(
  "buyer_review",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orderId: text("order_id")
      .notNull()
      .unique()
      .references(() => orders.id, { onDelete: "cascade" }),
    listingId: text("listing_id")
      .notNull()
      .references(() => marketplaceListings.id, { onDelete: "cascade" }),
    buyerId: text("buyer_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    sellerId: text("seller_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    rating: integer("rating").notNull(),
    content: text("content").notNull(),
    reviewImages: jsonb("review_images").$type<string[]>().default([]),
    isVerifiedPurchase: integer("is_verified_purchase").default(1).notNull(),
    isPublic: integer("is_public").default(1).notNull(),
    isRecommended: integer("is_recommended").default(1).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("buyer_review_order_id_idx").on(table.orderId),
    index("buyer_review_listing_id_idx").on(table.listingId),
    index("buyer_review_buyer_id_idx").on(table.buyerId),
    index("buyer_review_seller_id_idx").on(table.sellerId),
    index("buyer_review_rating_idx").on(table.rating),
    index("buyer_review_verified_idx").on(table.isVerifiedPurchase),
  ],
);

export type BuyerReview = typeof buyerReviews.$inferSelect;
export type NewBuyerReview = typeof buyerReviews.$inferInsert;
