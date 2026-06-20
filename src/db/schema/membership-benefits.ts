import { pgTable, text } from "drizzle-orm/pg-core";
import { membershipPlans } from "./membership-plans";

export const membershipBenefits = pgTable("membership_benefit", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  planId: text("plan_id")
    .notNull()
    .references(() => membershipPlans.id, { onDelete: "cascade" }),
  key: text("key").notNull(), // e.g. extraPmLimit, premiumForums, etc.
  value: text("value").notNull(),
});

export type MembershipBenefit = typeof membershipBenefits.$inferSelect;
export type NewMembershipBenefit = typeof membershipBenefits.$inferInsert;
