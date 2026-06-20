import type { Metadata } from "next";
import { adminMetricsService } from "@/services/admin-metrics";
import { StatsCard } from "@/components/admin/stats-card";
import { Users, ShoppingCart, Activity, BadgeCheck, Search, DollarSign } from "lucide-react";

export const metadata: Metadata = {
  title: "Analytics Center",
};

export default async function AdminAnalyticsPage() {

  const [userStats, orderStats, marketplace, membership, search] = await Promise.all([
    adminMetricsService.getUserAnalytics(30),
    adminMetricsService.getOrderAnalytics(30),
    adminMetricsService.getMarketplaceAnalytics(),
    adminMetricsService.getMembershipAnalytics(),
    adminMetricsService.getSearchAnalytics(7),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics Center</h1>
        <p className="text-sm text-muted-foreground">Platform metrics and trends</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Registrations (30d)"
          value={userStats.registrations.length.toLocaleString()}
          icon={Users}
        />
        <StatsCard
          title="Orders (30d)"
          value={orderStats.dailyOrders.reduce((s, d) => s + d.count, 0).toLocaleString()}
          icon={ShoppingCart}
        />
        <StatsCard
          title="Top Sellers"
          value={marketplace.topSellers.length}
          icon={Activity}
          description="Active sellers"
        />
        <StatsCard
          title="Active Memberships"
          value={membership.totalActive.toLocaleString()}
          icon={BadgeCheck}
        />
        <StatsCard
          title="Searches (7d)"
          value={search.totalSearches.toLocaleString()}
          icon={Search}
        />
        <StatsCard
          title="Search Queries"
          value={search.topSearches.length}
          icon={Search}
          description="Unique search terms"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">Revenue (30d)</h3>
          <p className="text-3xl font-bold">${orderStats.dailyOrders.reduce((s, d) => s + Number(d.revenue), 0).toLocaleString()}</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">Membership Plans</h3>
          <div className="space-y-1">
            {membership.activeByPlan.map((p: any) => (
              <div key={p.slug} className="flex items-center justify-between text-sm">
                <span>{p.planName}</span>
                <span className="font-medium">{p.activeCount} active</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
