import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { marketplaceCategories } from "./marketplace-categories";
import { sellerProfiles } from "./seller-profiles";

export type EditorNode = {
  type?: string;
  text?: string;
  content?: EditorNode[];
  attrs?: Record<string, unknown>;
  marks?: Array<Record<string, unknown>>;
};

export type MarketplaceEditorJson = EditorNode | EditorNode[];

export const listingTypes = [
  "SERVICE",
  "DIGITAL_PRODUCT",
  "COURSE",
  "SOFTWARE",
  "SUBSCRIPTION",
  "ACCOUNT",
  "OTHER",
] as const;
export type ListingType = (typeof listingTypes)[number];

export const listingStatuses = [
  "DRAFT",
  "PENDING",
  "ACTIVE",
  "PAUSED",
  "REJECTED",
  "ARCHIVED",
  "DELETED",
] as const;
export type ListingStatus = (typeof listingStatuses)[number];

export const listingVisibilities = [
  "PUBLIC",
  "VIP_ONLY",
  "PREMIUM_ONLY",
  "PRIVATE",
] as const;
export type ListingVisibility = (typeof listingVisibilities)[number];

export const marketplaceListings = pgTable(
  "marketplace_listing",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sellerId: text("seller_id")
      .notNull()
      .references(() => sellerProfiles.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => marketplaceCategories.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    shortDescription: text("short_description").notNull(),
    descriptionJson: jsonb("description_json").$type<MarketplaceEditorJson>(),
    listingType: text("listing_type", { enum: listingTypes })
      .$type<ListingType>()
      .notNull(),
    status: text("status", { enum: listingStatuses })
      .$type<ListingStatus>()
      .default("DRAFT")
      .notNull(),
    visibility: text("visibility", { enum: listingVisibilities })
      .$type<ListingVisibility>()
      .default("PUBLIC")
      .notNull(),
    basePrice: integer("base_price").default(0).notNull(),
    deliveryDays: integer("delivery_days").default(0).notNull(),
    revisions: integer("revisions").default(0).notNull(),
    views: integer("views").default(0).notNull(),
    favorites: integer("favorites").default(0).notNull(),
    sales: integer("sales").default(0).notNull(),
    rating: decimal("rating", { precision: 3, scale: 2 }).default("0").notNull(),
    reviewCount: integer("review_count").default(0).notNull(),
    featured: boolean("featured").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("marketplace_listing_slug_unique").on(table.slug),
    index("marketplace_listing_seller_id_idx").on(table.sellerId),
    index("marketplace_listing_category_id_idx").on(table.categoryId),
    index("marketplace_listing_status_idx").on(table.status),
    index("marketplace_listing_type_idx").on(table.listingType),
    index("marketplace_listing_visibility_idx").on(table.visibility),
    index("marketplace_listing_featured_idx").on(table.featured),
    index("marketplace_listing_rating_idx").on(table.rating),
    index("marketplace_listing_created_idx").on(table.createdAt),
  ],
);

export type MarketplaceListing = typeof marketplaceListings.$inferSelect;
export type NewMarketplaceListing = typeof marketplaceListings.$inferInsert;
