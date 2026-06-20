import { index, jsonb, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const searchQueries = pgTable(
  "search_query",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    query: text("query").notNull(),
    filters: jsonb("filters"),
    resultCount: integer("result_count").default(0).notNull(),
    searchedAt: timestamp("searched_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("search_query_text_idx").on(table.query),
    index("search_query_searched_at_idx").on(table.searchedAt),
  ]
);

export type SearchQuery = typeof searchQueries.$inferSelect;
export type NewSearchQuery = typeof searchQueries.$inferInsert;
