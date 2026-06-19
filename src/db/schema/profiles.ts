import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";

export const profiles = pgTable("user_profile", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  displayName: text("display_name"),
  biography: text("biography"),
  website: text("website"),
  location: text("location"),
  signature: text("signature"),
  avatarUrl: text("avatar_url"),
  avatarKey: text("avatar_key"),
  coverUrl: text("cover_url"),
  coverKey: text("cover_key"),
  status: text("status")
    .$type<"ACTIVE" | "PENDING_VERIFICATION" | "SUSPENDED" | "BANNED">()
    .default("PENDING_VERIFICATION")
    .notNull(),
  themePreference: text("theme_preference")
    .$type<"light" | "dark" | "system">()
    .default("system")
    .notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
