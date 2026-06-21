"use client";

import Link from "next/link";
import type { MarketplaceListing, Order, User } from "@/db/schema";
import { OrderStatusBadge } from "./order-status-badge";

interface OrderWithRelations extends Order {
  listing: MarketplaceListing;
  seller?: User;
  buyer?: User;
}

export function OrderCard({
  order,
  role,
}: {
  order: OrderWithRelations;
  role: "buyer" | "seller";
}) {
  const otherUser = role === "buyer" ? order.seller : order.buyer;

  return (
    <Link
      href={
        role === "buyer" ? `/orders/${order.id}` : `/seller/orders/${order.id}`
      }
      className="block rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <span className="text-xs text-muted-foreground">
              #{order.orderNumber}
            </span>
          </div>
          <h3 className="truncate text-lg font-semibold">
            {order.listing?.title ?? "Listing"}
          </h3>
          <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              {role === "buyer" ? "Seller" : "Buyer"}:{" "}
              {otherUser?.displayName ?? otherUser?.username ?? "Unknown"}
            </span>
            <span>${(order.amount / 100).toFixed(2)}</span>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        {order.isUrgent ? (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900 dark:text-red-400">
            Urgent
          </span>
        ) : null}
      </div>
    </Link>
  );
}
