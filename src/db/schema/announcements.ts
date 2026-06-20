import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const announcementType = [
                "INFO",
                "WARNING",
                "SUCCESS",
                "DANGER",
] as const;

export type AnnouncementType = (typeof announcementType)[number];

export const announcements = pgTable(
                "announcement",
                {
                                id: text("id")
                                                .primaryKey()
                                                .$defaultFn(() => crypto.randomUUID()),
                                title: text("title").notNull(),
                                content: text("content").notNull(),
                                type: text("type", { enum: announcementType })
                                                .$type<AnnouncementType>()
                                                .default("INFO")
                                                .notNull(),
                                isActive: boolean("is_active").default(true).notNull(),
                                isPermanent: boolean("is_permanent").default(false).notNull(),
                                startsAt: timestamp("starts_at", { mode: "date" }),
                                endsAt: timestamp("ends_at", { mode: "date" }),
                                createdBy: text("created_by").references(() => users.id, {
                                                onDelete: "set null",
                                }),
                                createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
                                updatedAt: timestamp("updated_at", { mode: "date" })
                                                .defaultNow()
                                                .notNull()
                                                .$onUpdate(() => new Date()),
                },
                (table) => [
                                index("announcement_active_idx").on(table.isActive),
                                index("announcement_dates_idx").on(table.startsAt, table.endsAt),
                ],
);

export type Announcement = typeof announcements.$inferSelect;
export type NewAnnouncement = typeof announcements.$inferInsert;
