import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const sellerVerificationStatus = [
  "UNVERIFIED",
  "VERIFIED",
  "TOP_SELLER",
  "TRUSTED_SELLER",
] as const;
export type SellerVerificationStatus =
  (typeof sellerVerificationStatus)[number];

export const sellerProfiles = pgTable(
  "seller_profile",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    displayName: text("display_name"),
    bio: text("bio"),
    bannerImage: text("banner_image"),
    avatar: text("avatar"),
    website: text("website"),
    telegram: text("telegram"),
    discord: text("discord"),
    joinedMarketplaceAt: timestamp("joined_marketplace_at", {
      mode: "date",
    }).defaultNow(),
    verificationStatus: text("verification_status", {
      enum: sellerVerificationStatus,
    })
      .$type<SellerVerificationStatus>()
      .default("UNVERIFIED")
      .notNull(),
    totalSales: integer("total_sales").default(0).notNull(),
    totalReviews: integer("total_reviews").default(0).notNull(),
    averageRating: integer("average_rating").default(0).notNull(),
    trustScore: integer("trust_score").default(0).notNull(),
    responseRate: integer("response_rate").default(0).notNull(),
    responseTime: integer("response_time").default(0).notNull(),
    completionRate: integer("completion_rate").default(0).notNull(),
    isVerifiedSeller: boolean("is_verified_seller").default(false).notNull(),
    isTopSeller: boolean("is_top_seller").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("seller_profile_user_id_idx").on(table.userId),
    index("seller_profile_trust_score_idx").on(table.trustScore),
    index("seller_profile_verification_status_idx").on(
      table.verificationStatus,
    ),
    index("seller_profile_top_seller_idx").on(table.isTopSeller),
  ],
);

export type SellerProfile = typeof sellerProfiles.$inferSelect;
export type NewSellerProfile = typeof sellerProfiles.$inferInsert;
