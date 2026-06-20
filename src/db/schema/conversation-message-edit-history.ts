import { index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { conversationMessages } from "./conversation-messages";
import { users } from "./users";

export const conversationMessageEditHistory = pgTable(
  "conversation_message_edit_history",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    messageId: text("message_id")
      .notNull()
      .references(() => conversationMessages.id, { onDelete: "cascade" }),
    previousContentJson: jsonb("previous_content_json").notNull(),
    editedBy: text("edited_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    editedAt: timestamp("edited_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("msg_edit_message_idx").on(table.messageId),
    index("msg_edit_editor_idx").on(table.editedBy),
  ]
);

export type ConversationMessageEditHistory = typeof conversationMessageEditHistory.$inferSelect;
export type NewConversationMessageEditHistory = typeof conversationMessageEditHistory.$inferInsert;
