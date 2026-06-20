import { pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { badges } from "./badges";
import { users } from "./users";

export const userBadges = pgTable(
  "user_badge",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    badgeId: text("badge_id")
      .notNull()
      .references(() => badges.id, { onDelete: "cascade" }),
    earnedAt: timestamp("earned_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    unique("user_badge_unique").on(table.userId, table.badgeId),
  ],
);

export type UserBadge = typeof userBadges.$inferSelect;
export type NewUserBadge = typeof userBadges.$inferInsert;
