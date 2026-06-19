import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { forums } from "./forums";
import { users } from "./users";

export const threadStatus = [
  "DRAFT",
  "PENDING",
  "PUBLISHED",
  "ARCHIVED",
  "DELETED",
] as const;
export type ThreadStatus = (typeof threadStatus)[number];

export const threadVisibility = ["PUBLIC", "PRIVATE", "PREMIUM"] as const;
export type ThreadVisibility = (typeof threadVisibility)[number];

export const threads = pgTable("thread", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  forumId: text("forum_id")
    .notNull()
    .references(() => forums.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  status: text("status", { enum: threadStatus })
    .$type<ThreadStatus>()
    .default("PUBLISHED")
    .notNull(),
  visibility: text("visibility", { enum: threadVisibility })
    .$type<ThreadVisibility>()
    .default("PUBLIC")
    .notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  isLocked: boolean("is_locked").default(false).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isSolved: boolean("is_solved").default(false).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  replyCount: integer("reply_count").default(0).notNull(),
  reactionCount: integer("reaction_count").default(0).notNull(),
  watchCount: integer("watch_count").default(0).notNull(),
  bookmarkCount: integer("bookmark_count").default(0).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  publishedAt: timestamp("published_at", { mode: "date" }),
});

export type Thread = typeof threads.$inferSelect;
export type NewThread = typeof threads.$inferInsert;
