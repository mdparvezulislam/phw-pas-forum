import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const sellerTrustProfiles = pgTable(
  "seller_trust_profile",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sellerId: text("seller_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    positiveFeedback: integer("positive_feedback").default(0).notNull(),
    neutralFeedback: integer("neutral_feedback").default(0).notNull(),
    negativeFeedback: integer("negative_feedback").default(0).notNull(),
    completedOrders: integer("completed_orders").default(0).notNull(),
    disputedOrders: integer("disputed_orders").default(0).notNull(),
    cancelledOrders: integer("cancelled_orders").default(0).notNull(),
    totalRevenue: integer("total_revenue").default(0).notNull(),
    refundRate: integer("refund_rate").default(0).notNull(),
    responseTime: integer("response_time").default(0).notNull(),
    repeatBuyers: integer("repeat_buyers").default(0).notNull(),
    trustScore: integer("trust_score").default(0).notNull(),
    lastCalculatedAt: timestamp("last_calculated_at", { mode: "date" })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("seller_trust_profile_seller_id_idx").on(table.sellerId),
    index("seller_trust_profile_trust_score_idx").on(table.trustScore),
    index("seller_trust_profile_completed_orders_idx").on(
      table.completedOrders,
    ),
  ],
);

export type SellerTrustProfile = typeof sellerTrustProfiles.$inferSelect;
export type NewSellerTrustProfile = typeof sellerTrustProfiles.$inferInsert;
