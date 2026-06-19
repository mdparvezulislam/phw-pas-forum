import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { posts } from "./posts";
import { users } from "./users";

export const postEditHistory = pgTable(
  "post_edit_history",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    previousContent: text("previous_content").notNull(),
    editedBy: text("edited_by")
      .notNull()
      .references(() => users.id, { onDelete: "set null" }),
    editedAt: timestamp("edited_at", { mode: "date" }).defaultNow().notNull(),
    reason: text("reason"),
  },
  (table) => [
    index("post_edit_history_post_id_idx").on(table.postId),
  ],
);

export type PostEditHistory = typeof postEditHistory.$inferSelect;
export type NewPostEditHistory = typeof postEditHistory.$inferInsert;
