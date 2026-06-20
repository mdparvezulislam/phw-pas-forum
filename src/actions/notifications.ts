"use server";

import { getDatabase, schema } from "@/db";
import { requireAuth } from "@/modules/auth/guards";
import { notificationService } from "@/services/notification";

export interface NotificationState {
                error?: string;
                success?: boolean;
}

export async function markNotificationAsRead(
                prevState: NotificationState | undefined,
                formData: FormData,
): Promise<NotificationState> {
                const user = await requireAuth();
                const notificationId = formData.get("notificationId") as string;

                if (!notificationId) {
                                return { error: "Notification ID required" };
                }

                try {
                                await notificationService.markAsRead(notificationId, user.id);
                                return { success: true };
                } catch (error) {
                                console.error("Error marking notification as read:", error);
                                return { error: "Failed to mark notification as read" };
                }
}

export async function markAllNotificationsAsRead(
                prevState: NotificationState | undefined,
): Promise<NotificationState> {
                const user = await requireAuth();

                try {
                                await notificationService.markAllAsRead(user.id);
                                return { success: true };
                } catch (error) {
                                console.error("Error marking all notifications as read:", error);
                                return { error: "Failed to mark all notifications as read" };
                }
}

export async function deleteNotification(
                prevState: NotificationState | undefined,
                formData: FormData,
): Promise<NotificationState> {
                const user = await requireAuth();
                const notificationId = formData.get("notificationId") as string;

                if (!notificationId) {
                                return { error: "Notification ID required" };
                }

                try {
                                await notificationService.deleteNotification(notificationId, user.id);
                                return { success: true };
                } catch (error) {
                                console.error("Error deleting notification:", error);
                                return { error: "Failed to delete notification" };
                }
}

export async function updateNotificationPreferences(
                prevState: NotificationState | undefined,
                formData: FormData,
): Promise<NotificationState> {
                const user = await requireAuth();

                const updates = {
                                replyNotifications: formData.get("replyNotifications") === "true",
                                quoteNotifications: formData.get("quoteNotifications") === "true",
                                mentionNotifications: formData.get("mentionNotifications") === "true",
                                reactionNotifications: formData.get("reactionNotifications") === "true",
                                badgeNotifications: formData.get("badgeNotifications") === "true",
                                trophyNotifications: formData.get("trophyNotifications") === "true",
                                levelUpNotifications: formData.get("levelUpNotifications") === "true",
                                systemNotifications: formData.get("systemNotifications") === "true",
                                announcementNotifications: formData.get("announcementNotifications") === "true",
                                emailNotifications: formData.get("emailNotifications") === "true",
                                pushNotifications: formData.get("pushNotifications") === "true",
                };

                try {
                                await notificationService.updatePreferences(user.id, updates);
                                return { success: true };
                } catch (error) {
                                console.error("Error updating preferences:", error);
                                return { error: "Failed to update preferences" };
                }
}
