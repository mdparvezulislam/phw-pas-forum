import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const sellerVerificationAppStatus = [
  "UNVERIFIED",
  "PENDING",
  "VERIFIED",
  "TRUSTED",
  "TOP_SELLER",
  "SUSPENDED",
] as const;

export type SellerVerificationAppStatus = (typeof sellerVerificationAppStatus)[number];

export const sellerVerifications = pgTable("seller_verification", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sellerId: text("seller_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status", { enum: sellerVerificationAppStatus })
    .$type<SellerVerificationAppStatus>()
    .default("UNVERIFIED")
    .notNull(),
  verificationLevel: text("verification_level").default("LEVEL_1").notNull(),
  notes: text("notes"),
  verifiedBy: text("verified_by").references(() => users.id, {
    onDelete: "set null",
  }),
  verifiedAt: timestamp("verified_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type SellerVerification = typeof sellerVerifications.$inferSelect;
export type NewSellerVerification = typeof sellerVerifications.$inferInsert;
