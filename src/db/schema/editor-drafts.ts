import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const editorDrafts = pgTable("editor_draft", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  threadId: text("thread_id"),
  postId: text("post_id"),
  title: text("title"),
  content: text("content"),
  contentJson: jsonb("content_json"),
  attachments: jsonb("attachments"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type EditorDraft = typeof editorDrafts.$inferSelect;
export type NewEditorDraft = typeof editorDrafts.$inferInsert;
