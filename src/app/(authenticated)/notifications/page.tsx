import { Bell, CheckCheck, Inbox, Settings } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { NotificationList } from "@/components/notifications";
import { UserEmptyState } from "@/components/user";
import { auth } from "@/lib/auth";
import { notificationService } from "@/services/notification";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Your notification center",
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const userId = session.user.id;
  const notifications = await notificationService.getNotifications(userId, {
    limit: 50,
  });
  const unreadCount = await notificationService.getUnreadCount(userId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "You're all caught up!"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/settings/notifications"
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            <Settings className="h-4 w-4" />
            Preferences
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 ? (
        <div className="overflow-hidden rounded-xl border bg-card">
          <NotificationList notifications={notifications} />
        </div>
      ) : (
        <UserEmptyState type="no-notifications" />
      )}
    </div>
  );
}
