import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const userWarnings = pgTable(
  "user_warning",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    moderatorId: text("moderator_id")
      .notNull()
      .references(() => users.id, { onDelete: "set null" }),
    reason: text("reason").notNull(),
    points: integer("points").default(0).notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }),
    isActive: integer("is_active").default(1).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("user_warning_user_idx").on(table.userId),
    index("user_warning_active_idx").on(table.isActive),
  ],
);

export type UserWarning = typeof userWarnings.$inferSelect;
export type NewUserWarning = typeof userWarnings.$inferInsert;
