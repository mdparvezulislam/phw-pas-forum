import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { membershipPlans } from "./membership-plans";

export const userMemberships = pgTable("user_membership", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  planId: text("plan_id")
    .notNull()
    .references(() => membershipPlans.id, { onDelete: "cascade" }),
  status: text("status").notNull(), // ACTIVE, EXPIRED, CANCELLED, PENDING, GRACE_PERIOD
  startedAt: timestamp("started_at", { mode: "date" }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }),
  autoRenew: boolean("auto_renew").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type UserMembership = typeof userMemberships.$inferSelect;
export type NewUserMembership = typeof userMemberships.$inferInsert;
