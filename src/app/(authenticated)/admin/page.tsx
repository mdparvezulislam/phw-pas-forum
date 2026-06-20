import type { Metadata } from "next";
import { requireRole } from "@/modules/auth/guards";
import { RoleName } from "@/types/rbac";
import { adminMetricsService } from "@/services/admin-metrics";
import { StatsCard } from "@/components/admin/stats-card";
import { Users, DollarSign, ShoppingCart, Shield, TrendingUp, Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  await requireRole(RoleName.ADMIN);

  const overview = await adminMetricsService.getPlatformOverview();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform overview at a glance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={overview.totalUsers.toLocaleString()}
          icon={Users}
          trend={{ value: 12, positive: true }}
        />
        <StatsCard
          title="Revenue"
          value={`$${overview.revenue.toLocaleString()}`}
          icon={DollarSign}
          description="Total platform revenue"
        />
        <StatsCard
          title="Total Orders"
          value={overview.totalOrders.toLocaleString()}
          icon={ShoppingCart}
        />
        <StatsCard
          title="Pending Reports"
          value={overview.pendingReports.toLocaleString()}
          icon={Shield}
          trend={{ value: 5, positive: false }}
        />
        <StatsCard
          title="Active VIP"
          value={overview.activeVip.toLocaleString()}
          icon={TrendingUp}
          description="Premium subscribers"
        />
        <StatsCard
          title="Active Listings"
          value={overview.totalListings.toLocaleString()}
          icon={Activity}
          description="Marketplace items"
        />
      </div>
    </div>
  );
}
