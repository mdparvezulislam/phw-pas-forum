import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { attachments } from "./attachments";
import { conversationMessages } from "./conversation-messages";

export const conversationAttachments = pgTable(
  "conversation_attachment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    messageId: text("message_id")
      .notNull()
      .references(() => conversationMessages.id, { onDelete: "cascade" }),
    attachmentId: text("attachment_id")
      .notNull()
      .references(() => attachments.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("conv_att_message_idx").on(table.messageId),
    index("conv_att_attachment_idx").on(table.attachmentId),
  ],
);

export type ConversationAttachment =
  typeof conversationAttachments.$inferSelect;
export type NewConversationAttachment =
  typeof conversationAttachments.$inferInsert;
