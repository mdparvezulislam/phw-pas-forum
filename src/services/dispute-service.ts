import "server-only";

import { and, desc, eq, or, sql } from "drizzle-orm";
import { getDatabase, schema } from "@/db";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";
import type { DisputeStatus } from "@/db/schema/disputes";
import { emitEvent } from "@/lib/event-bus";
import { auditService } from "@/services/audit";

export class DisputeService {
  async createDispute(params: {
    orderId: string;
    buyerId: string;
    sellerId: string;
    reason: string;
    description: string;
  }) {
    const db = getDatabase();

    const order = await db.query.orders.findFirst({
      where: eq(schema.orders.id, params.orderId),
    });
    if (!order) throw new Error("Order not found");
    if (order.buyerId !== params.buyerId)
      throw new Error("Only buyer can open a dispute");
    if (order.status === "DISPUTED")
      throw new Error("Dispute already exists for this order");
    if (order.status === "COMPLETED")
      throw new Error("Cannot dispute a completed order");
    if (order.status === "CANCELLED")
      throw new Error("Cannot dispute a cancelled order");
    if (order.status === "REFUNDED")
      throw new Error("Cannot dispute a refunded order");

    const existing = await db.query.disputes.findFirst({
      where: and(
        eq(schema.disputes.orderId, params.orderId),
        eq(schema.disputes.status, "OPEN"),
      ),
    });
    if (existing)
      throw new Error("An open dispute already exists for this order");

    const [dispute] = await db
      .insert(schema.disputes)
      .values({
        orderId: params.orderId,
        buyerId: params.buyerId,
        sellerId: params.sellerId,
        reason: params.reason,
        description: params.description,
        status: "OPEN",
      })
      .returning();

    await db
      .update(schema.orders)
      .set({ status: "DISPUTED" })
      .where(eq(schema.orders.id, params.orderId));

    await db.insert(schema.orderMessages).values({
      orderId: params.orderId,
      senderId: params.buyerId,
      contentJson: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: `Dispute opened: ${params.reason}` },
            ],
          },
        ],
      },
      isSystem: 1,
    });

    await auditService.log(params.buyerId, AUDIT_ACTIONS.DISPUTE_OPENED, {
      resource: "dispute",
      resourceId: dispute.id,
      metadata: { orderId: params.orderId, reason: params.reason },
    });

    await emitEvent({
      id: crypto.randomUUID(),
      type: "DISPUTE_CREATED",
      timestamp: new Date(),
      actorId: params.buyerId,
      disputeId: dispute.id,
      orderId: params.orderId,
      orderNumber: order.orderNumber,
      buyerId: params.buyerId,
      sellerId: params.sellerId,
      reason: params.reason,
    });

    return dispute;
  }

  async sendMessage(params: {
    disputeId: string;
    senderId: string;
    content: string;
    isModNote?: number;
  }) {
    const db = getDatabase();

    const dispute = await db.query.disputes.findFirst({
      where: eq(schema.disputes.id, params.disputeId),
    });
    if (!dispute) throw new Error("Dispute not found");
    if (dispute.status !== "OPEN" && dispute.status !== "UNDER_REVIEW") {
      throw new Error("Dispute is closed");
    }

    const [message] = await db
      .insert(schema.disputeMessages)
      .values({
        disputeId: params.disputeId,
        senderId: params.senderId,
        content: params.content,
        isModNote: params.isModNote ?? 0,
      })
      .returning();

    return message;
  }

  async resolveDispute(params: {
    disputeId: string;
    moderatorId: string;
    resolution: string;
    action: "RESOLVED" | "REJECTED";
  }) {
    const db = getDatabase();

    const dispute = await db.query.disputes.findFirst({
      where: eq(schema.disputes.id, params.disputeId),
      with: { order: true },
    });
    if (!dispute) throw new Error("Dispute not found");

    await db.transaction(async (tx) => {
      await tx
        .update(schema.disputes)
        .set({
          status: params.action,
          resolution: params.resolution,
          moderatorId: params.moderatorId,
          resolvedAt: new Date(),
        })
        .where(eq(schema.disputes.id, params.disputeId));

      if (params.action === "RESOLVED") {
        await tx
          .update(schema.orders)
          .set({ status: "COMPLETED", completedAt: new Date() })
          .where(eq(schema.orders.id, dispute.orderId));
      } else {
        await tx
          .update(schema.orders)
          .set({ status: "IN_PROGRESS" })
          .where(eq(schema.orders.id, dispute.orderId));
      }
    });

    await auditService.log(params.moderatorId, AUDIT_ACTIONS.DISPUTE_RESOLVED, {
      resource: "dispute",
      resourceId: params.disputeId,
      metadata: {
        orderId: dispute.orderId,
        action: params.action,
        resolution: params.resolution,
      },
    });

    await emitEvent({
      id: crypto.randomUUID(),
      type: "DISPUTE_RESOLVED",
      timestamp: new Date(),
      actorId: params.moderatorId,
      disputeId: params.disputeId,
      orderId: dispute.orderId,
      orderNumber: dispute.order?.orderNumber ?? "",
      resolution: params.resolution,
      resolvedById: params.moderatorId,
    });

    return true;
  }

  async getDisputeById(disputeId: string) {
    const db = getDatabase();

    return db.query.disputes.findFirst({
      where: eq(schema.disputes.id, disputeId),
      with: {
        order: {
          with: {
            listing: true,
            buyer: true,
            seller: true,
          },
        },
        messages: {
          orderBy: [desc(schema.disputeMessages.createdAt)],
          with: { sender: true },
        },
        buyer: true,
        seller: true,
        moderator: true,
      },
    });
  }

  async getDisputesByUser(userId: string, page = 1, limit = 20) {
    const db = getDatabase();

    const disputes = await db.query.disputes.findMany({
      where: or(
        eq(schema.disputes.buyerId, userId),
        eq(schema.disputes.sellerId, userId),
      ),
      orderBy: [desc(schema.disputes.createdAt)],
      limit,
      offset: (page - 1) * limit,
      with: {
        order: { with: { listing: true } },
        buyer: true,
        seller: true,
      },
    });

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.disputes)
      .where(
        or(
          eq(schema.disputes.buyerId, userId),
          eq(schema.disputes.sellerId, userId),
        ),
      );

    return {
      disputes,
      total: Number(countResult[0]?.count ?? 0),
      page,
      limit,
      totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit),
    };
  }

  async getAllDisputes(status?: string, page = 1, limit = 20) {
    const db = getDatabase();
    const conditions: any[] = [];
    if (status)
      conditions.push(eq(schema.disputes.status, status as DisputeStatus));

    const disputes = await db.query.disputes.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(schema.disputes.createdAt)],
      limit,
      offset: (page - 1) * limit,
      with: {
        order: { with: { listing: true } },
        buyer: true,
        seller: true,
      },
    });

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.disputes)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return {
      disputes,
      total: Number(countResult[0]?.count ?? 0),
      page,
      limit,
      totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit),
    };
  }
}

export const disputeService = new DisputeService();
