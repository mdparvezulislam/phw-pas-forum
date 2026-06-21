import type { Metadata } from "next";
import {
  Users,
  ShoppingCart,
  DollarSign,
  BadgeCheck,
  Search,
  Store,
} from "lucide-react";
import { adminMetricsService } from "@/services/admin-metrics";
import { PageHeader, KpiCard } from "@/components/admin";
import { formatCurrency } from "@/lib/utils";
import { AnalyticsView, type AnalyticsData } from "./analytics-view";

export const metadata: Metadata = { title: "Analytics Center" };

export default async function AdminAnalyticsPage() {
  const [userStats, orderStats, marketplace, membership, search] =
    await Promise.all([
      adminMetricsService.getUserAnalytics(30),
      adminMetricsService.getOrderAnalytics(30),
      adminMetricsService.getMarketplaceAnalytics(),
      adminMetricsService.getMembershipAnalytics(),
      adminMetricsService.getSearchAnalytics(7),
    ]);

  const totalRegistrations = userStats.registrations.reduce(
    (s, r) => s + Number(r.count),
    0,
  );
  const totalOrders = orderStats.dailyOrders.reduce(
    (s, d) => s + Number(d.count),
    0,
  );
  const totalRevenue = orderStats.dailyOrders.reduce(
    (s, d) => s + Number(d.revenue),
    0,
  );

  const data: AnalyticsData = {
    registrations: userStats.registrations.map((r) => ({
      date: r.date,
      count: Number(r.count),
    })),
    dailyOrders: orderStats.dailyOrders.map((d) => ({
      date: d.date,
      count: Number(d.count),
      revenue: Number(d.revenue),
    })),
    orderStatus: orderStats.statusBreakdown.map((s) => ({
      status: s.status,
      count: Number(s.count),
    })),
    categoryBreakdown: marketplace.categoryBreakdown.map((c) => ({
      name: c.name,
      count: Number(c.count),
    })),
    topSellers: marketplace.topSellers.map((s) => ({
      username: s.username,
      displayName: s.displayName,
      totalSales: Number(s.totalSales ?? 0),
      averageRating: Number(s.averageRating ?? 0),
      trustScore: Number(s.trustScore ?? 0),
    })),
    activeByPlan: membership.activeByPlan.map((p) => ({
      planName: p.planName,
      activeCount: Number(p.activeCount),
      monthlyPrice: Number(p.monthlyPrice ?? 0),
    })),
    topSearches: search.topSearches.map((s) => ({
      query: s.query,
      count: Number(s.count),
    })),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics Center"
        description="Platform metrics and trends across every module."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          title="Registrations (30d)"
          value={totalRegistrations.toLocaleString()}
          icon={Users}
          accent="info"
        />
        <KpiCard
          title="Orders (30d)"
          value={totalOrders.toLocaleString()}
          icon={ShoppingCart}
          accent="primary"
        />
        <KpiCard
          title="Revenue (30d)"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          accent="success"
        />
        <KpiCard
          title="Active Members"
          value={membership.totalActive.toLocaleString()}
          icon={BadgeCheck}
          accent="premium"
        />
        <KpiCard
          title="Searches (7d)"
          value={search.totalSearches.toLocaleString()}
          icon={Search}
          accent="marketplace"
        />
        <KpiCard
          title="Top Sellers"
          value={marketplace.topSellers.length.toLocaleString()}
          icon={Store}
          accent="marketplace"
        />
      </div>

      <AnalyticsView data={data} />
    </div>
  );
}
