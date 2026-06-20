import {
                boolean,
                index,
                pgTable,
                text,
                timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const notificationType = [
                "THREAD_REPLY",
                "THREAD_MENTION",
                "THREAD_QUOTE",
                "THREAD_REACTION",
                "BADGE_EARNED",
                "TROPHY_UNLOCKED",
                "LEVEL_UP",
                "SYSTEM_ANNOUNCEMENT",
                "MARKETPLACE_EVENT",
                "PRIVATE_MESSAGE",
                "CONVERSATION_INVITE",
                "CONVERSATION_MENTION",
] as const;

export type NotificationType = (typeof notificationType)[number];

export const notifications = pgTable(
                "notification",
                {
                                id: text("id")
                                                .primaryKey()
                                                .$defaultFn(() => crypto.randomUUID()),
                                userId: text("user_id")
                                                .notNull()
                                                .references(() => users.id, { onDelete: "cascade" }),
                                type: text("type", { enum: notificationType })
                                                .$type<NotificationType>()
                                                .notNull(),
                                title: text("title").notNull(),
                                message: text("message"),
                                entityId: text("entity_id"),
                                entityType: text("entity_type"),
                                actorId: text("actor_id").references(() => users.id, {
                                                onDelete: "set null",
                                }),
                                isRead: boolean("is_read").default(false).notNull(),
                                readAt: timestamp("read_at", { mode: "date" }),
                                createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
                },
                (table) => [
                                index("notification_user_idx").on(table.userId),
                                index("notification_user_read_idx").on(table.userId, table.isRead),
                                index("notification_type_idx").on(table.type),
                                index("notification_created_idx").on(table.createdAt),
                ],
);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
