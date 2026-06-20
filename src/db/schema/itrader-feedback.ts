import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { orders } from "./orders";
import { users } from "./users";

export const itraderRating = ["POSITIVE", "NEUTRAL", "NEGATIVE"] as const;
export type ITraderRating = (typeof itraderRating)[number];

export const itraderFeedback = pgTable(
  "itrader_feedback",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    fromUserId: text("from_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    toUserId: text("to_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    rating: text("rating", { enum: itraderRating })
      .$type<ITraderRating>()
      .notNull(),
    comment: text("comment").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("itrader_order_id_idx").on(table.orderId),
    index("itrader_from_user_id_idx").on(table.fromUserId),
    index("itrader_to_user_id_idx").on(table.toUserId),
    index("itrader_rating_idx").on(table.rating),
  ],
);

export type ITraderFeedback = typeof itraderFeedback.$inferSelect;
export type NewITraderFeedback = typeof itraderFeedback.$inferInsert;
