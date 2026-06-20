"use client";

import { NotificationCard } from "./notification-card";

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

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function NotificationList({
  notifications,
  onMarkAsRead,
  onDelete,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No notifications</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
