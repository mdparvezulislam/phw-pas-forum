import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const marketplaceCategories = pgTable(
  "marketplace_category",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    description: text("description"),
    icon: text("icon"),
    position: integer("position").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("marketplace_category_position_idx").on(table.position)],
);

export type MarketplaceCategory = typeof marketplaceCategories.$inferSelect;
export type NewMarketplaceCategory = typeof marketplaceCategories.$inferInsert;
