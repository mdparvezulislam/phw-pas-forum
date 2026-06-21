import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const conversationType = [
  "PRIVATE",
  "GROUP",
  "SUPPORT",
  "MARKETPLACE",
  "SYSTEM",
] as const;
export type ConversationType = (typeof conversationType)[number];

export const conversations = pgTable(
  "conversation",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title"),
    type: text("type", { enum: conversationType })
      .$type<ConversationType>()
      .default("PRIVATE")
      .notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    participantCount: integer("participant_count").default(0).notNull(),
    lastMessageId: text("last_message_id"),
    lastActivityAt: timestamp("last_activity_at", { mode: "date" })
      .defaultNow()
      .notNull(),
    isArchived: boolean("is_archived").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("conversation_last_activity_idx").on(table.lastActivityAt),
    index("conversation_created_by_idx").on(table.createdBy),
  ],
);

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
