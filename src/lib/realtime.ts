import "server-only";

export interface RealtimeMessage {
  type: string;
  payload: Record<string, unknown>;
}

export type MessageHandler = (message: RealtimeMessage) => void;

class RealtimeService {
  private channels: Map<string, Set<MessageHandler>> = new Map();

  subscribe(channel: string, handler: MessageHandler): () => void {
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }

    this.channels.get(channel)!.add(handler);

    return () => {
      const channelHandlers = this.channels.get(channel);
      if (channelHandlers) {
        channelHandlers.delete(handler);
        if (channelHandlers.size === 0) {
          this.channels.delete(channel);
        }
      }
    };
  }

  publish(channel: string, message: RealtimeMessage): void {
    const channelHandlers = this.channels.get(channel);
    if (channelHandlers) {
      for (const handler of channelHandlers) {
        try {
          handler(message);
        } catch (error) {
          console.error(
            `Realtime handler error for channel ${channel}:`,
            error,
          );
        }
      }
    }
  }

  publishNotification(
    userId: string,
    notification: {
      id: string;
      type: string;
      title: string;
      message?: string;
      entityId?: string;
      entityType?: string;
      actorId?: string;
      createdAt: Date;
    },
  ): void {
    this.publish(`user:${userId}`, {
      type: "NOTIFICATION",
      payload: notification,
    });

    this.publish("global:notifications", {
      type: "NOTIFICATION_NEW",
      payload: { userId, notification },
    });
  }

  publishUnreadCount(userId: string, count: number): void {
    this.publish(`user:${userId}`, {
      type: "UNREAD_COUNT",
      payload: { count },
    });
  }

  broadcastAnnouncement(announcement: {
    id: string;
    title: string;
    content: string;
    type: string;
  }): void {
    this.publish("global:announcements", {
      type: "ANNOUNCEMENT",
      payload: announcement,
    });
  }
}

export const realtimeService = new RealtimeService();

export function getUserChannel(userId: string): string {
  return `user:${userId}`;
}

export function getGlobalChannel(): string {
  return "global:notifications";
}
