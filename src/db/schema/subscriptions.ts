import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { userMemberships } from "./user-memberships";
import { users } from "./users";

export const subscriptions = pgTable("subscription", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  membershipId: text("membership_id")
    .notNull()
    .references(() => userMemberships.id, { onDelete: "cascade" }),
  billingCycle: text("billing_cycle").notNull(), // MONTHLY, YEARLY, LIFETIME
  status: text("status").notNull(), // e.g. active, past_due, trialing, unpaid
  nextBillingDate: timestamp("next_billing_date", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
