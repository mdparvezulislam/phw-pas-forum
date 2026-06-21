import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const userBans = pgTable(
  "user_ban",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    reason: text("reason").notNull(),
    bannedBy: text("banned_by")
      .notNull()
      .references(() => users.id, { onDelete: "set null" }),
    isPermanent: boolean("is_permanent").default(false).notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }),
    isActive: boolean("is_active").default(true).notNull(),
    liftedBy: text("lifted_by").references(() => users.id, {
      onDelete: "set null",
    }),
    liftedAt: timestamp("lifted_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("user_ban_user_idx").on(table.userId),
    index("user_ban_active_idx").on(table.isActive),
  ],
);

export type UserBan = typeof userBans.$inferSelect;
export type NewUserBan = typeof userBans.$inferInsert;
