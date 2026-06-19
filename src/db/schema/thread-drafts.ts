import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const threadDrafts = pgTable("thread_draft", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  forumId: text("forum_id"),
  title: text("title"),
  content: text("content"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type ThreadDraft = typeof threadDrafts.$inferSelect;
export type NewThreadDraft = typeof threadDrafts.$inferInsert;
