import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { posts } from "./posts";
import { users } from "./users";

export const postReportStatus = ["OPEN", "REVIEWING", "RESOLVED", "REJECTED"] as const;
export type PostReportStatus = (typeof postReportStatus)[number];

export const postReportReason = ["SPAM", "ABUSE", "SCAM", "DUPLICATE", "OTHER"] as const;
export type PostReportReason = (typeof postReportReason)[number];

export const postReports = pgTable(
  "post_report",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    reporterId: text("reporter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reason: text("reason", { enum: postReportReason })
      .$type<PostReportReason>()
      .notNull(),
    description: text("description"),
    status: text("status", { enum: postReportStatus })
      .$type<PostReportStatus>()
      .default("OPEN")
      .notNull(),
    resolvedBy: text("resolved_by").references(() => users.id, {
      onDelete: "set null",
    }),
    resolvedAt: timestamp("resolved_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("post_report_post_id_idx").on(table.postId),
    index("post_report_status_idx").on(table.status),
  ],
);

export type PostReport = typeof postReports.$inferSelect;
export type NewPostReport = typeof postReports.$inferInsert;
