import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { conversations } from "./conversations";
import { users } from "./users";

export const conversationParticipants = pgTable(
  "conversation_participant",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at", { mode: "date" }).defaultNow().notNull(),
    lastReadMessageId: text("last_read_message_id"),
    isMuted: boolean("is_muted").default(false).notNull(),
    isArchived: boolean("is_archived").default(false).notNull(),
    isLeft: boolean("is_left").default(false).notNull(),
  },
  (table) => [
    index("participant_conversation_idx").on(table.conversationId),
    index("participant_user_idx").on(table.userId),
    index("participant_user_archive_idx").on(table.userId, table.isArchived),
  ],
);

export type ConversationParticipant =
  typeof conversationParticipants.$inferSelect;
export type NewConversationParticipant =
  typeof conversationParticipants.$inferInsert;
