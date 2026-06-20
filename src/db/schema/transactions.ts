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

export const transactionType = ["PAYMENT", "REFUND", "ADJUSTMENT"] as const;
export type TransactionType = (typeof transactionType)[number];

export const transactionStatus = [
  "PENDING",
  "SUCCESS",
  "FAILED",
  "REFUNDED",
] as const;
export type TransactionStatus = (typeof transactionStatus)[number];

export const transactions = pgTable(
  "marketplace_transaction",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    buyerId: text("buyer_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    sellerId: text("seller_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    amount: integer("amount").notNull(),
    currency: text("currency").default("USD").notNull(),
    type: text("type", { enum: transactionType })
      .$type<TransactionType>()
      .notNull(),
    status: text("status", { enum: transactionStatus })
      .$type<TransactionStatus>()
      .default("PENDING")
      .notNull(),
    gatewayReference: text("gateway_reference"),
    gatewayResponse: text("gateway_response"),
    metadata: text("metadata"),
    processedAt: timestamp("processed_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("transaction_order_id_idx").on(table.orderId),
    index("transaction_buyer_id_idx").on(table.buyerId),
    index("transaction_seller_id_idx").on(table.sellerId),
    index("transaction_type_idx").on(table.type),
    index("transaction_status_idx").on(table.status),
  ],
);

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
