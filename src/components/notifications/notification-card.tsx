"use client";

import Link from "next/link";
import { formatDateRelative } from "@/lib/utils";
import { Button } from "@/components/ui";

interface Notification {
  id: string;
  type: string;
  title: string;
  message?: string | null;
  entityId?: string | null;
  entityType?: string | null;
  actorId?: string | null;
  isRead: boolean;
  readAt?: Date | null;
  createdAt: Date;
}

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationCardProps) {
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

  const getLink = () => {
    if (notification.entityType === "POST" && notification.entityId) {
      return `/forums/thread/post/${notification.entityId}`;
    }
    if (notification.entityType === "THREAD" && notification.entityId) {
      return `/forums/thread/${notification.entityId}`;
    }
    if (notification.entityType === "BADGE" && notification.entityId) {
      return `/profile/badges`;
    }
    if (notification.entityType === "TROPHY" && notification.entityId) {
      return `/profile/trophies`;
    }
    if (notification.entityType === "LEVEL" && notification.entityId) {
      return `/members/leaderboard`;
    }
    return "/notifications";
  };

  return (
    <div
      className={`border rounded-lg p-4 transition-colors hover:bg-muted/50 ${
        !notification.isRead ? "border-l-4 border-l-primary" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <span className="text-2xl">{getIcon(notification.type)}</span>

        <div className="flex-1 min-w-0">
          <Link href={getLink()} className="block">
            <h4
              className={`font-medium ${
                !notification.isRead ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {notification.title}
            </h4>
          </Link>

          {notification.message && (
            <p className="text-sm text-muted-foreground mt-1">
              {notification.message}
            </p>
          )}

          <div className="flex items-center gap-4 mt-2">
            <p className="text-xs text-muted-foreground">
              {formatDateRelative(notification.createdAt)}
            </p>

            {!notification.isRead && onMarkAsRead && (
              <Button
                variant="link"
                size="sm"
                onClick={() => onMarkAsRead(notification.id)}
                className="h-auto p-0 text-xs"
              >
                Mark as read
              </Button>
            )}

            {onDelete && (
              <Button
                variant="link"
                size="sm"
                onClick={() => onDelete(notification.id)}
                className="h-auto p-0 text-xs text-destructive"
              >
                Delete
              </Button>
            )}
          </div>
        </div>

        {!notification.isRead && (
          <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
        )}
      </div>
    </div>
  );
}
