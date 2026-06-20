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

export const disputeStatus = [
  "OPEN",
  "UNDER_REVIEW",
  "RESOLVED",
  "REJECTED",
] as const;
export type DisputeStatus = (typeof disputeStatus)[number];

export const disputes = pgTable(
  "marketplace_dispute",
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
    moderatorId: text("moderator_id").references(() => users.id, {
      onDelete: "set null",
    }),
    reason: text("reason").notNull(),
    description: text("description").notNull(),
    status: text("status", { enum: disputeStatus })
      .$type<DisputeStatus>()
      .default("OPEN")
      .notNull(),
    resolution: text("resolution"),
    resolvedAt: timestamp("resolved_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("dispute_order_id_idx").on(table.orderId),
    index("dispute_buyer_id_idx").on(table.buyerId),
    index("dispute_seller_id_idx").on(table.sellerId),
    index("dispute_status_idx").on(table.status),
  ],
);

export type Dispute = typeof disputes.$inferSelect;
export type NewDispute = typeof disputes.$inferInsert;

export const disputeMessages = pgTable(
  "dispute_message",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    disputeId: text("dispute_id")
      .notNull()
      .references(() => disputes.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    content: text("content").notNull(),
    isModNote: integer("is_mod_note").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("dispute_message_dispute_id_idx").on(table.disputeId),
    index("dispute_message_sender_id_idx").on(table.senderId),
  ],
);

export type DisputeMessage = typeof disputeMessages.$inferSelect;
export type NewDisputeMessage = typeof disputeMessages.$inferInsert;
