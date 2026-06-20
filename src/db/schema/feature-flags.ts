import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const featureFlags = pgTable(
  "feature_flag",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    key: text("key").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    enabled: boolean("enabled").default(false).notNull(),
    isKillSwitch: boolean("is_kill_switch").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("feature_flag_key_idx").on(table.key),
    index("feature_flag_enabled_idx").on(table.enabled),
  ],
);

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type NewFeatureFlag = typeof featureFlags.$inferInsert;
