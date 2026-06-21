import "server-only";

import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { getDatabase, schema } from "@/db";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";
import type { NewNotificationPreference } from "@/db/schema/notification-preferences";
import type { Notification, NotificationType } from "@/db/schema/notifications";
import type { AppEvent } from "@/lib/event-bus";
import {
  type BadgeEarnedEvent,
  type DisputeCreatedEvent,
  type DisputeResolvedEvent,
  type ITraderCreatedEvent,
  type LevelUpEvent,
  type ListingApprovedEvent,
  type ListingChangesRequestedEvent,
  type ListingRejectedEvent,
  type ListingReportedEvent,
  type ListingSubmittedEvent,
  type OrderAcceptedEvent,
  type OrderCancelledEvent,
  type OrderCompletedEvent,
  type OrderCreatedEvent,
  type OrderDeliveredEvent,
  type PostCreatedEvent,
  type PostMentionedEvent,
  type PostQuotedEvent,
  type ReactionCreatedEvent,
  type ReviewCreatedEvent,
  registerEventHandler,
  type SellerVerifiedEvent,
  type TrophyUnlockedEvent,
  type TrustUpdatedEvent,
} from "@/lib/event-bus";
import { realtimeService } from "@/lib/realtime";
import { auditService } from "./audit";

class NotificationService {
  constructor() {
    registerEventHandler(this.handleEvent.bind(this));
  }

  private async shouldDeliver(
    userId: string,
    type: NotificationType,
  ): Promise<boolean> {
    const prefs = await this.getPreferences(userId);
    if (!prefs) return true;

    switch (type) {
      case "THREAD_REPLY":
        return prefs.replyNotifications;
      case "THREAD_MENTION":
        return prefs.mentionNotifications;
      case "THREAD_QUOTE":
        return prefs.quoteNotifications;
      case "THREAD_REACTION":
        return prefs.reactionNotifications;
      case "BADGE_EARNED":
        return prefs.badgeNotifications;
      case "TROPHY_UNLOCKED":
        return prefs.trophyNotifications;
      case "LEVEL_UP":
        return prefs.levelUpNotifications;
      case "SYSTEM_ANNOUNCEMENT":
        return prefs.systemNotifications;
      case "ORDER_EVENT":
        return prefs.orderNotifications;
      case "DISPUTE_EVENT":
        return prefs.disputeNotifications;
      case "REVIEW_EVENT":
        return prefs.reviewNotifications;
      case "MARKETPLACE_EVENT":
        return prefs.marketplaceNotifications;
      default:
        return true;
    }
  }

  private async handleEvent(event: AppEvent): Promise<void> {
    switch (event.type) {
      case "POST_CREATED":
        await this.handlePostCreated(event);
        break;
      case "POST_MENTIONED":
        await this.handlePostMentioned(event);
        break;
      case "POST_QUOTED":
        await this.handlePostQuoted(event);
        break;
      case "REACTION_CREATED":
        await this.handleReactionCreated(event);
        break;
      case "REACTION_REMOVED":
        break;
      case "BADGE_EARNED":
        await this.handleBadgeEarned(event);
        break;
      case "TROPHY_UNLOCKED":
        await this.handleTrophyUnlocked(event);
        break;
      case "LEVEL_UP":
        await this.handleLevelUp(event);
        break;
      case "THREAD_CREATED":
        break;
      case "PRIVATE_MESSAGE":
        await this.handlePrivateMessage(event);
        break;
      case "CONVERSATION_INVITE":
        await this.handleConversationInvite(event as any);
        break;
      case "CONVERSATION_MENTION":
        await this.handleConversationMention(event as any);
        break;
      case "LISTING_SUBMITTED":
        await this.handleListingSubmitted(event as any);
        break;
      case "LISTING_APPROVED":
        await this.handleListingApproved(event as any);
        break;
      case "LISTING_REJECTED":
        await this.handleListingRejected(event as any);
        break;
      case "LISTING_CHANGES_REQUESTED":
        await this.handleListingChangesRequested(event as any);
        break;
      case "SELLER_VERIFIED":
        await this.handleSellerVerified(event as any);
        break;
      case "LISTING_REPORTED":
        await this.handleListingReported(event as any);
        break;
      case "ORDER_CREATED":
        await this.handleOrderCreated(event as OrderCreatedEvent);
        break;
      case "ORDER_ACCEPTED":
        await this.handleOrderAccepted(event as OrderAcceptedEvent);
        break;
      case "ORDER_DELIVERED":
        await this.handleOrderDelivered(event as OrderDeliveredEvent);
        break;
      case "ORDER_COMPLETED":
        await this.handleOrderCompleted(event as OrderCompletedEvent);
        break;
      case "ORDER_CANCELLED":
        await this.handleOrderCancelled(event as OrderCancelledEvent);
        break;
      case "DISPUTE_CREATED":
        await this.handleDisputeCreated(event as DisputeCreatedEvent);
        break;
      case "DISPUTE_RESOLVED":
        await this.handleDisputeResolved(event as DisputeResolvedEvent);
        break;
      case "REVIEW_CREATED":
        await this.handleReviewCreated(event as ReviewCreatedEvent);
        break;
      case "ITRADER_CREATED":
        await this.handleITraderCreated(event as ITraderCreatedEvent);
        break;
      case "TRUST_UPDATED":
        await this.handleTrustUpdated(event as TrustUpdatedEvent);
        break;
    }
  }

  private async handlePostCreated(event: PostCreatedEvent): Promise<void> {
    const db = getDatabase();
    const thread = await db.query.threads.findFirst({
      where: (t, { eq }) => eq(t.id, event.threadId),
      with: { author: true },
    });

    if (!thread?.author?.id || thread.author.id === event.actorId) {
      return;
    }

    const userId = thread.author.id;
    const type: NotificationType = "THREAD_REPLY";
    const deliver = await this.shouldDeliver(userId, type);
    if (!deliver) return;

    const [notif] = await db
      .insert(schema.notifications)
      .values({
        userId,
        type,
        title: `New reply in "${event.threadTitle}"`,
        message: `Someone replied to your thread`,
        entityId: event.postId,
        entityType: "POST",
        actorId: event.actorId,
      })
      .returning();

    realtimeService.publishNotification(userId, notif as any);
    const count = await this.getUnreadCount(userId);
    realtimeService.publishUnreadCount(userId, count);
  }

  private async handlePostMentioned(event: PostMentionedEvent): Promise<void> {
    const db = getDatabase();
    const userId = event.mentionedUserId;
    const type: NotificationType = "THREAD_MENTION";
    const deliver = await this.shouldDeliver(userId, type);
    if (!deliver) return;

    const [notif] = await db
      .insert(schema.notifications)
      .values({
        userId,
        type,
        title: `You were mentioned in a post`,
        message: `Someone mentioned you in a post`,
        entityId: event.postId,
        entityType: "POST",
        actorId: event.actorId,
      })
      .returning();

    realtimeService.publishNotification(userId, notif as any);
    const count = await this.getUnreadCount(userId);
    realtimeService.publishUnreadCount(userId, count);
  }

  private async handlePostQuoted(event: PostQuotedEvent): Promise<void> {
    const db = getDatabase();
    const userId = event.quotedUserId;
    const type: NotificationType = "THREAD_QUOTE";
    const deliver = await this.shouldDeliver(userId, type);
    if (!deliver) return;

    const [notif] = await db
      .insert(schema.notifications)
      .values({
        userId,
        type,
        title: `Someone quoted your post`,
        message: `Someone quoted your post in a reply`,
        entityId: event.postId,
        entityType: "POST",
        actorId: event.actorId,
      })
      .returning();

    realtimeService.publishNotification(userId, notif as any);
    const count = await this.getUnreadCount(userId);
    realtimeService.publishUnreadCount(userId, count);
  }

  private async handleReactionCreated(
    event: ReactionCreatedEvent,
  ): Promise<void> {
    const db = getDatabase();
    if (!event.targetAuthorId || event.targetAuthorId === event.actorId) {
      return;
    }

    const userId = event.targetAuthorId;
    const type: NotificationType = "THREAD_REACTION";
    const deliver = await this.shouldDeliver(userId, type);
    if (!deliver) return;

    const reactionMessages: Record<string, string> = {
      LIKE: "liked your post",
      LOVE: "loved your post",
      THANKS: "thanked your post",
      HELPFUL: "marked your post as helpful",
      INSIGHTFUL: "found your post insightful",
      FIRE: "is on fire about your post",
    };

    const [notif] = await db
      .insert(schema.notifications)
      .values({
        userId,
        type,
        title: `New reaction on your ${event.targetType.toLowerCase()}`,
        message: reactionMessages[event.reactionType] || "reacted to your post",
        entityId: event.targetId,
        entityType: event.targetType,
        actorId: event.actorId,
      })
      .returning();

    realtimeService.publishNotification(userId, notif as any);
    const count = await this.getUnreadCount(userId);
    realtimeService.publishUnreadCount(userId, count);
  }

  private async handleBadgeEarned(event: BadgeEarnedEvent): Promise<void> {
    const db = getDatabase();
    const userId = event.userId;
    const type: NotificationType = "BADGE_EARNED";
    const deliver = await this.shouldDeliver(userId, type);
    if (!deliver) return;

    const [notif] = await db
      .insert(schema.notifications)
      .values({
        userId,
        type,
        title: `Badge earned: ${event.badgeName}`,
        message: "Congratulations! You've earned a new badge",
        entityId: event.badgeId,
        entityType: "BADGE",
      })
      .returning();

    realtimeService.publishNotification(userId, notif as any);
    const count = await this.getUnreadCount(userId);
    realtimeService.publishUnreadCount(userId, count);

    await auditService.log(null, AUDIT_ACTIONS.BADGE_EARNED, {
      resource: "badge",
      resourceId: event.badgeId,
      metadata: { userId: event.userId, badgeSlug: event.badgeSlug },
    });
  }

  private async handleTrophyUnlocked(
    event: TrophyUnlockedEvent,
  ): Promise<void> {
    const db = getDatabase();
    const userId = event.userId;
    const type: NotificationType = "TROPHY_UNLOCKED";
    const deliver = await this.shouldDeliver(userId, type);
    if (!deliver) return;

    const [notif] = await db
      .insert(schema.notifications)
      .values({
        userId,
        type,
        title: `Trophy unlocked: ${event.trophyTitle}`,
        message: "Congratulations! You've unlocked a new trophy",
        entityId: event.trophyId,
        entityType: "TROPHY",
      })
      .returning();

    realtimeService.publishNotification(userId, notif as any);
    const count = await this.getUnreadCount(userId);
    realtimeService.publishUnreadCount(userId, count);

    await auditService.log(event.actorId, AUDIT_ACTIONS.TROPHY_UNLOCKED, {
      resource: "trophy",
      resourceId: event.trophyId,
      metadata: { userId: event.userId, trophyTitle: event.trophyTitle },
    });
  }

  private async handleLevelUp(event: LevelUpEvent): Promise<void> {
    const db = getDatabase();
    const userId = event.userId;
    const type: NotificationType = "LEVEL_UP";
    const deliver = await this.shouldDeliver(userId, type);
    if (!deliver) return;

    const [notif] = await db
      .insert(schema.notifications)
      .values({
        userId,
        type,
        title: `Level up: ${event.levelName}`,
        message: `Congratulations! You've reached level ${event.levelName} with ${event.newPoints} reputation points`,
        entityId: event.levelId,
        entityType: "LEVEL",
      })
      .returning();

    realtimeService.publishNotification(userId, notif as any);
    const count = await this.getUnreadCount(userId);
    realtimeService.publishUnreadCount(userId, count);

    await auditService.log(event.actorId, AUDIT_ACTIONS.LEVEL_UP, {
      resource: "level",
      resourceId: event.levelId,
      metadata: { userId: event.userId, levelName: event.levelName },
    });
  }

  private async handlePrivateMessage(event: any): Promise<void> {
    const db = getDatabase();
    const participants = await db.query.conversationParticipants.findMany({
      where: (p, { and, eq, ne }) =>
        and(
          eq(p.conversationId, event.conversationId),
          ne(p.userId, event.actorId),
          eq(p.isLeft, false),
          eq(p.isMuted, false),
        ),
    });

    const sender = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, event.actorId),
    });
    const senderName = sender?.displayName ?? sender?.username ?? "Someone";

    const messageObj = await db.query.conversationMessages.findFirst({
      where: (m, { eq }) => eq(m.id, event.messageId),
      with: { conversation: true } as any,
    });
    if (!messageObj) return;

    const title = (messageObj as any).conversation?.title
      ? `New message in "${(messageObj as any).conversation.title}"`
      : `New message from ${senderName}`;

    // NOTE: PRIVATE_MESSAGE preference gating is not part of Phase 8 requirements yet.
    // Keep delivery as-is but still publish realtime events.
    for (const part of participants) {
      const [notif] = await db
        .insert(schema.notifications)
        .values({
          userId: part.userId,
          type: "PRIVATE_MESSAGE",
          title,
          message: `You received a new private message`,
          entityId: event.messageId,
          entityType: "CONVERSATION_MESSAGE",
          actorId: event.actorId,
        })
        .returning();

      realtimeService.publishNotification(part.userId, notif as any);

      const count = await this.getUnreadCount(part.userId);
      realtimeService.publishUnreadCount(part.userId, count);
    }
  }

  private async handleConversationInvite(event: any): Promise<void> {
    const db = getDatabase();
    const sender = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, event.actorId),
    });
    const senderName = sender?.displayName ?? sender?.username ?? "Someone";

    const [notif] = await db
      .insert(schema.notifications)
      .values({
        userId: event.userId,
        type: "CONVERSATION_INVITE",
        title: `Added to conversation`,
        message: `${senderName} added you to a conversation`,
        entityId: event.conversationId,
        entityType: "CONVERSATION",
        actorId: event.actorId,
      })
      .returning();

    realtimeService.publishNotification(event.userId, notif as any);

    const count = await this.getUnreadCount(event.userId);
    realtimeService.publishUnreadCount(event.userId, count);
  }

  private async handleConversationMention(event: any): Promise<void> {
    const db = getDatabase();
    const sender = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, event.actorId),
    });
    const senderName = sender?.displayName ?? sender?.username ?? "Someone";

    const [notif] = await db
      .insert(schema.notifications)
      .values({
        userId: event.mentionedUserId,
        type: "CONVERSATION_MENTION",
        title: `Mentioned in conversation`,
        message: `${senderName} mentioned you in a conversation message`,
        entityId: event.messageId,
        entityType: "CONVERSATION_MESSAGE",
        actorId: event.actorId,
      })
      .returning();

    realtimeService.publishNotification(event.mentionedUserId, notif as any);

    const count = await this.getUnreadCount(event.mentionedUserId);
    realtimeService.publishUnreadCount(event.mentionedUserId, count);
  }

  async getNotifications(
    userId: string,
    options?: {
      type?: NotificationType;
      isRead?: boolean;
      limit?: number;
      offset?: number;
    },
  ): Promise<Notification[]> {
    const db = getDatabase();
    const conditions: any[] = [eq(schema.notifications.userId, userId)];

    if (options?.type) {
      conditions.push(eq(schema.notifications.type, options.type));
    }

    if (options?.isRead !== undefined) {
      conditions.push(eq(schema.notifications.isRead, options.isRead));
    }

    const where = and(...conditions);

    return db.query.notifications.findMany({
      where,
      orderBy: [desc(schema.notifications.createdAt)],
      limit: options?.limit ?? 20,
      offset: options?.offset ?? 0,
    }) as Promise<Notification[]>;
  }

  async getUnreadCount(userId: string): Promise<number> {
    const db = getDatabase();
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.notifications)
      .where(
        and(
          eq(schema.notifications.userId, userId),
          eq(schema.notifications.isRead, false),
        ),
      )
      .then((r) => Number(r[0].count));
    return result;
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const db = getDatabase();
    await db
      .update(schema.notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(schema.notifications.id, notificationId),
          eq(schema.notifications.userId, userId),
        ),
      );

    const count = await this.getUnreadCount(userId);
    realtimeService.publishUnreadCount(userId, count);
  }

  async markAllAsRead(userId: string): Promise<void> {
    const db = getDatabase();
    await db
      .update(schema.notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(schema.notifications.userId, userId),
          eq(schema.notifications.isRead, false),
        ),
      );

    const count = await this.getUnreadCount(userId);
    realtimeService.publishUnreadCount(userId, count);
  }

  async deleteNotification(
    notificationId: string,
    userId: string,
  ): Promise<void> {
    const db = getDatabase();
    await db
      .delete(schema.notifications)
      .where(
        and(
          eq(schema.notifications.id, notificationId),
          eq(schema.notifications.userId, userId),
        ),
      );
  }

  async getPreferences(userId: string) {
    const db = getDatabase();
    let prefs = await db.query.notificationPreferences.findFirst({
      where: (p, { eq }) => eq(p.userId, userId),
    });

    if (!prefs) {
      const [created] = await db
        .insert(schema.notificationPreferences)
        .values({ userId })
        .returning();
      prefs = created;
    }

    return prefs;
  }

  async updatePreferences(
    userId: string,
    updates: Partial<NewNotificationPreference>,
  ) {
    const db = getDatabase();
    await db
      .update(schema.notificationPreferences)
      .set(updates)
      .where(eq(schema.notificationPreferences.userId, userId));
  }

  private async handleListingSubmitted(
    event: ListingSubmittedEvent,
  ): Promise<void> {
    const db = getDatabase();
    const thread = await db.query.threads.findFirst({
      where: (t, { eq }) => eq(t.id, event.listingId),
    });
    if (!thread) return;

    const userId = thread.authorId;
    const type: NotificationType = "MARKETPLACE_EVENT";
    const deliver = await this.shouldDeliver(userId, type);
    if (!deliver) return;

    const [notif] = await db
      .insert(schema.notifications)
      .values({
        userId,
        type,
        title: "Listing Submitted",
        message: `Your listing for "${thread.title}" has been submitted and is under review.`,
        entityId: event.listingId,
        entityType: "THREAD",
        actorId: event.actorId,
      })
      .returning();

    realtimeService.publishNotification(userId, notif as any);
    const count = await this.getUnreadCount(userId);
    realtimeService.publishUnreadCount(userId, count);
  }

  private async handleListingApproved(
    event: ListingApprovedEvent,
  ): Promise<void> {
    const db = getDatabase();
    const thread = await db.query.threads.findFirst({
      where: (t, { eq }) => eq(t.id, event.listingId),
    });
    if (!thread) return;

    const userId = thread.authorId;
    const type: NotificationType = "MARKETPLACE_EVENT";
    const deliver = await this.shouldDeliver(userId, type);
    if (!deliver) return;

    const [notif] = await db
      .insert(schema.notifications)
      .values({
        userId,
        type,
        title: "Listing Approved 🚀",
        message: `Your listing for "${thread.title}" has been approved and is now live!`,
        entityId: event.listingId,
        entityType: "THREAD",
        actorId: event.actorId,
      })
      .returning();

    realtimeService.publishNotification(userId, notif as any);
    const count = await this.getUnreadCount(userId);
    realtimeService.publishUnreadCount(userId, count);
  }

  private async handleListingRejected(
    event: ListingRejectedEvent,
  ): Promise<void> {
    const db = getDatabase();
    const thread = await db.query.threads.findFirst({
      where: (t, { eq }) => eq(t.id, event.listingId),
    });
    if (!thread) return;

    const sub = await db.query.marketplaceSubmissions.findFirst({
      where: (s, { eq }) => eq(s.id, event.submissionId),
    });

    const userId = thread.authorId;
    const type: NotificationType = "MARKETPLACE_EVENT";
    const deliver = await this.shouldDeliver(userId, type);
    if (!deliver) return;

    const reasonText = sub?.rejectionReason
      ? ` Reason: ${sub.rejectionReason}`
      : "";
    const [notif] = await db
      .insert(schema.notifications)
      .values({
        userId,
        type,
        title: "Listing Rejected ❌",
        message: `Your listing for "${thread.title}" has been rejected.${reasonText}`,
        entityId: event.listingId,
        entityType: "THREAD",
        actorId: event.actorId,
      })
      .returning();

    realtimeService.publishNotification(userId, notif as any);
    const count = await this.getUnreadCount(userId);
    realtimeService.publishUnreadCount(userId, count);
  }

  private async handleListingChangesRequested(
    event: ListingChangesRequestedEvent,
  ): Promise<void> {
    const db = getDatabase();
    const thread = await db.query.threads.findFirst({
      where: (t, { eq }) => eq(t.id, event.listingId),
    });
    if (!thread) return;

    const sub = await db.query.marketplaceSubmissions.findFirst({
      where: (s, { eq }) => eq(s.id, event.submissionId),
    });

    const userId = thread.authorId;
    const type: NotificationType = "MARKETPLACE_EVENT";
    const deliver = await this.shouldDeliver(userId, type);
    if (!deliver) return;

    const notesText = sub?.notes ? ` Details: ${sub.notes}` : "";
    const [notif] = await db
      .insert(schema.notifications)
      .values({
        userId,
        type,
        title: "Changes Requested ⚠️",
        message: `Changes have been requested on your listing "${thread.title}".${notesText}`,
        entityId: event.listingId,
        entityType: "THREAD",
        actorId: event.actorId,
      })
      .returning();

    realtimeService.publishNotification(userId, notif as any);
    const count = await this.getUnreadCount(userId);
    realtimeService.publishUnreadCount(userId, count);
  }

  private async handleSellerVerified(
    event: SellerVerifiedEvent,
  ): Promise<void> {
    const db = getDatabase();
    const userId = event.sellerId;
    const type: NotificationType = "MARKETPLACE_EVENT";
    const deliver = await this.shouldDeliver(userId, type);
    if (!deliver) return;

    const [notif] = await db
      .insert(schema.notifications)
      .values({
        userId,
        type,
        title: "Seller Verification Updated",
        message: `Your seller verification status has been updated to: ${event.status}`,
        entityId: event.sellerId,
        entityType: "USER",
        actorId: event.actorId,
      })
      .returning();

    realtimeService.publishNotification(userId, notif as any);
    const count = await this.getUnreadCount(userId);
    realtimeService.publishUnreadCount(userId, count);
  }

  private async handleListingReported(
    event: ListingReportedEvent,
  ): Promise<void> {
    const db = getDatabase();
    const thread = await db.query.threads.findFirst({
      where: (t, { eq }) => eq(t.id, event.listingId),
    });
    if (!thread) return;

    const mods = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
      .where(inArray(schema.roles.name, ["MODERATOR", "ADMIN", "SUPER_ADMIN"]));

    const type: NotificationType = "MARKETPLACE_EVENT";

    for (const mod of mods) {
      const deliver = await this.shouldDeliver(mod.id, type);
      if (!deliver) continue;

      const [notif] = await db
        .insert(schema.notifications)
        .values({
          userId: mod.id,
          type,
          title: "Listing Reported 🚨",
          message: `The marketplace listing "${thread.title}" has been reported.`,
          entityId: event.listingId,
          entityType: "THREAD",
          actorId: event.actorId,
        })
        .returning();

      realtimeService.publishNotification(mod.id, notif as any);
      const count = await this.getUnreadCount(mod.id);
      realtimeService.publishUnreadCount(mod.id, count);
    }
  }

  private async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    const db = getDatabase();
    const type: NotificationType = "ORDER_EVENT";

    const sellerDeliver = await this.shouldDeliver(event.sellerId, type);
    if (sellerDeliver) {
      const [notif] = await db
        .insert(schema.notifications)
        .values({
          userId: event.sellerId,
          type,
          title: "New Order Received",
          message: `Order #${event.orderNumber} has been placed for $${(event.amount / 100).toFixed(2)}`,
          entityId: event.orderId,
          entityType: "ORDER",
          actorId: event.actorId,
        })
        .returning();
      realtimeService.publishNotification(event.sellerId, notif as any);
      const count = await this.getUnreadCount(event.sellerId);
      realtimeService.publishUnreadCount(event.sellerId, count);
    }

    const buyerDeliver = await this.shouldDeliver(event.buyerId, type);
    if (buyerDeliver) {
      const [notif] = await db
        .insert(schema.notifications)
        .values({
          userId: event.buyerId,
          type,
          title: "Order Placed",
          message: `Your order #${event.orderNumber} has been placed successfully`,
          entityId: event.orderId,
          entityType: "ORDER",
          actorId: event.actorId,
        })
        .returning();
      realtimeService.publishNotification(event.buyerId, notif as any);
      const count = await this.getUnreadCount(event.buyerId);
      realtimeService.publishUnreadCount(event.buyerId, count);
    }
  }

  private async handleOrderAccepted(event: OrderAcceptedEvent): Promise<void> {
    const db = getDatabase();
    const type: NotificationType = "ORDER_EVENT";

    const deliver = await this.shouldDeliver(event.buyerId, type);
    if (!deliver) return;

    const [notif] = await db
      .insert(schema.notifications)
      .values({
        userId: event.buyerId,
        type,
        title: "Order Accepted",
        message: `Order #${event.orderNumber} has been accepted by the seller`,
        entityId: event.orderId,
        entityType: "ORDER",
        actorId: event.actorId,
      })
      .returning();

    realtimeService.publishNotification(event.buyerId, notif as any);
    const count = await this.getUnreadCount(event.buyerId);
    realtimeService.publishUnreadCount(event.buyerId, count);
  }

  private async handleOrderDelivered(
    event: OrderDeliveredEvent,
  ): Promise<void> {
    const db = getDatabase();
    const type: NotificationType = "ORDER_EVENT";

    const deliver = await this.shouldDeliver(event.buyerId, type);
    if (!deliver) return;

    const [notif] = await db
      .insert(schema.notifications)
      .values({
        userId: event.buyerId,
        type,
        title: "Order Delivered",
        message: `Order #${event.orderNumber} has been delivered. Please review and complete`,
        entityId: event.orderId,
        entityType: "ORDER",
        actorId: event.actorId,
      })
      .returning();

    realtimeService.publishNotification(event.buyerId, notif as any);
    const count = await this.getUnreadCount(event.buyerId);
    realtimeService.publishUnreadCount(event.buyerId, count);
  }

  private async handleOrderCompleted(
    event: OrderCompletedEvent,
  ): Promise<void> {
    const db = getDatabase();
    const type: NotificationType = "ORDER_EVENT";

    const sellerDeliver = await this.shouldDeliver(event.sellerId, type);
    if (sellerDeliver) {
      const [notif] = await db
        .insert(schema.notifications)
        .values({
          userId: event.sellerId,
          type,
          title: "Order Completed",
          message: `Order #${event.orderNumber} has been completed`,
          entityId: event.orderId,
          entityType: "ORDER",
          actorId: event.actorId,
        })
        .returning();
      realtimeService.publishNotification(event.sellerId, notif as any);
      const count = await this.getUnreadCount(event.sellerId);
      realtimeService.publishUnreadCount(event.sellerId, count);
    }
  }

  private async handleOrderCancelled(
    event: OrderCancelledEvent,
  ): Promise<void> {
    const db = getDatabase();
    const type: NotificationType = "ORDER_EVENT";

    const notifyId =
      event.buyerId === event.actorId ? event.sellerId : event.buyerId;
    const deliver = await this.shouldDeliver(notifyId, type);
    if (!deliver) return;

    const [notif] = await db
      .insert(schema.notifications)
      .values({
        userId: notifyId,
        type,
        title: "Order Cancelled",
        message: `Order #${event.orderNumber} has been cancelled${event.reason ? `: ${event.reason}` : ""}`,
        entityId: event.orderId,
        entityType: "ORDER",
        actorId: event.actorId,
      })
      .returning();

    realtimeService.publishNotification(notifyId, notif as any);
    const count = await this.getUnreadCount(notifyId);
    realtimeService.publishUnreadCount(notifyId, count);
  }

  private async handleDisputeCreated(
    event: DisputeCreatedEvent,
  ): Promise<void> {
    const db = getDatabase();
    const type: NotificationType = "DISPUTE_EVENT";

    const sellerDeliver = await this.shouldDeliver(event.sellerId, type);
    if (sellerDeliver) {
      const [notif] = await db
        .insert(schema.notifications)
        .values({
          userId: event.sellerId,
          type,
          title: "Dispute Filed",
          message: `A dispute has been filed on order #${event.orderNumber}: ${event.reason}`,
          entityId: event.disputeId,
          entityType: "DISPUTE",
          actorId: event.actorId,
        })
        .returning();
      realtimeService.publishNotification(event.sellerId, notif as any);
      const count = await this.getUnreadCount(event.sellerId);
      realtimeService.publishUnreadCount(event.sellerId, count);
    }

    const mods = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
      .where(inArray(schema.roles.name, ["MODERATOR", "ADMIN", "SUPER_ADMIN"]));

    for (const mod of mods) {
      const modDeliver = await this.shouldDeliver(mod.id, type);
      if (!modDeliver) continue;

      const [notif] = await db
        .insert(schema.notifications)
        .values({
          userId: mod.id,
          type,
          title: "New Dispute Requires Review",
          message: `Dispute on order #${event.orderNumber}: ${event.reason}`,
          entityId: event.disputeId,
          entityType: "DISPUTE",
          actorId: event.actorId,
        })
        .returning();
      realtimeService.publishNotification(mod.id, notif as any);
    }
  }

  private async handleDisputeResolved(
    event: DisputeResolvedEvent,
  ): Promise<void> {
    const db = getDatabase();
    const type: NotificationType = "DISPUTE_EVENT";

    const dispute = await db.query.disputes.findFirst({
      where: (d, { eq }) => eq(d.id, event.disputeId),
    });
    if (!dispute) return;

    const notifyIds = [dispute.buyerId, dispute.sellerId];
    for (const userId of notifyIds) {
      const deliver = await this.shouldDeliver(userId, type);
      if (!deliver) continue;

      const [notif] = await db
        .insert(schema.notifications)
        .values({
          userId,
          type,
          title: "Dispute Resolved",
          message: `The dispute on order #${event.orderNumber} has been resolved: ${event.resolution}`,
          entityId: event.disputeId,
          entityType: "DISPUTE",
          actorId: event.actorId,
        })
        .returning();
      realtimeService.publishNotification(userId, notif as any);
      const count = await this.getUnreadCount(userId);
      realtimeService.publishUnreadCount(userId, count);
    }
  }

  private async handleReviewCreated(event: ReviewCreatedEvent): Promise<void> {
    const db = getDatabase();
    const type: NotificationType = "REVIEW_EVENT";

    const deliver = await this.shouldDeliver(event.sellerId, type);
    if (!deliver) return;

    const starRating = "⭐".repeat(event.rating);
    const [notif] = await db
      .insert(schema.notifications)
      .values({
        userId: event.sellerId,
        type,
        title: "New Review",
        message: `You received a ${event.rating}/5 review on your order: ${starRating}`,
        entityId: event.reviewId,
        entityType: "REVIEW",
        actorId: event.actorId,
      })
      .returning();

    realtimeService.publishNotification(event.sellerId, notif as any);
    const count = await this.getUnreadCount(event.sellerId);
    realtimeService.publishUnreadCount(event.sellerId, count);
  }

  private async handleITraderCreated(
    event: ITraderCreatedEvent,
  ): Promise<void> {
    const db = getDatabase();
    const type: NotificationType = "REVIEW_EVENT";

    const deliver = await this.shouldDeliver(event.toUserId, type);
    if (!deliver) return;

    const [notif] = await db
      .insert(schema.notifications)
      .values({
        userId: event.toUserId,
        type,
        title: "iTrader Feedback Received",
        message: `You received ${event.rating} iTrader feedback on order`,
        entityId: event.feedbackId,
        entityType: "ITRADER",
        actorId: event.actorId,
      })
      .returning();

    realtimeService.publishNotification(event.toUserId, notif as any);
    const count = await this.getUnreadCount(event.toUserId);
    realtimeService.publishUnreadCount(event.toUserId, count);
  }

  private async handleTrustUpdated(event: TrustUpdatedEvent): Promise<void> {
    const db = getDatabase();
    const type: NotificationType = "MARKETPLACE_EVENT";

    const deliver = await this.shouldDeliver(event.sellerId, type);
    if (!deliver) return;

    const [notif] = await db
      .insert(schema.notifications)
      .values({
        userId: event.sellerId,
        type,
        title: "Trust Score Updated",
        message: `Your seller trust score is now ${event.newTrustScore}`,
        entityId: event.sellerId,
        entityType: "USER",
        actorId: event.actorId,
      })
      .returning();

    realtimeService.publishNotification(event.sellerId, notif as any);
  }
}

export const notificationService = new NotificationService();
