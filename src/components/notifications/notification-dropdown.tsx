"use client";

import Link from "next/link";
import { formatDateRelative } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  message?: string | null;
  entityId?: string | null;
  entityType?: string | null;
  actorId?: string | null;
  isRead: boolean;
  createdAt: Date;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
}

export function NotificationDropdown({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationDropdownProps) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "THREAD_REPLY":
        return "💬";
      case "THREAD_MENTION":
        return "@";
      case "THREAD_QUOTE":
        return "❝";
      case "THREAD_REACTION":
        return "❤️";
      case "BADGE_EARNED":
        return "🏆";
      case "TROPHY_UNLOCKED":
        return "🏅";
      case "LEVEL_UP":
        return "⬆️";
      case "SYSTEM_ANNOUNCEMENT":
        return "📢";
      default:
        return "🔔";
    }
  };

  const getLink = (notification: Notification) => {
    if (notification.entityType === "POST" && notification.entityId) {
      return `/forums/thread/post/${notification.entityId}`;
    }
    if (notification.entityType === "THREAD" && notification.entityId) {
      return `/forums/thread/${notification.entityId}`;
    }
    return "/notifications";
  };

  return (
    <div className="w-80 md:w-96 border rounded-lg bg-background shadow-lg">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold">Notifications</h3>
        {unreadCount > 0 && onMarkAllAsRead && (
          <button
            onClick={onMarkAllAsRead}
            className="text-sm text-primary hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-muted-foreground">
            No notifications
          </div>
        ) : (
          <ul className="divide-y">
            {notifications.slice(0, 10).map((notification) => (
              <li
                key={notification.id}
                className={`px-4 py-3 hover:bg-muted/50 transition-colors ${
                  !notification.isRead ? "bg-muted/30" : ""
                }`}
              >
                <Link
                  href={getLink(notification)}
                  className="block"
                  onClick={() => {
                    if (!notification.isRead && onMarkAsRead) {
                      onMarkAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{getIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${
                          !notification.isRead ? "font-semibold" : ""
                        }`}
                      >
                        {notification.title}
                      </p>
                      {notification.message && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {notification.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateRelative(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <span className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t px-4 py-3">
        <Link
          href="/notifications"
          className="text-sm text-primary hover:underline block text-center"
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
}
