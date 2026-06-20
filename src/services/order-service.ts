import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";
import { getDatabase, schema } from "@/db";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";
import type { BuyerReview } from "@/db/schema/buyer-reviews";
import type { OrderStatus } from "@/db/schema/orders";
import { emitEvent } from "@/lib/event-bus";
import { auditService } from "@/services/audit";
import { reputationEngine } from "@/services/reputation-engine";
import { trustEngine } from "@/services/trust-engine";

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomUUID().slice(0, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export class OrderService {
  async createOrder(params: {
    buyerId: string;
    listingId: string;
    packageId?: string;
    requirements?: string;
    isUrgent?: number;
  }) {
    const db = getDatabase();

    const listing = await db.query.marketplaceListings.findFirst({
      where: eq(schema.marketplaceListings.id, params.listingId),
      with: { packages: true },
    });
    if (!listing) throw new Error("Listing not found");
    if (listing.status !== "ACTIVE") throw new Error("Listing is not active");

    const sellerProfile = await db.query.sellerProfiles.findFirst({
      where: eq(schema.sellerProfiles.id, listing.sellerId),
    });
    if (!sellerProfile) throw new Error("Seller profile not found");
    if (sellerProfile.userId === params.buyerId) {
      throw new Error("Cannot purchase your own listing");
    }

    let amount = listing.basePrice;
    let deliveryDays = listing.deliveryDays;

    if (params.packageId) {
      const pkg = listing.packages.find((p) => p.id === params.packageId);
      if (pkg) {
        amount = pkg.price;
        deliveryDays = pkg.deliveryDays;
      }
    }

    if (params.isUrgent) {
      deliveryDays = Math.max(1, Math.floor(deliveryDays / 2));
    }

    const orderNumber = generateOrderNumber();

    const [order] = await db
      .insert(schema.orders)
      .values({
        buyerId: params.buyerId,
        sellerId: sellerProfile.userId,
        listingId: listing.id,
        packageId: params.packageId || null,
        orderNumber,
        status: "PENDING",
        amount,
        requirements: params.requirements || null,
        isUrgent: params.isUrgent || 0,
      })
      .returning();

    await db
      .update(schema.marketplaceListings)
      .set({ sales: sql`${schema.marketplaceListings.sales} + 1` })
      .where(eq(schema.marketplaceListings.id, listing.id));

    await db.insert(schema.transactions).values({
      orderId: order.id,
      buyerId: params.buyerId,
      sellerId: sellerProfile.userId,
      amount,
      type: "PAYMENT",
      status: "PENDING",
    });

    await auditService.log(params.buyerId, AUDIT_ACTIONS.ORDER_CREATED, {
      resource: "order",
      resourceId: order.id,
      metadata: { orderNumber, amount, listingId: params.listingId },
    });

    await emitEvent({
      id: crypto.randomUUID(),
      type: "ORDER_CREATED",
      timestamp: new Date(),
      actorId: params.buyerId,
      orderId: order.id,
      orderNumber,
      buyerId: params.buyerId,
      sellerId: sellerProfile.userId,
      listingId: listing.id,
      amount,
    });

    return order;
  }

  async acceptOrder(orderId: string, sellerId: string) {
    const db = getDatabase();

    const order = await db.query.orders.findFirst({
      where: eq(schema.orders.id, orderId),
    });
    if (!order) throw new Error("Order not found");
    if (order.sellerId !== sellerId) throw new Error("Unauthorized");
    if (order.status !== "PENDING") throw new Error("Order cannot be accepted");

    const [updated] = await db
      .update(schema.orders)
      .set({ status: "ACCEPTED" })
      .where(eq(schema.orders.id, orderId))
      .returning();

    await db
      .update(schema.transactions)
      .set({ status: "SUCCESS", processedAt: new Date() })
      .where(
        and(
          eq(schema.transactions.orderId, orderId),
          eq(schema.transactions.type, "PAYMENT"),
        ),
      );

    await auditService.log(sellerId, AUDIT_ACTIONS.ORDER_ACCEPTED, {
      resource: "order",
      resourceId: orderId,
      metadata: { orderNumber: order.orderNumber },
    });

    await db.insert(schema.orderMessages).values({
      orderId,
      senderId: sellerId,
      contentJson: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Order accepted. Work has started." },
            ],
          },
        ],
      },
      isSystem: 1,
    });

    await emitEvent({
      id: crypto.randomUUID(),
      type: "ORDER_ACCEPTED",
      timestamp: new Date(),
      actorId: sellerId,
      orderId,
      orderNumber: order.orderNumber,
      buyerId: order.buyerId,
      sellerId,
    });

    return updated;
  }

  async deliverOrder(params: {
    orderId: string;
    sellerId: string;
    deliveryMessage?: string;
    attachments?: string[];
    isLastDelivery?: number;
  }) {
    const db = getDatabase();

    const order = await db.query.orders.findFirst({
      where: eq(schema.orders.id, params.orderId),
    });
    if (!order) throw new Error("Order not found");
    if (order.sellerId !== params.sellerId) throw new Error("Unauthorized");
    if (order.status !== "ACCEPTED" && order.status !== "IN_PROGRESS") {
      throw new Error("Order cannot be delivered in current status");
    }

    const deliveries = await db.query.orderDeliveries.findMany({
      where: eq(schema.orderDeliveries.orderId, params.orderId),
    });

    const revisionCount = deliveries.length;

    await db.insert(schema.orderDeliveries).values({
      orderId: params.orderId,
      sellerId: params.sellerId,
      deliveryMessage: params.deliveryMessage || null,
      attachments: params.attachments || [],
      revisionCount,
      isLastDelivery: params.isLastDelivery || 0,
    });

    const [updated] = await db
      .update(schema.orders)
      .set({ status: "DELIVERED" })
      .where(eq(schema.orders.id, params.orderId))
      .returning();

    await auditService.log(params.sellerId, AUDIT_ACTIONS.ORDER_DELIVERED, {
      resource: "order",
      resourceId: params.orderId,
      metadata: { orderNumber: order.orderNumber, revisionCount },
    });

    await db.insert(schema.orderMessages).values({
      orderId: params.orderId,
      senderId: params.sellerId,
      contentJson: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Delivery submitted." }],
          },
        ],
      },
      isSystem: 1,
    });

    await emitEvent({
      id: crypto.randomUUID(),
      type: "ORDER_DELIVERED",
      timestamp: new Date(),
      actorId: params.sellerId,
      orderId: params.orderId,
      orderNumber: order.orderNumber,
      buyerId: order.buyerId,
      sellerId: params.sellerId,
    });

    return updated;
  }

  async requestRevision(orderId: string, userId: string, reason: string) {
    const db = getDatabase();

    const order = await db.query.orders.findFirst({
      where: eq(schema.orders.id, orderId),
    });
    if (!order) throw new Error("Order not found");
    if (order.buyerId !== userId) throw new Error("Unauthorized");
    if (order.status !== "DELIVERED")
      throw new Error("Can only request revision on delivered orders");

    await db.insert(schema.orderRevisions).values({
      orderId,
      requestedBy: userId,
      reason,
    });

    const [updated] = await db
      .update(schema.orders)
      .set({ status: "IN_PROGRESS" })
      .where(eq(schema.orders.id, orderId))
      .returning();

    await db.insert(schema.orderMessages).values({
      orderId,
      senderId: userId,
      contentJson: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: `Revision requested: ${reason}` }],
          },
        ],
      },
      isSystem: 1,
    });

    return updated;
  }

  async completeOrder(orderId: string, userId: string) {
    const db = getDatabase();

    const order = await db.query.orders.findFirst({
      where: eq(schema.orders.id, orderId),
    });
    if (!order) throw new Error("Order not found");
    if (order.buyerId !== userId) throw new Error("Unauthorized");
    if (order.status !== "DELIVERED")
      throw new Error("Order must be delivered first");

    const [updated] = await db
      .update(schema.orders)
      .set({ status: "COMPLETED", completedAt: new Date() })
      .where(eq(schema.orders.id, orderId))
      .returning();

    await auditService.log(userId, AUDIT_ACTIONS.ORDER_COMPLETED, {
      resource: "order",
      resourceId: orderId,
      metadata: { orderNumber: order.orderNumber },
    });

    await reputationEngine.awardReputation(
      order.sellerId,
      userId,
      "MARKETPLACE_REVIEW",
      10,
      orderId,
      "ORDER",
    );

    await trustEngine.updateTrustScore(order.sellerId);

    await db
      .update(schema.sellerProfiles)
      .set({
        totalSales: sql`${schema.sellerProfiles.totalSales} + 1`,
        completionRate: sql`ROUND(CAST(${schema.sellerProfiles.completionRate} + 1 AS DECIMAL) / 2 * 100)`,
      })
      .where(eq(schema.sellerProfiles.userId, order.sellerId));

    await db.insert(schema.orderMessages).values({
      orderId,
      senderId: userId,
      contentJson: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Order completed. Thank you!" }],
          },
        ],
      },
      isSystem: 1,
    });

    await emitEvent({
      id: crypto.randomUUID(),
      type: "ORDER_COMPLETED",
      timestamp: new Date(),
      actorId: userId,
      orderId,
      orderNumber: order.orderNumber,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
    });

    return updated;
  }

  async cancelOrder(orderId: string, userId: string, reason: string) {
    const db = getDatabase();

    const order = await db.query.orders.findFirst({
      where: eq(schema.orders.id, orderId),
    });
    if (!order) throw new Error("Order not found");
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new Error("Unauthorized");
    }
    if (!["PENDING", "ACCEPTED"].includes(order.status)) {
      throw new Error("Order cannot be cancelled in current status");
    }

    const [updated] = await db
      .update(schema.orders)
      .set({
        status: "CANCELLED",
        cancelledBy: userId,
        cancelReason: reason,
        cancelledAt: new Date(),
      })
      .where(eq(schema.orders.id, orderId))
      .returning();

    await db
      .update(schema.transactions)
      .set({ status: "REFUNDED" })
      .where(
        and(
          eq(schema.transactions.orderId, orderId),
          eq(schema.transactions.type, "PAYMENT"),
        ),
      );

    await auditService.log(userId, AUDIT_ACTIONS.ORDER_CANCELLED, {
      resource: "order",
      resourceId: orderId,
      metadata: { orderNumber: order.orderNumber, reason },
    });

    await db.insert(schema.orderMessages).values({
      orderId,
      senderId: userId,
      contentJson: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: `Order cancelled: ${reason}` }],
          },
        ],
      },
      isSystem: 1,
    });

    await trustEngine.updateTrustScore(order.sellerId);

    await emitEvent({
      id: crypto.randomUUID(),
      type: "ORDER_CANCELLED",
      timestamp: new Date(),
      actorId: userId,
      orderId,
      orderNumber: order.orderNumber,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      reason,
    });

    return updated;
  }

  async submitReview(params: {
    orderId: string;
    buyerId: string;
    rating: number;
    content: string;
    reviewImages?: string[];
    isRecommended?: number;
  }) {
    const db = getDatabase();

    const order = await db.query.orders.findFirst({
      where: eq(schema.orders.id, params.orderId),
    });
    if (!order) throw new Error("Order not found");
    if (order.buyerId !== params.buyerId) throw new Error("Unauthorized");
    if (order.status === "DISPUTED")
      throw new Error("Cannot review a disputed order");
    if (order.status !== "COMPLETED")
      throw new Error("Order must be completed to review");

    const existing = await db.query.buyerReviews.findFirst({
      where: eq(schema.buyerReviews.orderId, params.orderId),
    });
    if (existing) throw new Error("Review already submitted for this order");

    const [review] = await db
      .insert(schema.buyerReviews)
      .values({
        orderId: params.orderId,
        listingId: order.listingId,
        buyerId: params.buyerId,
        sellerId: order.sellerId,
        rating: params.rating,
        content: params.content,
        reviewImages: params.reviewImages || [],
        isVerifiedPurchase: 1,
        isRecommended: params.isRecommended ?? 1,
      })
      .returning();

    const avgResult = await db
      .select({ avg: sql<number>`ROUND(AVG(rating), 2)` })
      .from(schema.buyerReviews)
      .where(eq(schema.buyerReviews.listingId, order.listingId));

    const avgRating = avgResult[0]?.avg ?? params.rating;
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.buyerReviews)
      .where(eq(schema.buyerReviews.listingId, order.listingId));

    await db
      .update(schema.marketplaceListings)
      .set({
        rating: String(avgRating),
        reviewCount: Number(countResult[0]?.count ?? 1),
      })
      .where(eq(schema.marketplaceListings.id, order.listingId));

    await db
      .update(schema.sellerProfiles)
      .set({
        totalReviews: sql`${schema.sellerProfiles.totalReviews} + 1`,
        averageRating: sql`ROUND((CAST(${schema.sellerProfiles.averageRating} * CAST(${schema.sellerProfiles.totalReviews} AS DECIMAL) + ${params.rating} AS DECIMAL) / (CAST(${schema.sellerProfiles.totalReviews} AS DECIMAL) + 1)))`,
      })
      .where(eq(schema.sellerProfiles.userId, order.sellerId));

    await auditService.log(params.buyerId, AUDIT_ACTIONS.REVIEW_SUBMITTED, {
      resource: "review",
      resourceId: review.id,
      metadata: { orderId: params.orderId, rating: params.rating },
    });

    await emitEvent({
      id: crypto.randomUUID(),
      type: "REVIEW_CREATED",
      timestamp: new Date(),
      actorId: params.buyerId,
      reviewId: review.id,
      orderId: params.orderId,
      listingId: order.listingId,
      buyerId: params.buyerId,
      sellerId: order.sellerId,
      rating: params.rating,
    });

    return review;
  }

  async submitITraderFeedback(params: {
    orderId: string;
    fromUserId: string;
    toUserId: string;
    rating: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
    comment: string;
  }) {
    const db = getDatabase();

    const order = await db.query.orders.findFirst({
      where: eq(schema.orders.id, params.orderId),
    });
    if (!order) throw new Error("Order not found");
    if (order.status !== "COMPLETED")
      throw new Error("Order must be completed for iTrader feedback");

    const existing = await db.query.itraderFeedback.findFirst({
      where: and(
        eq(schema.itraderFeedback.orderId, params.orderId),
        eq(schema.itraderFeedback.fromUserId, params.fromUserId),
      ),
    });
    if (existing) throw new Error("iTrader feedback already submitted");

    const [feedback] = await db
      .insert(schema.itraderFeedback)
      .values(params)
      .returning();

    await trustEngine.updateTrustScore(params.toUserId);

    await auditService.log(params.fromUserId, AUDIT_ACTIONS.ITRADER_SUBMITTED, {
      resource: "itrader",
      resourceId: feedback.id,
      metadata: { orderId: params.orderId, rating: params.rating },
    });

    await emitEvent({
      id: crypto.randomUUID(),
      type: "ITRADER_CREATED",
      timestamp: new Date(),
      actorId: params.fromUserId,
      feedbackId: feedback.id,
      orderId: params.orderId,
      fromUserId: params.fromUserId,
      toUserId: params.toUserId,
      rating: params.rating,
    });

    return feedback;
  }

  async sendOrderMessage(orderId: string, senderId: string, contentJson: any) {
    const db = getDatabase();

    const order = await db.query.orders.findFirst({
      where: eq(schema.orders.id, orderId),
    });
    if (!order) throw new Error("Order not found");
    if (order.buyerId !== senderId && order.sellerId !== senderId) {
      throw new Error("Unauthorized");
    }

    const [message] = await db
      .insert(schema.orderMessages)
      .values({ orderId, senderId, contentJson })
      .returning();

    return message;
  }

  async getOrderMessages(orderId: string, userId: string) {
    const db = getDatabase();

    const order = await db.query.orders.findFirst({
      where: eq(schema.orders.id, orderId),
    });
    if (!order) throw new Error("Order not found");
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new Error("Unauthorized");
    }

    return db.query.orderMessages.findMany({
      where: eq(schema.orderMessages.orderId, orderId),
      orderBy: [desc(schema.orderMessages.createdAt)],
      with: { sender: true },
    });
  }

  async getBuyerOrders(userId: string, status?: string, page = 1, limit = 20) {
    const db = getDatabase();
    const conditions: any[] = [eq(schema.orders.buyerId, userId)];
    if (status)
      conditions.push(eq(schema.orders.status, status as OrderStatus));

    const orders = await db.query.orders.findMany({
      where: and(...conditions),
      orderBy: [desc(schema.orders.createdAt)],
      limit,
      offset: (page - 1) * limit,
      with: {
        listing: true,
        seller: true,
        review: true,
      },
    });

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.orders)
      .where(and(...conditions));

    return {
      orders,
      total: Number(countResult[0]?.count ?? 0),
      page,
      limit,
      totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit),
    };
  }

  async getSellerOrders(userId: string, status?: string, page = 1, limit = 20) {
    const db = getDatabase();
    const conditions: any[] = [eq(schema.orders.sellerId, userId)];
    if (status)
      conditions.push(eq(schema.orders.status, status as OrderStatus));

    const orders = await db.query.orders.findMany({
      where: and(...conditions),
      orderBy: [desc(schema.orders.createdAt)],
      limit,
      offset: (page - 1) * limit,
      with: {
        listing: true,
        buyer: true,
        review: true,
      },
    });

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.orders)
      .where(and(...conditions));

    return {
      orders,
      total: Number(countResult[0]?.count ?? 0),
      page,
      limit,
      totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit),
    };
  }

  async getOrderById(orderId: string, userId: string) {
    const db = getDatabase();

    const order = await db.query.orders.findFirst({
      where: eq(schema.orders.id, orderId),
      with: {
        buyer: true,
        seller: true,
        listing: { with: { packages: true } },
        messages: {
          orderBy: [desc(schema.orderMessages.createdAt)],
          with: { sender: true },
        },
        deliveries: {
          orderBy: [desc(schema.orderDeliveries.deliveredAt)],
          with: { seller: true },
        },
        revisions: {
          orderBy: [desc(schema.orderRevisions.createdAt)],
          with: { requester: true },
        },
        transactions: true,
        dispute: true,
        review: true,
      },
    });

    if (!order) throw new Error("Order not found");
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new Error("Unauthorized");
    }

    return order;
  }

  async processRefund(
    orderId: string,
    moderatorId: string,
    amount: number,
    reason?: string,
  ) {
    const db = getDatabase();

    const order = await db.query.orders.findFirst({
      where: eq(schema.orders.id, orderId),
    });
    if (!order) throw new Error("Order not found");

    await db.transaction(async (tx) => {
      await tx
        .update(schema.orders)
        .set({ status: "REFUNDED" })
        .where(eq(schema.orders.id, orderId));

      await tx.insert(schema.transactions).values({
        orderId,
        buyerId: order.buyerId,
        sellerId: order.sellerId,
        amount,
        type: "REFUND",
        status: "SUCCESS",
        processedAt: new Date(),
      });

      await tx
        .update(schema.transactions)
        .set({ status: "REFUNDED" })
        .where(
          and(
            eq(schema.transactions.orderId, orderId),
            eq(schema.transactions.type, "PAYMENT"),
          ),
        );
    });

    await auditService.log(moderatorId, AUDIT_ACTIONS.TRANSACTION_REFUNDED, {
      resource: "transaction",
      resourceId: orderId,
      metadata: { amount, reason },
    });

    await trustEngine.updateTrustScore(order.sellerId);
  }
}

export const orderService = new OrderService();
