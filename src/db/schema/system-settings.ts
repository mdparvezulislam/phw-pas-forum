import { boolean, index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const systemSettings = pgTable(
  "system_setting",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    key: text("key").notNull().unique(),
    value: jsonb("value").notNull(),
    category: text("category").notNull(),
    description: text("description"),
    isEncrypted: boolean("is_encrypted").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("setting_key_idx").on(table.key),
    index("setting_category_idx").on(table.category),
  ],
);

export type SystemSetting = typeof systemSettings.$inferSelect;
export type NewSystemSetting = typeof systemSettings.$inferInsert;
