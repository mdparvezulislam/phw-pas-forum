import { index, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { posts } from "./posts";
import { threads } from "./threads";
import { users } from "./users";

export const reactionType = [
  "LIKE",
  "LOVE",
  "THANKS",
  "HELPFUL",
  "INSIGHTFUL",
  "FIRE",
] as const;
export type ReactionType = (typeof reactionType)[number];

export const reactions = pgTable(
  "reaction",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetId: text("target_id").notNull(),
    targetType: text("target_type", { enum: ["POST", "THREAD"] }).notNull(),
    reactionType: text("reaction_type", { enum: reactionType })
      .$type<ReactionType>()
      .notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    unique("reaction_user_target_unique").on(
      table.userId,
      table.targetId,
      table.targetType,
    ),
    index("reaction_target_idx").on(table.targetId, table.targetType),
    index("reaction_user_idx").on(table.userId),
  ],
);

export type Reaction = typeof reactions.$inferSelect;
export type NewReaction = typeof reactions.$inferInsert;
