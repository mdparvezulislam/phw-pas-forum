"use client";

import { useCallback, useEffect, useState } from "react";
import { getSellerDashboardAction } from "@/actions";
import { OrderStatusBadge } from "./order-status-badge";
import { TrustScoreCard } from "./trust-score-card";
import { ITraderCard } from "./itrader-card";

export function SellerDashboard({ userId }: { userId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    const result = await getSellerDashboardAction();
    if (result.success && result.data) {
      setData(result.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p className="text-lg font-medium">Dashboard unavailable</p>
      </div>
    );
  }

  const { stats, recentOrders, activeOrders, deliveredOrders, pendingOrders } = data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Seller Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={`$${((stats?.totalRevenue ?? 0) / 100).toLocaleString()}`}
        />
        <StatCard
          label="Completion Rate"
          value={`${stats?.completionRate ?? 0}%`}
        />
        <StatCard
          label="Active Orders"
          value={activeOrders?.length ?? 0}
        />
        <StatCard
          label="Pending"
          value={pendingOrders?.length ?? 0}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Recent Orders</h2>
            {recentOrders?.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {order.listing?.title ?? "Listing"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        #{order.orderNumber} - {order.buyer?.displayName ?? order.buyer?.username}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        ${(order.amount / 100).toFixed(2)}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent orders</p>
            )}
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Active Orders</h2>
            {activeOrders?.length > 0 ? (
              <div className="space-y-3">
                {activeOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {order.listing?.title ?? "Listing"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        #{order.orderNumber} - {order.buyer?.displayName ?? order.buyer?.username}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        ${(order.amount / 100).toFixed(2)}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active orders</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <TrustScoreCard sellerId={userId} />
          <ITraderCard sellerId={userId} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
