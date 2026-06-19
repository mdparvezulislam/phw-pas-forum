import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { threads } from "./threads";
import { users } from "./users";

export const threadWatches = pgTable(
  "thread_watch",
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

export type ThreadWatch = typeof threadWatches.$inferSelect;
export type NewThreadWatch = typeof threadWatches.$inferInsert;
