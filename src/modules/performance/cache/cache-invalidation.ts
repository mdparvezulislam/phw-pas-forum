import "server-only";
import { redisService } from "./redis-service";
import { CACHE_TAGS } from "@/constants";
import type { AppEvent } from "@/lib/event-bus";
import { logger } from "@/lib/logger";

const EVENT_TAG_MAP: Record<string, string[]> = {
  THREAD_CREATED: [CACHE_TAGS.THREAD, CACHE_TAGS.FORUM, CACHE_TAGS.TRENDING],
  THREAD_DELETED: [CACHE_TAGS.THREAD, CACHE_TAGS.FORUM, CACHE_TAGS.TRENDING],
  THREAD_PINNED: [CACHE_TAGS.THREAD, CACHE_TAGS.FORUM],
  THREAD_LOCKED: [CACHE_TAGS.THREAD],
  POST_CREATED: [CACHE_TAGS.POST, CACHE_TAGS.THREAD, CACHE_TAGS.FORUM],
  POST_DELETED: [CACHE_TAGS.POST, CACHE_TAGS.THREAD, CACHE_TAGS.FORUM],
  REACTION_CREATED: [
    CACHE_TAGS.THREAD,
    CACHE_TAGS.POST,
    CACHE_TAGS.USER,
    CACHE_TAGS.TRENDING,
  ],
  REACTION_REMOVED: [CACHE_TAGS.THREAD, CACHE_TAGS.POST, CACHE_TAGS.USER],
  BADGE_EARNED: [CACHE_TAGS.BADGE, CACHE_TAGS.USER],
  TROPHY_UNLOCKED: [CACHE_TAGS.TROPHY, CACHE_TAGS.USER, CACHE_TAGS.LEADERBOARD],
  LEVEL_UP: [CACHE_TAGS.USER, CACHE_TAGS.LEADERBOARD],
  LISTING_SUBMITTED: [
    CACHE_TAGS.MARKETPLACE,
    CACHE_TAGS.LISTING,
    CACHE_TAGS.SELLER,
  ],
  LISTING_APPROVED: [
    CACHE_TAGS.MARKETPLACE,
    CACHE_TAGS.LISTING,
    CACHE_TAGS.SELLER,
  ],
  LISTING_REJECTED: [CACHE_TAGS.LISTING, CACHE_TAGS.SELLER],
  LISTING_CHANGES_REQUESTED: [CACHE_TAGS.LISTING],
  SELLER_VERIFIED: [CACHE_TAGS.SELLER, CACHE_TAGS.USER, CACHE_TAGS.MARKETPLACE],
  LISTING_REPORTED: [CACHE_TAGS.LISTING],
  ORDER_CREATED: [CACHE_TAGS.ORDER, CACHE_TAGS.LISTING, CACHE_TAGS.SELLER],
  ORDER_ACCEPTED: [CACHE_TAGS.ORDER],
  ORDER_DELIVERED: [CACHE_TAGS.ORDER],
  ORDER_COMPLETED: [
    CACHE_TAGS.ORDER,
    CACHE_TAGS.LISTING,
    CACHE_TAGS.SELLER,
    CACHE_TAGS.LEADERBOARD,
  ],
  ORDER_CANCELLED: [CACHE_TAGS.ORDER, CACHE_TAGS.LISTING],
  DISPUTE_CREATED: [CACHE_TAGS.ORDER, CACHE_TAGS.MARKETPLACE],
  DISPUTE_RESOLVED: [CACHE_TAGS.ORDER],
  REVIEW_CREATED: [
    CACHE_TAGS.REVIEW,
    CACHE_TAGS.LISTING,
    CACHE_TAGS.SELLER,
    CACHE_TAGS.USER,
  ],
  ITRADER_CREATED: [CACHE_TAGS.REVIEW, CACHE_TAGS.SELLER, CACHE_TAGS.USER],
  TRUST_UPDATED: [CACHE_TAGS.SELLER, CACHE_TAGS.USER],
  PRIVATE_MESSAGE: [
    CACHE_TAGS.MESSAGE,
    CACHE_TAGS.CONVERSATION,
    CACHE_TAGS.NOTIFICATION,
  ],
  CONVERSATION_INVITE: [CACHE_TAGS.CONVERSATION],
  CONVERSATION_MENTION: [CACHE_TAGS.CONVERSATION, CACHE_TAGS.MESSAGE],
  MEMBERSHIP_PURCHASED: [CACHE_TAGS.MEMBERSHIP, CACHE_TAGS.USER],
  MEMBERSHIP_RENEWED: [CACHE_TAGS.MEMBERSHIP, CACHE_TAGS.USER],
  MEMBERSHIP_EXPIRED: [CACHE_TAGS.MEMBERSHIP, CACHE_TAGS.USER],
  MEMBERSHIP_UPGRADED: [CACHE_TAGS.MEMBERSHIP, CACHE_TAGS.USER],
  VIP_BADGE_ASSIGNED: [CACHE_TAGS.MEMBERSHIP, CACHE_TAGS.USER],
  SYSTEM_ANNOUNCEMENT: [CACHE_TAGS.SETTINGS],
  MARKETPLACE_EVENT: [CACHE_TAGS.MARKETPLACE],
};

const CACHE_EVENTS = [
  "THREAD_UPDATED",
  "LISTING_UPDATED",
  "PROFILE_UPDATED",
  "REPUTATION_CHANGED",
  "FORUM_UPDATED",
  "CATEGORY_UPDATED",
  "SETTINGS_UPDATED",
  "NOTIFICATION_READ",
  "SESSION_EXPIRED",
] as const;

type CacheEvent = (typeof CACHE_EVENTS)[number];

export class CacheInvalidator {
  async handleEvent(event: AppEvent): Promise<void> {
    const tags = EVENT_TAG_MAP[event.type];
    if (!tags || tags.length === 0) return;

    try {
      await redisService.invalidateTags(tags);
      logger.debug("[Cache] Invalidated tags for event", {
        event: event.type,
        tags,
        eventId: event.id,
      });
    } catch (err) {
      logger.error("[Cache] Tag invalidation failed", err as Error, {
        event: event.type,
        tags,
      });
    }
  }

  async invalidate(...tags: string[]): Promise<void> {
    if (tags.length === 0) return;
    await redisService.invalidateTags(tags);
  }

  async invalidateUser(userId: string): Promise<void> {
    await this.invalidate(CACHE_TAGS.USER);
    await redisService.delPattern(`user:${userId}:*`);
  }

  async invalidateThread(threadId: string): Promise<void> {
    await this.invalidate(
      CACHE_TAGS.THREAD,
      CACHE_TAGS.FORUM,
      CACHE_TAGS.TRENDING,
    );
    await redisService.delPattern(`thread:${threadId}:*`);
  }

  async invalidateListing(listingId: string): Promise<void> {
    await this.invalidate(
      CACHE_TAGS.LISTING,
      CACHE_TAGS.MARKETPLACE,
      CACHE_TAGS.SELLER,
    );
    await redisService.delPattern(`listing:${listingId}:*`);
  }

  async invalidateProfile(userId: string): Promise<void> {
    await this.invalidate(CACHE_TAGS.USER);
    await redisService.delPattern(`profile:${userId}:*`);
  }

  async invalidateTagSpecific(tag: string): Promise<void> {
    await redisService.delByTag(tag);
  }

  registerCacheEvent(eventType: CacheEvent, ...tags: string[]): void {
    EVENT_TAG_MAP[eventType] = tags;
  }
}

export const cacheInvalidator = new CacheInvalidator();
