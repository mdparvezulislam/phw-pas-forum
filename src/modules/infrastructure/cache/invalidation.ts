import "server-only";

import { registerEventHandler } from "@/lib/event-bus";
import { cacheManager } from "./cache-manager";

export function initializeCacheInvalidation(): void {
  registerEventHandler(async (event) => {
    try {
      switch (event.type) {
        // --- User / Reputation / Membership updates ---
        case "TRUST_UPDATED":
          await cacheManager.invalidate(`reputation:${event.sellerId}`);
          await cacheManager.invalidate(`trust:${event.sellerId}`);
          await cacheManager.invalidate(`user:${event.sellerId}`);
          await cacheManager.invalidate(`profile:${event.sellerId}`);
          break;

        case "MEMBERSHIP_PURCHASED":
        case "MEMBERSHIP_RENEWED":
        case "MEMBERSHIP_EXPIRED":
        case "MEMBERSHIP_UPGRADED":
        case "VIP_BADGE_ASSIGNED":
          if (event.userId) {
            await cacheManager.invalidate(`user:${event.userId}`);
            await cacheManager.invalidate(`profile:${event.userId}`);
            await cacheManager.invalidate(`permissions:${event.userId}`);
            await cacheManager.invalidate(`membership:${event.userId}`);
          }
          break;

        // --- Thread updates ---
        case "THREAD_CREATED":
        case "THREAD_DELETED":
        case "THREAD_PINNED":
        case "THREAD_LOCKED":
          await cacheManager.invalidatePattern("forum:*:threads*");
          await cacheManager.invalidate(`thread:${event.threadId}`);
          if ("threadSlug" in event) {
            await cacheManager.invalidate(`thread:${event.threadSlug}`);
          }
          break;

        // --- Post updates ---
        case "POST_CREATED":
        case "POST_DELETED":
          await cacheManager.invalidate(`thread:${event.threadId}`);
          await cacheManager.invalidatePattern(
            `thread:${event.threadId}:posts:*`,
          );
          await cacheManager.invalidatePattern(`forum:*:threads*`);
          break;

        // --- Marketplace listing updates ---
        case "LISTING_SUBMITTED":
        case "LISTING_APPROVED":
        case "LISTING_REJECTED":
        case "LISTING_CHANGES_REQUESTED":
        case "LISTING_REPORTED":
          await cacheManager.invalidate(`listing:${event.listingId}`);
          await cacheManager.invalidatePattern("listings:*");
          break;

        // --- Order updates ---
        case "ORDER_CREATED":
        case "ORDER_ACCEPTED":
        case "ORDER_DELIVERED":
        case "ORDER_COMPLETED":
        case "ORDER_CANCELLED":
          await cacheManager.invalidate(`order:${event.orderId}`);
          await cacheManager.invalidatePattern(
            `orders:user:${event.buyerId}:*`,
          );
          await cacheManager.invalidatePattern(
            `orders:seller:${event.sellerId}:*`,
          );
          break;

        // --- Review & iTrader updates ---
        case "REVIEW_CREATED":
          await cacheManager.invalidate(`listing:${event.listingId}`);
          await cacheManager.invalidatePattern("listings:*");
          break;

        case "ITRADER_CREATED":
          await cacheManager.invalidate(`reputation:${event.toUserId}`);
          await cacheManager.invalidate(`trust:${event.toUserId}`);
          break;

        default:
          break;
      }
    } catch (error) {
      console.error(
        "[CacheInvalidation] Failed to process event:",
        event.type,
        error,
      );
    }
  });
}
