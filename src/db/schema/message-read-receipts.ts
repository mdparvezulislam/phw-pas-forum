import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { conversationMessages } from "./conversation-messages";
import { users } from "./users";

export const messageReadReceipts = pgTable(
  "message_read_receipt",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    messageId: text("message_id")
      .notNull()
      .references(() => conversationMessages.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    readAt: timestamp("read_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("read_receipt_message_idx").on(table.messageId),
    index("read_receipt_user_idx").on(table.userId),
  ],
);

export type MessageReadReceipt = typeof messageReadReceipts.$inferSelect;
export type NewMessageReadReceipt = typeof messageReadReceipts.$inferInsert;
