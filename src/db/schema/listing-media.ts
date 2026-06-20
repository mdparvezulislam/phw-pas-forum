import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { attachments } from "./attachments";
import { marketplaceListings } from "./marketplace-listings";

export const listingMediaTypes = ["IMAGE", "VIDEO", "DOCUMENT"] as const;
export type ListingMediaType = (typeof listingMediaTypes)[number];

export const listingMedia = pgTable(
  "listing_media",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    listingId: text("listing_id")
      .notNull()
      .references(() => marketplaceListings.id, { onDelete: "cascade" }),
    attachmentId: text("attachment_id")
      .notNull()
      .references(() => attachments.id, { onDelete: "cascade" }),
    type: text("type", { enum: listingMediaTypes })
      .$type<ListingMediaType>()
      .notNull(),
    position: integer("position").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("listing_media_listing_id_idx").on(table.listingId),
    index("listing_media_attachment_id_idx").on(table.attachmentId),
    index("listing_media_type_idx").on(table.type),
    uniqueIndex("listing_media_listing_attachment_unique").on(
      table.listingId,
      table.attachmentId
    ),
  ],
);

export type ListingMedia = typeof listingMedia.$inferSelect;
export type NewListingMedia = typeof listingMedia.$inferInsert;
