import { pgTable, text, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { threads } from "./threads";
import { users } from "./users";

export const threadBookmarks = pgTable(
  "thread_bookmark",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    threadId: text("thread_id")
      .notNull()
      .references(() => threads.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    {
      pk: primaryKey({ columns: [table.userId, table.threadId] }),
    },
  ],
);

export type ThreadBookmark = typeof threadBookmarks.$inferSelect;
export type NewThreadBookmark = typeof threadBookmarks.$inferInsert;
