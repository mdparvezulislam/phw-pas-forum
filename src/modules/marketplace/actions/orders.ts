"use server";

import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@/db/schema/orders";
import { requireAuth, requireRole } from "@/modules/auth/guards";
import { disputeService } from "@/services/dispute-service";
import { orderService } from "@/services/order-service";
import { trustEngine } from "@/services/trust-engine";
import { RoleName } from "@/types/rbac";
import {
  acceptOrderSchema,
  cancelOrderSchema,
  completeOrderSchema,
  createDisputeSchema,
  createOrderSchema,
  deliverOrderSchema,
  orderPaginationSchema,
  refundOrderSchema,
  requestRevisionSchema,
  resolveDisputeSchema,
  sendDisputeMessageSchema,
  sendOrderMessageSchema,
  submitITraderFeedbackSchema,
  submitReviewSchema,
} from "@/validations/orders";

export async function createOrderAction(
  input: unknown,
): Promise<{ success: boolean; order?: any; error?: string }> {
  try {
    const user = await requireAuth();
    const data = createOrderSchema.parse(input);
    const order = await orderService.createOrder({
      buyerId: user.id,
      listingId: data.listingId,
      packageId: data.packageId,
      requirements: data.requirements,
      isUrgent: data.isUrgent,
    });
    revalidatePath("/orders");
    return { success: true, order };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function acceptOrderAction(
  input: unknown,
): Promise<{ success: boolean; order?: any; error?: string }> {
  try {
    const user = await requireAuth();
    const data = acceptOrderSchema.parse(input);
    const order = await orderService.acceptOrder(data.orderId, user.id);
    revalidatePath("/seller/orders");
    revalidatePath(`/seller/orders/${data.orderId}`);
    return { success: true, order };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function deliverOrderAction(
  input: unknown,
): Promise<{ success: boolean; order?: any; error?: string }> {
  try {
    const user = await requireAuth();
    const data = deliverOrderSchema.parse(input);
    const order = await orderService.deliverOrder({
      orderId: data.orderId,
      sellerId: user.id,
      deliveryMessage: data.deliveryMessage,
      attachments: data.attachments,
      isLastDelivery: data.isLastDelivery,
    });
    revalidatePath("/seller/orders");
    revalidatePath(`/seller/orders/${data.orderId}`);
    return { success: true, order };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function requestRevisionAction(
  input: unknown,
): Promise<{ success: boolean; order?: any; error?: string }> {
  try {
    const user = await requireAuth();
    const data = requestRevisionSchema.parse(input);
    const order = await orderService.requestRevision(
      data.orderId,
      user.id,
      data.reason,
    );
    revalidatePath(`/orders/${data.orderId}`);
    return { success: true, order };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function completeOrderAction(
  input: unknown,
): Promise<{ success: boolean; order?: any; error?: string }> {
  try {
    const user = await requireAuth();
    const data = completeOrderSchema.parse(input);
    const order = await orderService.completeOrder(data.orderId, user.id);
    revalidatePath("/orders");
    revalidatePath(`/orders/${data.orderId}`);
    return { success: true, order };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function cancelOrderAction(
  input: unknown,
): Promise<{ success: boolean; order?: any; error?: string }> {
  try {
    const user = await requireAuth();
    const data = cancelOrderSchema.parse(input);
    const order = await orderService.cancelOrder(
      data.orderId,
      user.id,
      data.reason,
    );
    revalidatePath("/orders");
    revalidatePath("/seller/orders");
    return { success: true, order };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function submitReviewAction(
  input: unknown,
): Promise<{ success: boolean; review?: any; error?: string }> {
  try {
    const user = await requireAuth();
    const data = submitReviewSchema.parse(input);
    const review = await orderService.submitReview({
      orderId: data.orderId,
      buyerId: user.id,
      rating: data.rating,
      content: data.content,
      reviewImages: data.reviewImages,
      isRecommended: data.isRecommended,
    });
    revalidatePath(`/orders/${data.orderId}`);
    revalidatePath("/orders");
    return { success: true, review };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function submitITraderFeedbackAction(
  input: unknown,
): Promise<{ success: boolean; feedback?: any; error?: string }> {
  try {
    const user = await requireAuth();
    const data = submitITraderFeedbackSchema.parse(input);
    const feedback = await orderService.submitITraderFeedback({
      orderId: data.orderId,
      fromUserId: user.id,
      toUserId: data.toUserId,
      rating: data.rating,
      comment: data.comment,
    });
    revalidatePath(`/orders/${data.orderId}`);
    return { success: true, feedback };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function sendOrderMessageAction(
  input: unknown,
): Promise<{ success: boolean; message?: any; error?: string }> {
  try {
    const user = await requireAuth();
    const data = sendOrderMessageSchema.parse(input);
    const message = await orderService.sendOrderMessage(
      data.orderId,
      user.id,
      data.contentJson,
    );
    revalidatePath(`/orders/${data.orderId}`);
    return { success: true, message };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function getBuyerOrdersAction(
  input: unknown,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const user = await requireAuth();
    const params = orderPaginationSchema.parse(input ?? {});
    const data = await orderService.getBuyerOrders(
      user.id,
      params.status,
      params.page,
      params.limit,
    );
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function getSellerOrdersAction(
  input: unknown,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const user = await requireAuth();
    const params = orderPaginationSchema.parse(input ?? {});
    const data = await orderService.getSellerOrders(
      user.id,
      params.status,
      params.page,
      params.limit,
    );
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function getOrderByIdAction(orderId: string): Promise<{
  success: boolean;
  order?: any;
  error?: string;
}> {
  try {
    const user = await requireAuth();
    const order = await orderService.getOrderById(orderId, user.id);
    return { success: true, order };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function getSellerDashboardAction(): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const user = await requireAuth();
    const stats = await trustEngine.getSellerStats(user.id);
    const recentOrders = await trustEngine.getRecentOrders(user.id);
    const activeOrders = await orderService.getSellerOrders(
      user.id,
      "ACCEPTED",
    );
    const deliveredOrders = await orderService.getSellerOrders(
      user.id,
      "DELIVERED",
    );
    const pendingOrders = await orderService.getSellerOrders(
      user.id,
      "PENDING",
    );
    return {
      success: true,
      data: {
        stats,
        recentOrders,
        activeOrders: activeOrders.orders,
        deliveredOrders: deliveredOrders.orders,
        pendingOrders: pendingOrders.orders,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function createDisputeAction(
  input: unknown,
): Promise<{ success: boolean; dispute?: any; error?: string }> {
  try {
    const user = await requireAuth();
    const data = createDisputeSchema.parse(input);

    const order = await orderService.getOrderById(data.orderId, user.id);

    const dispute = await disputeService.createDispute({
      orderId: data.orderId,
      buyerId: user.id,
      sellerId: order.sellerId,
      reason: data.reason,
      description: data.description,
    });
    revalidatePath(`/orders/${data.orderId}`);
    revalidatePath("/orders");
    return { success: true, dispute };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function sendDisputeMessageAction(
  input: unknown,
): Promise<{ success: boolean; message?: any; error?: string }> {
  try {
    const user = await requireAuth();
    const data = sendDisputeMessageSchema.parse(input);
    const message = await disputeService.sendMessage({
      disputeId: data.disputeId,
      senderId: user.id,
      content: data.content,
      isModNote: data.isModNote,
    });
    revalidatePath(`/disputes/${data.disputeId}`);
    return { success: true, message };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function resolveDisputeAction(
  input: unknown,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireRole(RoleName.MODERATOR);
    const data = resolveDisputeSchema.parse(input);
    await disputeService.resolveDispute({
      disputeId: data.disputeId,
      moderatorId: user.id,
      resolution: data.resolution,
      action: data.action,
    });
    revalidatePath("/admin/disputes");
    revalidatePath(`/admin/disputes/${data.disputeId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function refundOrderAction(
  input: unknown,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireRole(RoleName.MODERATOR);
    const data = refundOrderSchema.parse(input);
    await orderService.processRefund(
      data.orderId,
      user.id,
      data.amount,
      data.reason,
    );
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function getDisputeByIdAction(disputeId: string): Promise<{
  success: boolean;
  dispute?: any;
  error?: string;
}> {
  try {
    const user = await requireAuth();
    const dispute = await disputeService.getDisputeById(disputeId);
    if (!dispute) return { success: false, error: "Dispute not found" };
    if (
      dispute.buyerId !== user.id &&
      dispute.sellerId !== user.id &&
      !(await isModerator(user.id))
    ) {
      return { success: false, error: "Unauthorized" };
    }
    return { success: true, dispute };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

async function isModerator(userId: string): Promise<boolean> {
  const { getDatabase, schema } = await import("@/db");
  const db = getDatabase();
  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, userId),
    with: { role: true },
  });
  return user?.role?.name
    ? ["MODERATOR", "ADMIN", "SUPER_ADMIN"].includes(user.role.name)
    : false;
}

export async function getAllDisputesAction(
  input: unknown,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const user = await requireRole(RoleName.MODERATOR);
    const params = orderPaginationSchema.parse(input ?? {});
    const data = await disputeService.getAllDisputes(
      params.status,
      params.page,
      params.limit,
    );
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function getAllOrdersAction(
  input: unknown,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const user = await requireRole(RoleName.MODERATOR);
    const params = orderPaginationSchema.parse(input ?? {});
    const { getDatabase, schema } = await import("@/db");
    const { and, eq, desc, sql } = await import("drizzle-orm");
    const db = getDatabase();
    const conditions: any[] = [];
    if (params.status)
      conditions.push(eq(schema.orders.status, params.status as OrderStatus));

    const orders = await db.query.orders.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(schema.orders.createdAt)],
      limit: params.limit,
      offset: (params.page - 1) * params.limit,
      with: { buyer: true, seller: true, listing: true },
    });

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.orders)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return {
      success: true,
      data: {
        orders,
        total: Number(countResult[0]?.count ?? 0),
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(
          Number(countResult[0]?.count ?? 0) / params.limit,
        ),
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}
