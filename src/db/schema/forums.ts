import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { categories } from "./categories";

export const forums = pgTable("forum", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  parentForumId: text("parent_forum_id"),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  icon: text("icon"),
  bannerImage: text("banner_image"),
  position: integer("position").default(0).notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
  isLocked: boolean("is_locked").default(false).notNull(),
  isPremiumOnly: boolean("is_premium_only").default(false).notNull(),
  requiredMembershipLevel: text("required_membership_level"),
  threadCount: integer("thread_count").default(0).notNull(),
  postCount: integer("post_count").default(0).notNull(),
  lastActivityAt: timestamp("last_activity_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Forum = typeof forums.$inferSelect;
export type NewForum = typeof forums.$inferInsert;
