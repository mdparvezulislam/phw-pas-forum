import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { threads } from "./threads";

export const threadTags = pgTable("thread_tag", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  threadId: text("thread_id")
    .notNull()
    .references(() => threads.id, { onDelete: "cascade" }),
  tag: text("tag").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export type ThreadTag = typeof threadTags.$inferSelect;
export type NewThreadTag = typeof threadTags.$inferInsert;
