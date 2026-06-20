import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const searchHistories = pgTable(
  "search_history",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    query: text("query").notNull(),
    searchedAt: timestamp("searched_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("search_history_user_idx").on(table.userId),
    index("search_history_searched_at_idx").on(table.searchedAt),
  ]
);

export type SearchHistory = typeof searchHistories.$inferSelect;
export type NewSearchHistory = typeof searchHistories.$inferInsert;
