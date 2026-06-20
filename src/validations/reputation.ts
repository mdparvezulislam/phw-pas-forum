import { z } from "zod";

export const reactionTypeEnum = z.enum([
  "LIKE",
  "LOVE",
  "THANKS",
  "HELPFUL",
  "INSIGHTFUL",
  "FIRE",
]);

export const targetTypeEnum = z.enum(["POST", "THREAD"]);

export const toggleReactionSchema = z.object({
  targetId: z.string().min(1, "Target is required"),
  targetType: targetTypeEnum,
  reactionType: reactionTypeEnum,
});

export const createBadgeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  icon: z.string().min(1, "Icon is required"),
  description: z.string().max(500).optional(),
  color: z.string().default("slate"),
  category: z
    .enum([
      "POSTING",
      "COMMUNITY",
      "MARKETPLACE",
      "PREMIUM",
      "MODERATOR",
      "ACHIEVEMENT",
      "SPECIAL_EVENT",
    ])
    .default("ACHIEVEMENT"),
  isSystem: z.boolean().default(false),
});

export const updateBadgeSchema = createBadgeSchema.partial().extend({
  id: z.string().min(1),
});

export const createTrophySchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(500).optional(),
  icon: z.string().min(1, "Icon is required"),
  reputationReward: z.number().int().min(0).default(0),
  conditionType: z.enum([
    "POST_COUNT",
    "THREAD_COUNT",
    "REACTION_COUNT",
    "REPUTATION_COUNT",
    "JOIN_DURATION_DAYS",
    "HELPFUL_COUNT",
  ]),
  conditionValue: z.number().int().min(1),
});

export const updateTrophySchema = createTrophySchema.partial().extend({
  id: z.string().min(1),
});

export const adminReputationAwardSchema = z.object({
  userId: z.string().min(1),
  points: z.number().int().min(1).max(10000),
  reason: z.string().max(500).optional(),
});

export const adminBadgeAssignSchema = z.object({
  userId: z.string().min(1),
  badgeId: z.string().min(1),
});

export const adminTrophyAssignSchema = z.object({
  userId: z.string().min(1),
  trophyId: z.string().min(1),
});

export const leaderboardTimeframeSchema = z
  .enum(["weekly", "monthly", "all-time"])
  .default("all-time");

export const leaderboardCategorySchema = z
  .enum(["reputation", "posts", "trophies", "badges"])
  .default("reputation");

export type ToggleReactionInput = z.infer<typeof toggleReactionSchema>;
export type CreateBadgeInput = z.infer<typeof createBadgeSchema>;
export type UpdateBadgeInput = z.infer<typeof updateBadgeSchema>;
export type CreateTrophyInput = z.infer<typeof createTrophySchema>;
export type UpdateTrophyInput = z.infer<typeof updateTrophySchema>;
export type AdminReputationAwardInput = z.infer<
  typeof adminReputationAwardSchema
>;
export type AdminBadgeAssignInput = z.infer<typeof adminBadgeAssignSchema>;
export type AdminTrophyAssignInput = z.infer<typeof adminTrophyAssignSchema>;
