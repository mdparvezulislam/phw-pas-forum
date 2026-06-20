import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { attachments } from "./attachments";

export const premiumResources = pgTable("premium_resource", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  attachmentId: text("attachment_id")
    .notNull()
    .references(() => attachments.id, { onDelete: "cascade" }),
  requiredPlan: text("required_plan").notNull(), // slug of the minimum plan required (e.g. "VIP", "VIP_PLUS")
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type PremiumResource = typeof premiumResources.$inferSelect;
export type NewPremiumResource = typeof premiumResources.$inferInsert;
