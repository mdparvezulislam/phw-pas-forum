"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getSellerDashboardAction } from "@/actions";
import { OrderStatusBadge } from "./order-status-badge";
import { TrustScoreCard } from "./trust-score-card";
import { TrustBadge, SellerLevel } from "@/components/marketplace";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Clock,
  Star,
  Package,
  Eye,
  ArrowUpRight,
  BarChart3,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

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
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground/30" />
        <p className="text-lg font-medium">Dashboard unavailable</p>
        <p className="mt-1 text-sm">Set up your seller profile to get started.</p>
      </div>
    );
  }

  const { stats, recentOrders, activeOrders, deliveredOrders, pendingOrders } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Seller Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your marketplace performance at a glance
          </p>
        </div>
        <Link
          href="/seller/orders"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          View All Orders
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          color="text-emerald-600 dark:text-emerald-400"
          bg="bg-emerald-500/10"
        />
        <StatCard
          icon={TrendingUp}
          label="Completion Rate"
          value={`${stats?.completionRate ?? 0}%`}
          color="text-blue-600 dark:text-blue-400"
          bg="bg-blue-500/10"
        />
        <StatCard
          icon={Package}
          label="Active Orders"
          value={activeOrders?.length ?? 0}
          color="text-primary"
          bg="bg-primary/10"
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={pendingOrders?.length ?? 0}
          color="text-amber-600 dark:text-amber-400"
          bg="bg-amber-500/10"
        />
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Active Orders */}
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="font-semibold">Active Orders</h2>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {activeOrders?.length ?? 0}
              </span>
            </div>
            {activeOrders?.length > 0 ? (
              <div className="divide-y">
                {activeOrders.map((order: any) => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </div>
            ) : (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                No active orders right now
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="font-semibold">Recent Orders</h2>
              <Link
                href="/seller/orders"
                className="text-xs text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            {recentOrders?.length > 0 ? (
              <div className="divide-y">
                {recentOrders.map((order: any) => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </div>
            ) : (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                No orders yet
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <TrustScoreCard sellerId={userId} />

          {/* Quick Stats */}
          <div className="overflow-hidden rounded-xl border bg-card p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Performance
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Eye className="h-3.5 w-3.5" />
                  Total Views
                </span>
                <span className="font-medium">
                  {(stats?.totalViews ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Star className="h-3.5 w-3.5" />
                  Avg. Rating
                </span>
                <span className="font-medium">
                  {stats?.averageRating
                    ? (Number(stats.averageRating) > 100
                        ? (Number(stats.averageRating) / 100).toFixed(1)
                        : Number(stats.averageRating).toFixed(1))
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Delivered
                </span>
                <span className="font-medium">
                  {deliveredOrders?.length ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderRow({ order }: { order: any }) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-accent/50"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {order.listing?.title ?? "Listing"}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          #{order.orderNumber} &middot;{" "}
          {order.buyer?.displayName ?? order.buyer?.username ?? "Buyer"}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold">
          {formatCurrency(order.amount)}
        </span>
        <OrderStatusBadge status={order.status} />
      </div>
    </Link>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string | number;
  color: string;
  bg: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
