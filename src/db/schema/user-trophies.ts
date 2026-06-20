import { pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { trophies } from "./trophies";
import { users } from "./users";

export const userTrophies = pgTable(
  "user_trophy",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    trophyId: text("trophy_id")
      .notNull()
      .references(() => trophies.id, { onDelete: "cascade" }),
    earnedAt: timestamp("earned_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    unique("user_trophy_unique").on(table.userId, table.trophyId),
  ],
);

export type UserTrophy = typeof userTrophies.$inferSelect;
export type NewUserTrophy = typeof userTrophies.$inferInsert;
