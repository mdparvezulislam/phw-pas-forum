"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Package,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getBuyerOrdersAction } from "@/actions";
import { MarketplaceEmptyState } from "@/components/marketplace";
import { formatCurrency } from "@/lib/utils";
import { OrderStatusBadge } from "./order-status-badge";

export function OrderDashboard({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const tabs = [
    { label: "All", value: "", icon: Package },
    { label: "Active", value: "IN_PROGRESS", icon: Clock },
    { label: "Delivered", value: "DELIVERED", icon: ShoppingBag },
    { label: "Completed", value: "COMPLETED", icon: CheckCircle2 },
    { label: "Disputed", value: "DISPUTED", icon: AlertTriangle },
  ];

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const result = await getBuyerOrdersAction({
      status: activeTab || undefined,
      page,
      limit: 20,
    });
    if (result.success && result.data) {
      setOrders(result.data.orders);
      setTotalPages(result.data.totalPages);
    }
    setLoading(false);
  }, [activeTab, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track and manage your marketplace orders
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              onClick={() => {
                setActiveTab(tab.value);
                setPage(1);
              }}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Orders */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : orders.length === 0 ? (
        <MarketplaceEmptyState type="no-orders" />
      ) : (
        <div className="space-y-3">
          {orders.map((order: any) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-md hover:shadow-primary/5"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                {(order.listing?.title ?? "O")[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold group-hover:text-primary transition-colors">
                  {order.listing?.title ?? "Order"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  #{order.orderNumber} &middot; Seller:{" "}
                  {order.seller?.displayName ??
                    order.seller?.username ??
                    "Unknown"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold">
                  {formatCurrency(order.amount)}
                </span>
                <OrderStatusBadge status={order.status} />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
