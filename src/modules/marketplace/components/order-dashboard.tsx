"use client";

import { useCallback, useEffect, useState } from "react";
import { getBuyerOrdersAction } from "@/actions";
import type { Order, MarketplaceListing, User } from "@/db/schema";
import { OrderCard } from "./order-card";
import { OrderStatusBadge } from "./order-status-badge";

interface OrderWithRelations extends Order {
  listing: MarketplaceListing;
  seller: User;
}

export function OrderDashboard({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const tabs = [
    { label: "All", value: "" },
    { label: "Active", value: "IN_PROGRESS" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Disputed", value: "DISPUTED" },
  ];

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const result = await getBuyerOrdersAction({ status: activeTab || undefined, page, limit: 20 });
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Orders</h1>
      </div>

      <div className="flex gap-2 border-b pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setActiveTab(tab.value);
              setPage(1);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <p className="text-lg">No orders found</p>
          <p className="text-sm">Browse the marketplace to place your first order</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} role="buyer" />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg px-3 py-1 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg px-3 py-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
