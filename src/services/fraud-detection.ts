import "server-only";

import { and, count, eq, sql } from "drizzle-orm";
import { getDatabase, schema } from "@/db";

export interface FraudCheckResult {
  isSuspicious: boolean;
  riskScore: number;
  flags: string[];
}

export class FraudDetectionService {
  private static readonly MAX_REVIEWS_PER_DAY = 5;
  private static readonly MIN_ACCOUNT_AGE_DAYS = 7;
  private static readonly SELF_REVIEW_THRESHOLD = 0;
  private static readonly MAX_ITRADER_PER_ORDER = 1;
  private static readonly SUSPICIOUS_IP_REPEAT_THRESHOLD = 3;

  async checkReviewFraud(review: {
    buyerId: string;
    sellerId: string;
    orderId: string;
    ipAddress?: string;
  }): Promise<FraudCheckResult> {
    const db = getDatabase();
    const flags: string[] = [];
    let riskScore = 0;

    if (review.buyerId === review.sellerId) {
      flags.push("SELF_REVIEW");
      riskScore += 100;
      return { isSuspicious: true, riskScore, flags };
    }

    const recentReviews = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.buyerReviews)
      .where(
        and(
          eq(schema.buyerReviews.buyerId, review.buyerId),
          sql`${schema.buyerReviews.createdAt} > NOW() - INTERVAL '1 day'`,
        ),
      );
    if (
      Number(recentReviews[0]?.count ?? 0) >
      FraudDetectionService.MAX_REVIEWS_PER_DAY
    ) {
      flags.push("RAPID_REVIEWS");
      riskScore += 30;
    }

    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, review.buyerId),
    });
    if (user?.createdAt) {
      const accountAgeDays =
        (Date.now() - new Date(user.createdAt).getTime()) /
        (1000 * 60 * 60 * 24);
      if (accountAgeDays < FraudDetectionService.MIN_ACCOUNT_AGE_DAYS) {
        flags.push("NEW_ACCOUNT");
        riskScore += 20;
      }
    }

    const reviewCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.buyerReviews)
      .where(
        and(
          eq(schema.buyerReviews.sellerId, review.buyerId),
          eq(schema.buyerReviews.buyerId, review.sellerId),
        ),
      );
    if (Number(reviewCount[0]?.count ?? 0) > 0) {
      flags.push("MUTUAL_REVIEW_TRADING");
      riskScore += 40;
    }

    return {
      isSuspicious: riskScore > 50,
      riskScore: Math.min(riskScore, 100),
      flags,
    };
  }

  async checkITraderFraud(feedback: {
    fromUserId: string;
    toUserId: string;
    orderId: string;
  }): Promise<FraudCheckResult> {
    const db = getDatabase();
    const flags: string[] = [];
    let riskScore = 0;

    if (feedback.fromUserId === feedback.toUserId) {
      flags.push("SELF_FEEDBACK");
      riskScore += 100;
      return { isSuspicious: true, riskScore, flags };
    }

    const existing = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.itraderFeedback)
      .where(
        and(
          eq(schema.itraderFeedback.orderId, feedback.orderId),
          eq(schema.itraderFeedback.fromUserId, feedback.fromUserId),
        ),
      );
    if (
      Number(existing[0]?.count ?? 0) >=
      FraudDetectionService.MAX_ITRADER_PER_ORDER
    ) {
      flags.push("DUPLICATE_FEEDBACK");
      riskScore += 50;
    }

    const mutualFeedbacks = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.itraderFeedback)
      .where(
        and(
          eq(schema.itraderFeedback.fromUserId, feedback.toUserId),
          eq(schema.itraderFeedback.toUserId, feedback.fromUserId),
        ),
      );
    if (Number(mutualFeedbacks[0]?.count ?? 0) > 0) {
      flags.push("MUTUAL_FEEDBACK_TRADING");
      riskScore += 35;
    }

    const recentFeedbacks = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.itraderFeedback)
      .where(
        and(
          eq(schema.itraderFeedback.fromUserId, feedback.fromUserId),
          sql`${schema.itraderFeedback.createdAt} > NOW() - INTERVAL '1 hour'`,
        ),
      );
    if (Number(recentFeedbacks[0]?.count ?? 0) > 3) {
      flags.push("RAPID_FEEDBACK");
      riskScore += 25;
    }

    return {
      isSuspicious: riskScore > 50,
      riskScore: Math.min(riskScore, 100),
      flags,
    };
  }

  async checkTrustManipulation(sellerId: string): Promise<FraudCheckResult> {
    const db = getDatabase();
    const flags: string[] = [];
    let riskScore = 0;

    const selfOrders = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.orders)
      .where(
        and(
          eq(schema.orders.sellerId, sellerId),
          eq(schema.orders.buyerId, sellerId),
        ),
      );
    if (
      Number(selfOrders[0]?.count ?? 0) >
      FraudDetectionService.SELF_REVIEW_THRESHOLD
    ) {
      flags.push("SELF_ORDERS");
      riskScore += 60;
    }

    const canceledOrders = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.orders)
      .where(
        and(
          eq(schema.orders.sellerId, sellerId),
          eq(schema.orders.status, "CANCELLED"),
          eq(schema.orders.cancelledBy, sellerId),
        ),
      );
    const totalOrders = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.orders)
      .where(eq(schema.orders.sellerId, sellerId));
    const totalCount = Number(totalOrders[0]?.count ?? 0);
    const cancelledCount = Number(canceledOrders[0]?.count ?? 0);
    if (totalCount > 0 && cancelledCount / totalCount > 0.5) {
      flags.push("HIGH_CANCELLATION_RATE");
      riskScore += 30;
    }

    const repeatBuyers = await db
      .select({ buyerId: schema.orders.buyerId, count: sql<number>`count(*)` })
      .from(schema.orders)
      .where(
        and(
          eq(schema.orders.sellerId, sellerId),
          eq(schema.orders.status, "COMPLETED"),
        ),
      )
      .groupBy(schema.orders.buyerId)
      .having(sql`count(*) > 3`);

    for (const rb of repeatBuyers) {
      const allOrdersForBuyer = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.orders)
        .where(
          and(
            eq(schema.orders.buyerId, rb.buyerId),
            eq(schema.orders.sellerId, sellerId),
            eq(schema.orders.status, "COMPLETED"),
          ),
        );
      if (Number(allOrdersForBuyer[0]?.count ?? 0) > 5 && totalCount > 2) {
        flags.push("SUSPICIOUS_REPEAT_BUYER");
        riskScore += 15;
      }
    }

    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, sellerId),
    });
    if (user && user.isVerified) {
      riskScore = Math.max(0, riskScore - 20);
    }

    return {
      isSuspicious: riskScore > 50,
      riskScore: Math.min(riskScore, 100),
      flags,
    };
  }
}

export const fraudDetectionService = new FraudDetectionService();
