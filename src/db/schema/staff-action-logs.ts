import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const staffActionLogs = pgTable(
  "staff_action_log",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    staffId: text("staff_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ipAddress: text("ip_address"),
    isAutomated: boolean("is_automated").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("staff_log_staff_idx").on(table.staffId),
    index("staff_log_action_idx").on(table.action),
    index("staff_log_entity_idx").on(table.entityType, table.entityId),
    index("staff_log_created_idx").on(table.createdAt),
  ],
);

export type StaffActionLog = typeof staffActionLogs.$inferSelect;
export type NewStaffActionLog = typeof staffActionLogs.$inferInsert;
