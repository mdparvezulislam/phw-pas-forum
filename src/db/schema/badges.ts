import { boolean, pgTable, text } from "drizzle-orm/pg-core";

export const badgeCategories = [
  "POSTING",
  "COMMUNITY",
  "MARKETPLACE",
  "PREMIUM",
  "MODERATOR",
  "ACHIEVEMENT",
  "SPECIAL_EVENT",
] as const;
export type BadgeCategory = (typeof badgeCategories)[number];

export const badges = pgTable("badge", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(),
  description: text("description"),
  color: text("color").default("slate").notNull(),
  category: text("category", { enum: badgeCategories })
    .$type<BadgeCategory>()
    .default("ACHIEVEMENT")
    .notNull(),
  isSystem: boolean("is_system").default(false).notNull(),
});

export type Badge = typeof badges.$inferSelect;
export type NewBadge = typeof badges.$inferInsert;
