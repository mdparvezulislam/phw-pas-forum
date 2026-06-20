import { z } from "zod";

export const createOrderSchema = z.object({
  listingId: z.string().min(1, "Listing ID is required"),
  packageId: z.string().optional(),
  requirements: z.string().max(5000).optional(),
  isUrgent: z.number().int().min(0).max(1).default(0),
});

export const acceptOrderSchema = z.object({
  orderId: z.string().min(1),
});

export const deliverOrderSchema = z.object({
  orderId: z.string().min(1),
  deliveryMessage: z.string().max(10000).optional(),
  attachments: z.array(z.string()).max(10).optional(),
  isLastDelivery: z.number().int().min(0).max(1).default(0),
});

export const requestRevisionSchema = z.object({
  orderId: z.string().min(1),
  reason: z.string().min(1, "Revision reason is required").max(2000),
});

export const completeOrderSchema = z.object({
  orderId: z.string().min(1),
});

export const cancelOrderSchema = z.object({
  orderId: z.string().min(1),
  reason: z.string().min(1, "Cancellation reason is required").max(2000),
});

export const sendOrderMessageSchema = z.object({
  orderId: z.string().min(1),
  contentJson: z.any(),
});

export const orderPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
});

export const submitReviewSchema = z.object({
  orderId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  content: z.string().min(1, "Review content is required").max(5000),
  reviewImages: z.array(z.string()).max(5).optional(),
  isRecommended: z.number().int().min(0).max(1).default(1),
});

export const submitITraderFeedbackSchema = z.object({
  orderId: z.string().min(1),
  toUserId: z.string().min(1),
  rating: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]),
  comment: z.string().min(1, "Feedback comment is required").max(2000),
});

export const createDisputeSchema = z.object({
  orderId: z.string().min(1),
  reason: z.string().min(1, "Dispute reason is required").max(200),
  description: z.string().min(1, "Dispute description is required").max(10000),
});

export const sendDisputeMessageSchema = z.object({
  disputeId: z.string().min(1),
  content: z.string().min(1, "Message is required").max(5000),
  isModNote: z.number().int().min(0).max(1).default(0),
});

export const resolveDisputeSchema = z.object({
  disputeId: z.string().min(1),
  resolution: z.string().min(1, "Resolution is required").max(5000),
  action: z.enum(["RESOLVED", "REJECTED"]),
});

export const refundOrderSchema = z.object({
  orderId: z.string().min(1),
  amount: z.number().int().min(1),
  reason: z.string().max(2000).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;
export type SubmitITraderFeedbackInput = z.infer<
  typeof submitITraderFeedbackSchema
>;
export type CreateDisputeInput = z.infer<typeof createDisputeSchema>;
export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;
