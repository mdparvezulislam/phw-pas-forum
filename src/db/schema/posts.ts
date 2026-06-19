import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { threads } from "./threads";
import { users } from "./users";

export const postStatus = [
  "PUBLISHED",
  "DELETED",
  "HIDDEN",
  "MODERATED",
] as const;
export type PostStatus = (typeof postStatus)[number];

export const posts = pgTable(
  "post",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    threadId: text("thread_id")
      .notNull()
      .references(() => threads.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    postNumber: integer("post_number").notNull(),
    status: text("status", { enum: postStatus })
      .$type<PostStatus>()
      .default("PUBLISHED")
      .notNull(),
    isEdited: boolean("is_edited").default(false).notNull(),
    editedAt: timestamp("edited_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("post_thread_id_idx").on(table.threadId),
    index("post_author_id_idx").on(table.authorId),
    index("post_thread_number_idx").on(table.threadId, table.postNumber),
  ],
);

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
