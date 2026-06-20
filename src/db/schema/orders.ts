import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { listingPackages } from "./listing-packages";
import { marketplaceListings } from "./marketplace-listings";
import { users } from "./users";

export const orderStatus = [
  "PENDING",
  "ACCEPTED",
  "IN_PROGRESS",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "DISPUTED",
  "REFUNDED",
] as const;
export type OrderStatus = (typeof orderStatus)[number];

export const orders = pgTable(
  "marketplace_order",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    buyerId: text("buyer_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    sellerId: text("seller_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    listingId: text("listing_id")
      .notNull()
      .references(() => marketplaceListings.id, { onDelete: "restrict" }),
    packageId: text("package_id").references(() => listingPackages.id, {
      onDelete: "set null",
    }),
    orderNumber: text("order_number").notNull().unique(),
    status: text("status", { enum: orderStatus })
      .$type<OrderStatus>()
      .default("PENDING")
      .notNull(),
    amount: integer("amount").notNull(),
    currency: text("currency").default("USD").notNull(),
    requirements: text("requirements"),
    isUrgent: integer("is_urgent").default(0).notNull(),
    cancelledBy: text("cancelled_by").references(() => users.id, {
      onDelete: "set null",
    }),
    cancelReason: text("cancel_reason"),
    cancelledAt: timestamp("cancelled_at", { mode: "date" }),
    completedAt: timestamp("completed_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("order_buyer_id_idx").on(table.buyerId),
    index("order_seller_id_idx").on(table.sellerId),
    index("order_listing_id_idx").on(table.listingId),
    index("order_status_idx").on(table.status),
    index("order_number_idx").on(table.orderNumber),
    index("order_created_idx").on(table.createdAt),
  ],
);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export const orderMessages = pgTable(
  "order_message",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    contentJson: jsonb("content_json").notNull(),
    isSystem: integer("is_system").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("order_message_order_id_idx").on(table.orderId),
    index("order_message_sender_id_idx").on(table.senderId),
    index("order_message_created_idx").on(table.createdAt),
  ],
);

export type OrderMessage = typeof orderMessages.$inferSelect;
export type NewOrderMessage = typeof orderMessages.$inferInsert;

export const orderDeliveries = pgTable(
  "order_delivery",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    sellerId: text("seller_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    deliveryMessage: text("delivery_message"),
    attachments: jsonb("attachments").$type<string[]>().default([]),
    revisionCount: integer("revision_count").default(0).notNull(),
    isLastDelivery: integer("is_last_delivery").default(0).notNull(),
    deliveredAt: timestamp("delivered_at", { mode: "date" })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("order_delivery_order_id_idx").on(table.orderId),
    index("order_delivery_seller_id_idx").on(table.sellerId),
  ],
);

export type OrderDelivery = typeof orderDeliveries.$inferSelect;
export type NewOrderDelivery = typeof orderDeliveries.$inferInsert;

export const orderRevisions = pgTable(
  "order_revision",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    requestedBy: text("requested_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    reason: text("reason").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [index("order_revision_order_id_idx").on(table.orderId)],
);

export type OrderRevision = typeof orderRevisions.$inferSelect;
export type NewOrderRevision = typeof orderRevisions.$inferInsert;
