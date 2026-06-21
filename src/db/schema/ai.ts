import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  jsonb,
  bigint,
} from "drizzle-orm/pg-core";
import { users } from "./users";

// ─── AI PROMPT TEMPLATES ───
export const aiPromptTemplates = pgTable("ai_prompt_template", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  description: text("description"),
  systemPrompt: text("system_prompt").notNull(),
  userPromptTemplate: text("user_prompt_template").notNull(),
  version: integer("version").default(1).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  modelId: text("model_id").notNull(), // e.g. "gemini-2.5-flash"
  providerId: text("provider_id").notNull(), // e.g. "gemini"
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// ─── AI CONTENT MODERATION RESULTS ───
export const aiModerationResults = pgTable("ai_moderation_result", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  targetId: text("target_id").notNull(), // ID of thread, post, listing, message
  targetType: text("target_type").notNull(), // THREAD, POST, LISTING, MESSAGE
  spamScore: integer("spam_score").notNull(), // 0 to 100
  scamScore: integer("scam_score").notNull(),
  fraudScore: integer("fraud_score").notNull(),
  toxicityScore: integer("toxicity_score").notNull(),
  trustRiskScore: integer("trust_risk_score").notNull(),
  marketplaceRiskScore: integer("marketplace_risk_score").notNull(),
  decision: text("decision").notNull(), // APPROVED, FLAGGED, QUEUED, BLOCKED
  explanation: text("explanation"),
  isOverridden: boolean("is_overridden").default(false).notNull(),
  overriddenBy: text("overridden_by").references(() => users.id, {
    onDelete: "set null",
  }),
  overriddenAt: timestamp("overridden_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ─── AI TOKENS & LATENCY USAGE LOGS ───
export const aiUsageLogs = pgTable("ai_usage_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  actionType: text("action_type").notNull(), // MODERATION, SEARCH, CHAT, SUMMARY, RECOMMENDATION
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  inputTokens: integer("input_tokens").notNull(),
  outputTokens: integer("output_tokens").notNull(),
  costMicrocents: bigint("cost_microcents", { mode: "number" }).notNull(), // 1/1,000,000 of a cent (bigint number wrapper)
  latencyMs: integer("latency_ms").notNull(),
  success: boolean("success").notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ─── AI COST LIMITS (RATE CONTROLS) ───
export const aiCostLimits = pgTable("ai_cost_limit", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  targetType: text("target_type").notNull().unique(), // GLOBAL, USER, VIP
  dailyLimitMicrocents: bigint("daily_limit_microcents", {
    mode: "number",
  }).notNull(),
  monthlyLimitMicrocents: bigint("monthly_limit_microcents", {
    mode: "number",
  }).notNull(),
  currentDailyUsageMicrocents: bigint("current_daily_usage_microcents", {
    mode: "number",
  })
    .default(0)
    .notNull(),
  currentMonthlyUsageMicrocents: bigint("current_monthly_usage_microcents", {
    mode: "number",
  })
    .default(0)
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// ─── AI AUDIT LOGS ───
export const aiAuditLogs = pgTable("ai_audit_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  action: text("action").notNull(), // e.g. "moderation_auto_block", "limit_reached", "override_revert"
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }), // Initiating user or overridden moderator
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export type AIPromptTemplate = typeof aiPromptTemplates.$inferSelect;
export type AIModerationResult = typeof aiModerationResults.$inferSelect;
export type AIUsageLog = typeof aiUsageLogs.$inferSelect;
export type AICostLimit = typeof aiCostLimits.$inferSelect;
export type AIAuditLog = typeof aiAuditLogs.$inferSelect;
