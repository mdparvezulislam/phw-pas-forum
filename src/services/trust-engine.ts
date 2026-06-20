import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { getDatabase, schema } from "@/db";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";
import { emitEvent } from "@/lib/event-bus";
import { auditService } from "@/services/audit";
import { reputationEngine } from "@/services/reputation-engine";

export const TRUST_WEIGHTS = {
  POSITIVE_FEEDBACK: 10,
  NEUTRAL_FEEDBACK: 2,
  NEGATIVE_FEEDBACK: -15,
  COMPLETED_ORDER: 5,
  DISPUTED_ORDER: -20,
  CANCELLED_ORDER: -5,
  REFUND_RATE_PENALTY: -10,
  ACCOUNT_AGE_BOOST: 1,
  REPUTATION_POINTS_FACTOR: 0.1,
  VERIFIED_SELLER_BOOST: 15,
  TOP_SELLER_BOOST: 25,
  MARKETPLACE_ACTIVITY_FACTOR: 0.05,
  REPEAT_BUYER_BOOST: 3,
} as const;

export class TrustEngine {
  async ensureTrustProfile(sellerId: string) {
    const db = getDatabase();

    let profile = await db.query.sellerTrustProfiles.findFirst({
      where: eq(schema.sellerTrustProfiles.sellerId, sellerId),
    });

    if (!profile) {
      const [created] = await db
        .insert(schema.sellerTrustProfiles)
        .values({ sellerId })
        .returning();
      profile = created;
    }

    return profile;
  }

  async updateTrustScore(sellerId: string) {
    const db = getDatabase();

    const profile = await this.ensureTrustProfile(sellerId);
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, sellerId),
      with: { reputation: true, role: true },
    });
    if (!user) return profile;

    const feedback = await db.query.itraderFeedback.findMany({
      where: eq(schema.itraderFeedback.toUserId, sellerId),
    });

    const orders = await db.query.orders.findMany({
      where: eq(schema.orders.sellerId, sellerId),
    });

    const positiveCount = feedback.filter(
      (f) => f.rating === "POSITIVE",
    ).length;
    const neutralCount = feedback.filter((f) => f.rating === "NEUTRAL").length;
    const negativeCount = feedback.filter(
      (f) => f.rating === "NEGATIVE",
    ).length;
    const completedCount = orders.filter(
      (o) => o.status === "COMPLETED",
    ).length;
    const disputedCount = orders.filter((o) => o.status === "DISPUTED").length;
    const cancelledCount = orders.filter(
      (o) => o.status === "CANCELLED",
    ).length;
    const refundedCount = orders.filter((o) => o.status === "REFUNDED").length;

    const totalOrders = orders.length;
    const refundRate =
      totalOrders > 0 ? Math.round((refundedCount / totalOrders) * 100) : 0;

    const accountAgeDays = user.createdAt
      ? Math.floor(
          (Date.now() - new Date(user.createdAt).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

    const reputationPoints = user.reputation?.reputationPoints ?? 0;

    const isVerified = user.isVerified;
    const isTopSeller = await this.isTopSeller(sellerId);
    const isTrustedSeller = await this.isTrustedSeller(sellerId);

    const uniqueBuyersResult = await db
      .select({ count: sql<number>`count(distinct buyer_id)` })
      .from(schema.orders)
      .where(eq(schema.orders.sellerId, sellerId));
    const uniqueBuyerCount = Number(uniqueBuyersResult[0]?.count ?? 0);

    let trustScore = 0;

    trustScore += positiveCount * TRUST_WEIGHTS.POSITIVE_FEEDBACK;
    trustScore += neutralCount * TRUST_WEIGHTS.NEUTRAL_FEEDBACK;
    trustScore += negativeCount * TRUST_WEIGHTS.NEGATIVE_FEEDBACK;
    trustScore += completedCount * TRUST_WEIGHTS.COMPLETED_ORDER;
    trustScore += disputedCount * TRUST_WEIGHTS.DISPUTED_ORDER;
    trustScore += cancelledCount * TRUST_WEIGHTS.CANCELLED_ORDER;
    trustScore +=
      Math.floor(refundRate / 10) * TRUST_WEIGHTS.REFUND_RATE_PENALTY;
    trustScore +=
      Math.floor(accountAgeDays / 365) * TRUST_WEIGHTS.ACCOUNT_AGE_BOOST;
    trustScore += Math.floor(
      reputationPoints * TRUST_WEIGHTS.REPUTATION_POINTS_FACTOR,
    );

    if (isVerified) trustScore += TRUST_WEIGHTS.VERIFIED_SELLER_BOOST;
    if (isTopSeller) trustScore += TRUST_WEIGHTS.TOP_SELLER_BOOST;
    if (isTrustedSeller) trustScore += TRUST_WEIGHTS.VERIFIED_SELLER_BOOST;

    trustScore += Math.floor(
      uniqueBuyerCount * TRUST_WEIGHTS.REPEAT_BUYER_BOOST,
    );
    trustScore += Math.floor(
      totalOrders * TRUST_WEIGHTS.MARKETPLACE_ACTIVITY_FACTOR,
    );

    trustScore = Math.max(0, Math.min(trustScore, 1000));

    await db
      .update(schema.sellerTrustProfiles)
      .set({
        positiveFeedback: positiveCount,
        neutralFeedback: neutralCount,
        negativeFeedback: negativeCount,
        completedOrders: completedCount,
        disputedOrders: disputedCount,
        cancelledOrders: cancelledCount,
        totalRevenue: 0,
        refundRate,
        trustScore,
        lastCalculatedAt: new Date(),
      })
      .where(eq(schema.sellerTrustProfiles.sellerId, sellerId));

    await db
      .update(schema.sellerProfiles)
      .set({ trustScore })
      .where(eq(schema.sellerProfiles.userId, sellerId));

    await auditService.log(null, AUDIT_ACTIONS.TRUST_SCORE_UPDATED, {
      resource: "trust",
      resourceId: sellerId,
      metadata: { trustScore, previousScore: profile.trustScore },
    });

    await reputationEngine.awardReputation(
      sellerId,
      null,
      "SYSTEM_REWARD",
      trustScore > profile.trustScore ? 5 : 0,
      sellerId,
      "TRUST_UPDATE",
    );

    await emitEvent({
      id: crypto.randomUUID(),
      type: "TRUST_UPDATED",
      timestamp: new Date(),
      actorId: null,
      sellerId,
      newTrustScore: trustScore,
    });

    return { ...profile, trustScore };
  }

  private async isTopSeller(sellerId: string): Promise<boolean> {
    const db = getDatabase();
    const profile = await db.query.sellerProfiles.findFirst({
      where: eq(schema.sellerProfiles.userId, sellerId),
    });
    return profile?.isTopSeller ?? false;
  }

  private async isTrustedSeller(sellerId: string): Promise<boolean> {
    const db = getDatabase();
    const profile = await db.query.sellerProfiles.findFirst({
      where: eq(schema.sellerProfiles.userId, sellerId),
    });
    return profile?.verificationStatus === "TRUSTED_SELLER";
  }

  async getSellerTrustProfile(sellerId: string) {
    return this.ensureTrustProfile(sellerId);
  }

  async getSellerStats(sellerId: string) {
    const db = getDatabase();

    const trustProfile = await this.ensureTrustProfile(sellerId);
    const sellerProfile = await db.query.sellerProfiles.findFirst({
      where: eq(schema.sellerProfiles.userId, sellerId),
    });

    const revenueResult = await db
      .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(schema.transactions)
      .where(
        and(
          eq(schema.transactions.sellerId, sellerId),
          eq(schema.transactions.type, "PAYMENT"),
          eq(schema.transactions.status, "SUCCESS"),
        ),
      );

    const totalRevenue = Number(revenueResult[0]?.total ?? 0);

    return {
      trustProfile,
      sellerProfile,
      totalRevenue,
      totalOrders:
        trustProfile.completedOrders +
        trustProfile.disputedOrders +
        trustProfile.cancelledOrders,
      completionRate:
        trustProfile.completedOrders > 0
          ? Math.round(
              (trustProfile.completedOrders /
                Math.max(
                  1,
                  trustProfile.completedOrders +
                    trustProfile.disputedOrders +
                    trustProfile.cancelledOrders,
                )) *
                100,
            )
          : 0,
    };
  }

  async getRepeatBuyerCount(sellerId: string): Promise<number> {
    const db = getDatabase();
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.orders)
      .where(eq(schema.orders.sellerId, sellerId))
      .groupBy(schema.orders.buyerId)
      .having(sql`count(*) > 1`);

    return result.length;
  }

  async getRecentOrders(sellerId: string, limit = 5) {
    const db = getDatabase();
    return db.query.orders.findMany({
      where: eq(schema.orders.sellerId, sellerId),
      orderBy: (o, { desc }) => [desc(o.createdAt)],
      limit,
      with: { buyer: true, listing: true },
    });
  }
}

export const trustEngine = new TrustEngine();
