import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const notificationPreferences = pgTable("notification_preference", {
                id: text("id")
                                .primaryKey()
                                .$defaultFn(() => crypto.randomUUID()),
                userId: text("user_id")
                                .notNull()
                                .unique()
                                .references(() => users.id, { onDelete: "cascade" }),

                // In-app notifications
                replyNotifications: boolean("reply_notifications").default(true).notNull(),
                quoteNotifications: boolean("quote_notifications").default(true).notNull(),
                mentionNotifications: boolean("mention_notifications")
                                .default(true)
                                .notNull(),
                reactionNotifications: boolean("reaction_notifications")
                                .default(true)
                                .notNull(),
                badgeNotifications: boolean("badge_notifications").default(true).notNull(),
                trophyNotifications: boolean("trophy_notifications")
                                .default(true)
                                .notNull(),
                levelUpNotifications: boolean("level_up_notifications")
                                .default(true)
                                .notNull(),

                // System notifications
                systemNotifications: boolean("system_notifications")
                                .default(true)
                                .notNull(),
                announcementNotifications: boolean("announcement_notifications")
                                .default(true)
                                .notNull(),

                // Email notifications (prepared for future)
                emailNotifications: boolean("email_notifications").default(false).notNull(),

                // Push notifications (prepared for future)
                pushNotifications: boolean("push_notifications").default(false).notNull(),

                createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
                updatedAt: timestamp("updated_at", { mode: "date" })
                                .defaultNow()
                                .notNull()
                                .$onUpdate(() => new Date()),
});

export type NotificationPreference =
                typeof notificationPreferences.$inferSelect;
export type NewNotificationPreference =
                typeof notificationPreferences.$inferInsert;
