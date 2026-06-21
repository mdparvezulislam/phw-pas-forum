import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const userReputation = pgTable("user_reputation", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  reputationPoints: integer("reputation_points").default(0).notNull(),
  trustScore: integer("trust_score").default(0).notNull(),
  helpfulCount: integer("helpful_count").default(0).notNull(),
  positiveFeedbackCount: integer("positive_feedback_count")
    .default(0)
    .notNull(),
  negativeFeedbackCount: integer("negative_feedback_count")
    .default(0)
    .notNull(),
  trophiesEarned: integer("trophies_earned").default(0).notNull(),
  badgesEarned: integer("badges_earned").default(0).notNull(),
  lastCalculatedAt: timestamp("last_calculated_at", { mode: "date" })
    .defaultNow()
    .notNull(),
});

export type UserReputation = typeof userReputation.$inferSelect;
export type NewUserReputation = typeof userReputation.$inferInsert;
