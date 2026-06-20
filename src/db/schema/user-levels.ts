import { integer, pgTable, text } from "drizzle-orm/pg-core";

export const userLevels = pgTable("user_level", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  minPoints: integer("min_points").notNull(),
});

export type UserLevel = typeof userLevels.$inferSelect;
export type NewUserLevel = typeof userLevels.$inferInsert;
