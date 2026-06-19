import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),

  username: text("username").unique(),
  passwordHash: text("password_hash"),
  displayName: text("display_name"),
  biography: text("biography"),
  roleId: text("role_id").references(() => roles.id),
  isBanned: boolean("is_banned").default(false).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  isTwoFactorEnabled: boolean("is_two_factor_enabled").default(false).notNull(),
  lastLoginAt: timestamp("last_login_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

import { roles } from "./roles";

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
