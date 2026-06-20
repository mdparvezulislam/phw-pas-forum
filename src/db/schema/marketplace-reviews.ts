import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { marketplaceSubmissions } from "./marketplace-submissions";
import { users } from "./users";

export const marketplaceReviews = pgTable("marketplace_review", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  submissionId: text("submission_id")
    .notNull()
    .references(() => marketplaceSubmissions.id, { onDelete: "cascade" }),
  moderatorId: text("moderator_id").references(() => users.id, {
    onDelete: "set null",
  }),
  decision: text("decision").notNull(), // e.g. "APPROVE", "REJECT", etc.
  notes: text("notes").notNull(),
  wordCount: integer("word_count").default(0).notNull(),
  mediaCount: integer("media_count").default(0).notNull(),
  linkCount: integer("link_count").default(0).notNull(),
  externalUrlCount: integer("external_url_count").default(0).notNull(),
  plagiarismScore: integer("plagiarism_score").default(0).notNull(),
  riskScore: integer("risk_score").default(0).notNull(),
  complianceScore: integer("compliance_score").default(0).notNull(),
  reviewedAt: timestamp("reviewed_at", { mode: "date" }).defaultNow().notNull(),
});

export type MarketplaceReview = typeof marketplaceReviews.$inferSelect;
export type NewMarketplaceReview = typeof marketplaceReviews.$inferInsert;
