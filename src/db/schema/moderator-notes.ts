import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const moderatorNotes = pgTable(
  "moderator_note",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    targetUserId: text("target_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    moderatorId: text("moderator_id")
      .notNull()
      .references(() => users.id, { onDelete: "set null" }),
    note: text("note").notNull(),
    visibility: text("visibility").default("STAFF_ONLY").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("mod_note_target_idx").on(table.targetUserId),
    index("mod_note_moderator_idx").on(table.moderatorId),
  ],
);

export type ModeratorNote = typeof moderatorNotes.$inferSelect;
export type NewModeratorNote = typeof moderatorNotes.$inferInsert;
