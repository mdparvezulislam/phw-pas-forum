import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { threads } from "./threads";
import { users } from "./users";

export const marketplaceSubmissionStatus = [
  "PENDING",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "ESC_CHANGE_REQUEST",
] as const;

export type MarketplaceSubmissionStatus = (typeof marketplaceSubmissionStatus)[number];

export const marketplaceSubmissions = pgTable("marketplace_submission", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  listingId: text("listing_id")
    .notNull()
    .references(() => threads.id, { onDelete: "cascade" }),
  sellerId: text("seller_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status", { enum: marketplaceSubmissionStatus })
    .$type<MarketplaceSubmissionStatus>()
    .default("PENDING")
    .notNull(),
  price: integer("price").default(0).notNull(), // stored in cents
  paymentDetails: text("payment_details"),
  assignedModeratorId: text("assigned_moderator_id").references(() => users.id, {
    onDelete: "set null",
  }),
  submittedAt: timestamp("submitted_at", { mode: "date" }).defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at", { mode: "date" }),
  rejectionReason: text("rejection_reason"),
  notes: text("notes"),
});

export type MarketplaceSubmission = typeof marketplaceSubmissions.$inferSelect;
export type NewMarketplaceSubmission = typeof marketplaceSubmissions.$inferInsert;
