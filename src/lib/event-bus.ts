import "server-only";

import type { NotificationType } from "@/db/schema/notifications";

export type AppEvent =
                | ThreadCreatedEvent
                | ThreadDeletedEvent
                | ThreadPinnedEvent
                | ThreadLockedEvent
                | PostCreatedEvent
                | PostDeletedEvent
                | PostMentionedEvent
                | PostQuotedEvent
                | ReactionCreatedEvent
                | ReactionRemovedEvent
                | BadgeEarnedEvent
                | TrophyUnlockedEvent
                | LevelUpEvent
                | SystemAnnouncementEvent
                | MarketplaceEvent
                | PrivateMessageEvent
                | ConversationInviteEvent
                | ConversationMentionEvent
                | ListingSubmittedEvent
                | ListingApprovedEvent
                | ListingRejectedEvent
                | ListingChangesRequestedEvent
                | SellerVerifiedEvent
                | ListingReportedEvent;

export interface BaseEvent {
                id: string;
                timestamp: Date;
                actorId: string | null;
}

export interface ThreadCreatedEvent extends BaseEvent {
                type: "THREAD_CREATED";
                threadId: string;
                threadSlug: string;
                threadTitle: string;
                forumId: string;
                forumSlug: string;
}

export interface ThreadDeletedEvent extends BaseEvent {
                type: "THREAD_DELETED";
                threadId: string;
}

export interface ThreadPinnedEvent extends BaseEvent {
                type: "THREAD_PINNED";
                threadId: string;
                threadTitle: string;
}

export interface ThreadLockedEvent extends BaseEvent {
                type: "THREAD_LOCKED";
                threadId: string;
                threadTitle: string;
}

export interface PostCreatedEvent extends BaseEvent {
                type: "POST_CREATED";
                postId: string;
                threadId: string;
                threadSlug: string;
                threadTitle: string;
                postNumber: number;
                mentionedUserIds: string[];
                quotedUserIds: string[];
}

export interface PostDeletedEvent extends BaseEvent {
                type: "POST_DELETED";
                postId: string;
                threadId: string;
}

export interface PostMentionedEvent extends BaseEvent {
                type: "POST_MENTIONED";
                postId: string;
                threadId: string;
                mentionedUsername: string;
                mentionedUserId: string;
}

export interface PostQuotedEvent extends BaseEvent {
                type: "POST_QUOTED";
                postId: string;
                quotedPostId: string;
                threadId: string;
                quotedUsername: string;
                quotedUserId: string;
}

export interface ReactionCreatedEvent extends BaseEvent {
                type: "REACTION_CREATED";
                reactionId: string;
                targetId: string;
                targetType: "POST" | "THREAD";
                reactionType: string;
                targetAuthorId: string;
}

export interface ReactionRemovedEvent extends BaseEvent {
                type: "REACTION_REMOVED";
                reactionId: string;
                targetId: string;
                targetType: "POST" | "THREAD";
                targetAuthorId: string;
}

export interface BadgeEarnedEvent extends BaseEvent {
                type: "BADGE_EARNED";
                userId: string;
                badgeId: string;
                badgeSlug: string;
                badgeName: string;
}

export interface TrophyUnlockedEvent extends BaseEvent {
                type: "TROPHY_UNLOCKED";
                userId: string;
                trophyId: string;
                trophyTitle: string;
}

export interface LevelUpEvent extends BaseEvent {
                type: "LEVEL_UP";
                userId: string;
                levelId: string;
                levelName: string;
                newPoints: number;
}

export interface SystemAnnouncementEvent extends BaseEvent {
                type: "SYSTEM_ANNOUNCEMENT";
                announcementId: string;
                announcementTitle: string;
                isGlobal: boolean;
                targetUserIds?: string[];
}

export interface MarketplaceEvent extends BaseEvent {
                type: "MARKETPLACE_EVENT";
                eventSubtype: string;
                listingId: string;
                sellerId: string;
                buyerId?: string;
}

export interface PrivateMessageEvent extends BaseEvent {
                type: "PRIVATE_MESSAGE";
                messageId: string;
                conversationId: string;
}

export interface ConversationInviteEvent extends BaseEvent {
                type: "CONVERSATION_INVITE";
                conversationId: string;
                userId: string;
}

export interface ConversationMentionEvent extends BaseEvent {
                type: "CONVERSATION_MENTION";
                conversationId: string;
                messageId: string;
                mentionedUserId: string;
}

export interface ListingSubmittedEvent extends BaseEvent {
  type: "LISTING_SUBMITTED";
  listingId: string;
  submissionId: string;
}

export interface ListingApprovedEvent extends BaseEvent {
  type: "LISTING_APPROVED";
  listingId: string;
  submissionId: string;
}

export interface ListingRejectedEvent extends BaseEvent {
  type: "LISTING_REJECTED";
  listingId: string;
  submissionId: string;
}

export interface ListingChangesRequestedEvent extends BaseEvent {
  type: "LISTING_CHANGES_REQUESTED";
  listingId: string;
  submissionId: string;
}

export interface SellerVerifiedEvent extends BaseEvent {
  type: "SELLER_VERIFIED";
  sellerId: string;
  status: string;
}

export interface ListingReportedEvent extends BaseEvent {
  type: "LISTING_REPORTED";
  listingId: string;
  flagId: string;
}

type EventHandler = (event: AppEvent) => Promise<void>;

const handlers: EventHandler[] = [];

export function registerEventHandler(handler: EventHandler): void {
                handlers.push(handler);
}

export async function emitEvent(event: AppEvent): Promise<void> {
                const eventWithTimestamp: AppEvent = {
                                ...event,
                                id: event.id || crypto.randomUUID(),
                                timestamp: event.timestamp || new Date(),
                };

                const promises = handlers.map((handler) =>
                                handler(eventWithTimestamp).catch((error) => {
                                                console.error(`Event handler error:`, error);
                                }),
                );

                await Promise.all(promises);
}

export function createEventId(): string {
                return crypto.randomUUID();
}

export function getNotificationTypeFromEvent(event: AppEvent): NotificationType | null {
                switch (event.type) {
                                case "POST_CREATED":
                                                if (event.mentionedUserIds.length > 0) return "THREAD_MENTION";
                                                return "THREAD_REPLY";
                                case "POST_QUOTED":
                                                return "THREAD_QUOTE";
                                case "REACTION_CREATED":
                                                return "THREAD_REACTION";
                                case "BADGE_EARNED":
                                                return "BADGE_EARNED";
                                case "TROPHY_UNLOCKED":
                                                return "TROPHY_UNLOCKED";
                                case "LEVEL_UP":
                                                return "LEVEL_UP";
                                case "SYSTEM_ANNOUNCEMENT":
                                                return "SYSTEM_ANNOUNCEMENT";
                                case "PRIVATE_MESSAGE":
                                                return "PRIVATE_MESSAGE";
                                case "CONVERSATION_INVITE":
                                                return "CONVERSATION_INVITE";
                                case "CONVERSATION_MENTION":
                                                return "CONVERSATION_MENTION";
                                case "LISTING_SUBMITTED":
                                case "LISTING_APPROVED":
                                case "LISTING_REJECTED":
                                case "LISTING_CHANGES_REQUESTED":
                                case "SELLER_VERIFIED":
                                case "LISTING_REPORTED":
                                                return "MARKETPLACE_EVENT";
                                default:
                                                return null;
                }
}
