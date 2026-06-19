import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { attachments } from "./attachments";

export const threadAttachments = pgTable("thread_attachment", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  threadId: text("thread_id").notNull(),
  attachmentId: text("attachment_id")
    .notNull()
    .references(() => attachments.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const postAttachments = pgTable("post_attachment", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  postId: text("post_id").notNull(),
  attachmentId: text("attachment_id")
    .notNull()
    .references(() => attachments.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export type ThreadAttachment = typeof threadAttachments.$inferSelect;
export type NewThreadAttachment = typeof threadAttachments.$inferInsert;
export type PostAttachment = typeof postAttachments.$inferSelect;
export type NewPostAttachment = typeof postAttachments.$inferInsert;
