import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { notificationService } from "@/services/notification";
import { NotificationList } from "@/components/notifications";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  const userId = session.user.id;
  const notifications = await notificationService.getNotifications(userId, {
    limit: 50,
  });

  const unreadCount = await notificationService.getUnreadCount(userId);

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "You're all caught up!"}
          </p>
        </div>
      </div>

      <NotificationList notifications={notifications} />
    </div>
  );
}
