import { integer, pgTable, text } from "drizzle-orm/pg-core";

export const conditionTypes = [
  "POST_COUNT",
  "THREAD_COUNT",
  "REACTION_COUNT",
  "REPUTATION_COUNT",
  "JOIN_DURATION_DAYS",
  "HELPFUL_COUNT",
] as const;
export type ConditionType = (typeof conditionTypes)[number];

export const trophies = pgTable("trophy", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  icon: text("icon").notNull(),
  reputationReward: integer("reputation_reward").default(0).notNull(),
  conditionType: text("condition_type", { enum: conditionTypes })
    .$type<ConditionType>()
    .notNull(),
  conditionValue: integer("condition_value").notNull(),
});

export type Trophy = typeof trophies.$inferSelect;
export type NewTrophy = typeof trophies.$inferInsert;
