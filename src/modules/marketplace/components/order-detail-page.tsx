"use client";

import { useCallback, useEffect, useState } from "react";
import {
  cancelOrderAction,
  completeOrderAction,
  createDisputeAction,
  getOrderByIdAction,
  requestRevisionAction,
  sendOrderMessageAction,
  submitITraderFeedbackAction,
  submitReviewAction,
} from "@/actions";
import type {
  BuyerReview,
  Dispute,
  ListingPackage,
  MarketplaceListing,
  Order,
  OrderDelivery,
  OrderMessage,
  OrderRevision,
  Transaction,
  User,
} from "@/db/schema";
import { OrderChat } from "./order-chat";
import { OrderDeliveryCard } from "./order-delivery-card";
import { OrderStatusBadge } from "./order-status-badge";
import { OrderTimeline } from "./order-timeline";
import { TrustScoreCard } from "./trust-score-card";

interface OrderWithFullRelations extends Order {
  buyer: User;
  seller: User;
  listing: MarketplaceListing & { packages: ListingPackage[] };
  messages: (OrderMessage & { sender: User })[];
  deliveries: (OrderDelivery & { seller: User })[];
  revisions: (OrderRevision & { requester: User })[];
  transactions: Transaction[];
  dispute: Dispute | null;
  review: BuyerReview | null;
}

export function OrderDetailPage({
  orderId,
  userId,
}: {
  orderId: string;
  userId: string;
}) {
  const [order, setOrder] = useState<OrderWithFullRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    const result = await getOrderByIdAction(orderId);
    if (result.success && result.order) {
      setOrder(result.order);
    } else {
      setError(result.error ?? "Failed to load order");
    }
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p className="text-lg font-medium">Error</p>
        <p className="text-sm">{error ?? "Order not found"}</p>
      </div>
    );
  }

  const isBuyer = order.buyerId === userId;
  const isSeller = order.sellerId === userId;

  const handleAction = async (action: string, actionFn: () => Promise<any>) => {
    setActionLoading(action);
    try {
      await actionFn();
      await fetchOrder();
    } catch (err: any) {
      console.error(err);
    }
    setActionLoading(null);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
              <p className="text-muted-foreground">{order.listing?.title}</p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Amount:</span>
              <span className="ml-2 font-medium">
                ${(order.amount / 100).toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Created:</span>
              <span className="ml-2">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">
                {isBuyer ? "Seller:" : "Buyer:"}
              </span>
              <span className="ml-2 font-medium">
                {isBuyer
                  ? (order.seller?.displayName ?? order.seller?.username)
                  : (order.buyer?.displayName ?? order.buyer?.username)}
              </span>
            </div>
            {order.isUrgent ? (
              <div>
                <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                  Urgent
                </span>
              </div>
            ) : null}
          </div>

          {order.requirements && (
            <div className="mt-4 rounded-lg bg-muted p-3">
              <p className="text-sm font-medium">Requirements</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {order.requirements}
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {isBuyer && order.status === "DELIVERED" && (
              <>
                <button
                  onClick={() =>
                    handleAction("complete", () =>
                      completeOrderAction({ orderId: order.id }),
                    )
                  }
                  disabled={actionLoading === "complete"}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading === "complete"
                    ? "Processing..."
                    : "Complete Order"}
                </button>
                <button
                  onClick={() => {
                    const reason = prompt("Reason for revision:");
                    if (reason) {
                      handleAction("revision", () =>
                        requestRevisionAction({ orderId: order.id, reason }),
                      );
                    }
                  }}
                  disabled={actionLoading === "revision"}
                  className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                >
                  Request Revision
                </button>
              </>
            )}
            {(isBuyer || isSeller) &&
              ["PENDING", "ACCEPTED"].includes(order.status) && (
                <button
                  onClick={() => {
                    const reason = prompt("Cancellation reason:");
                    if (reason) {
                      handleAction("cancel", () =>
                        cancelOrderAction({ orderId: order.id, reason }),
                      );
                    }
                  }}
                  disabled={actionLoading === "cancel"}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {actionLoading === "cancel"
                    ? "Processing..."
                    : "Cancel Order"}
                </button>
              )}
            {isBuyer && order.status === "COMPLETED" && !order.review && (
              <ReviewSection
                orderId={order.id}
                sellerId={order.sellerId}
                onSubmitted={fetchOrder}
              />
            )}
            {isBuyer &&
              !["COMPLETED", "CANCELLED", "REFUNDED"].includes(order.status) &&
              order.status !== "DISPUTED" && (
                <button
                  onClick={() => {
                    const reason = prompt("Dispute reason:");
                    const description = prompt("Describe the issue:");
                    if (reason && description) {
                      handleAction("dispute", () =>
                        createDisputeAction({
                          orderId: order.id,
                          reason,
                          description,
                        }),
                      );
                    }
                  }}
                  disabled={actionLoading === "dispute"}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {actionLoading === "dispute"
                    ? "Processing..."
                    : "Open Dispute"}
                </button>
              )}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Timeline</h2>
          <OrderTimeline order={order} />
        </div>

        {order.deliveries.length > 0 && (
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Deliveries</h2>
            <div className="space-y-4">
              {order.deliveries.map((delivery) => (
                <OrderDeliveryCard key={delivery.id} delivery={delivery} />
              ))}
            </div>
          </div>
        )}

        {order.review && (
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Review</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-lg ${i < order.review!.rating ? "text-yellow-400" : "text-gray-300"}`}
                  >
                    ★
                  </span>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {order.review.rating}/5
                </span>
              </div>
              <p className="text-sm">{order.review.content}</p>
              {order.review.isRecommended ? (
                <p className="text-xs text-green-600">Recommended</p>
              ) : null}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <TrustScoreCard sellerId={order.sellerId} />

        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">iTrader History</h2>
          <ITraderSummary sellerId={order.sellerId} />
        </div>

        <div className="rounded-lg border bg-card">
          <div className="p-4">
            <h2 className="text-lg font-semibold">Order Chat</h2>
          </div>
          <OrderChat
            orderId={order.id}
            userId={userId}
            messages={order.messages}
          />
        </div>

        {order.transactions.length > 0 && (
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Transactions</h2>
            <div className="space-y-2">
              {order.transactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between rounded-lg bg-muted p-2 text-sm"
                >
                  <div>
                    <span className="font-medium">{txn.type}</span>
                    <span className="ml-2 text-muted-foreground">
                      {txn.status}
                    </span>
                  </div>
                  <span className="font-medium">
                    ${(txn.amount / 100).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewSection({
  orderId,
  sellerId,
  onSubmitted,
}: {
  orderId: string;
  sellerId: string;
  onSubmitted: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [itraderRating, setItraderRating] = useState<
    "POSITIVE" | "NEUTRAL" | "NEGATIVE"
  >("POSITIVE");
  const [itraderComment, setItraderComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitReviewAction({ orderId, rating, content });
      await submitITraderFeedbackAction({
        orderId,
        toUserId: sellerId,
        rating: itraderRating,
        comment: itraderComment || "Great transaction!",
      });
      onSubmitted();
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Leave Review
      </button>
    );
  }

  return (
    <div className="w-full space-y-3 rounded-lg border p-4">
      <h3 className="font-medium">Leave a Review</h3>

      <div>
        <p className="mb-1 text-sm">Rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="text-2xl"
            >
              <span
                className={star <= rating ? "text-yellow-400" : "text-gray-300"}
              >
                ★
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 text-sm">Review</p>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-lg border bg-background p-2 text-sm"
          rows={3}
          placeholder="Share your experience..."
        />
      </div>

      <div>
        <p className="mb-1 text-sm">iTrader Rating</p>
        <select
          value={itraderRating}
          onChange={(e) => setItraderRating(e.target.value as any)}
          className="w-full rounded-lg border bg-background p-2 text-sm"
        >
          <option value="POSITIVE">Positive</option>
          <option value="NEUTRAL">Neutral</option>
          <option value="NEGATIVE">Negative</option>
        </select>
      </div>

      <div>
        <p className="mb-1 text-sm">iTrader Comment</p>
        <textarea
          value={itraderComment}
          onChange={(e) => setItraderComment(e.target.value)}
          className="w-full rounded-lg border bg-background p-2 text-sm"
          rows={2}
          placeholder="Feedback comment..."
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={submitting || !content}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
        <button
          onClick={() => setShowForm(false)}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function ITraderSummary({ sellerId }: { sellerId: string }) {
  return (
    <div className="text-sm text-muted-foreground">
      <p>iTrader feedback available after order completion</p>
    </div>
  );
}
