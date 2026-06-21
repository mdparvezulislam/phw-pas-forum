import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import {
  Users,
  UserPlus,
  Activity,
  MessageSquare,
  FileText,
  Store,
  ShoppingCart,
  DollarSign,
  CreditCard,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { getDatabase, schema } from "@/db";
import { adminMetricsService } from "@/services/admin-metrics";
import { auth } from "@/lib/auth";
import {
  PageHeader,
  KpiCard,
  SectionCard,
  RevenueCard,
  AreaTrend,
  Sparkline,
  RealtimeActivityFeed,
  type ActivityEntry,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin Dashboard" };

function shortDate(iso: string) {
  const [, m, d] = iso.split("-");
  return m && d ? `${m}/${d}` : iso;
}

export default async function AdminDashboardPage() {
  const db = getDatabase();
  const session = await auth();

  const [overview, userStats, revenueStats, recentUsers, recentThreads] =
    await Promise.all([
      adminMetricsService.getPlatformOverview(),
      adminMetricsService.getUserAnalytics(30),
      adminMetricsService.getRevenueAnalytics(30),
      db.query.users.findMany({
        orderBy: [desc(schema.users.createdAt)],
        limit: 5,
        columns: {
          id: true,
          username: true,
          displayName: true,
          createdAt: true,
        },
      }),
      db.query.threads.findMany({
        orderBy: [desc(schema.threads.createdAt)],
        limit: 4,
        columns: { id: true, title: true, createdAt: true },
      }),
    ]);

  const regSeries = userStats.registrations.map((r) => Number(r.count));
  const revSeries = revenueStats.dailyRevenue.map((r) => Number(r.amount));

  const userGrowthData = userStats.registrations.map((r) => ({
    date: shortDate(r.date),
    Registrations: Number(r.count),
  }));
  const revenueData = revenueStats.dailyRevenue.map((r) => ({
    date: shortDate(r.date),
    Revenue: Number(r.amount),
  }));

  const needsAttention =
    overview.disputedOrders > 0 || overview.pendingReports > 5;

  const activity: ActivityEntry[] = [
    ...recentUsers.map((u) => ({
      id: `u-${u.id}`,
      type: "registration" as const,
      title: u.displayName ?? u.username ?? "New member",
      description: "Joined the community",
      time: formatDateRelative(u.createdAt),
      href: "/admin/users",
    })),
    ...recentThreads.map((t) => ({
      id: `t-${t.id}`,
      type: "generic" as const,
      title: t.title,
      description: "New thread created",
      time: formatDateRelative(t.createdAt),
      href: "/admin/threads",
    })),
  ].slice(0, 8);

  const adminName =
    session?.user?.displayName ?? session?.user?.username ?? "Admin";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Welcome back, ${adminName}`}
        title="Command Center"
        description="Real-time overview of platform health, growth and operations."
        actions={
          <>
            <Badge
              variant={needsAttention ? "warning" : "success"}
              className="gap-1.5"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  needsAttention
                    ? "bg-warning-foreground"
                    : "bg-success-foreground"
                }`}
              />
              {needsAttention ? "Attention needed" : "All systems operational"}
            </Badge>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/moderation">Moderation</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/admin/analytics">
                Analytics <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </>
        }
      />

      {/* KPI grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Users"
          value={overview.totalUsers.toLocaleString()}
          icon={Users}
          accent="primary"
          description={`+${overview.newThisMonth.toLocaleString()} this month`}
          sparkline={<Sparkline data={regSeries} accent="primary" />}
        />
        <KpiCard
          title="New Today"
          value={overview.newToday.toLocaleString()}
          icon={UserPlus}
          accent="info"
          description="Registrations in last 24h"
        />
        <KpiCard
          title="Active Today"
          value={overview.activeUsersToday.toLocaleString()}
          icon={Activity}
          accent="success"
          description="Distinct logins today"
        />
        <KpiCard
          title="Revenue"
          value={formatCurrency(overview.revenue)}
          icon={DollarSign}
          accent="success"
          description="Successful payments"
          sparkline={<Sparkline data={revSeries} accent="success" />}
        />
        <KpiCard
          title="Threads"
          value={overview.totalThreads.toLocaleString()}
          icon={MessageSquare}
          accent="info"
          href="/admin/threads"
        />
        <KpiCard
          title="Posts"
          value={overview.totalPosts.toLocaleString()}
          icon={FileText}
          accent="primary"
        />
        <KpiCard
          title="Active Listings"
          value={overview.totalListings.toLocaleString()}
          icon={Store}
          accent="marketplace"
          href="/admin/marketplace"
        />
        <KpiCard
          title="Orders"
          value={overview.totalOrders.toLocaleString()}
          icon={ShoppingCart}
          accent="primary"
          description={`${overview.completedOrders.toLocaleString()} completed`}
          href="/admin/orders"
        />
        <KpiCard
          title="VIP Members"
          value={overview.activeVip.toLocaleString()}
          icon={CreditCard}
          accent="premium"
          href="/admin/memberships"
        />
        <KpiCard
          title="Pending Reports"
          value={overview.pendingReports.toLocaleString()}
          icon={ShieldAlert}
          accent={overview.pendingReports > 0 ? "danger" : "default"}
          href="/admin/moderation"
        />
        <KpiCard
          title="Disputes"
          value={overview.disputedOrders.toLocaleString()}
          icon={ShieldAlert}
          accent={overview.disputedOrders > 0 ? "warning" : "default"}
          href="/admin/disputes"
        />
        <KpiCard
          title="Listing Queue"
          value={overview.pendingSubmissions.toLocaleString()}
          icon={Store}
          accent={overview.pendingSubmissions > 0 ? "moderator" : "default"}
          href="/admin/marketplace"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueCard
          title="Revenue (30d)"
          value={formatCurrency(revenueStats.totalRevenue)}
          description="Daily successful payments"
          icon={DollarSign}
          accent="success"
          data={revenueData}
          xKey="date"
          dataKey="Revenue"
          valueFormatter={(v) => formatCurrency(Number(v))}
        />
        <SectionCard
          title="User Growth"
          description="New registrations over the last 30 days"
          icon={<Users className="h-4 w-4" />}
        >
          <AreaTrend
            data={userGrowthData}
            xKey="date"
            dataKey="Registrations"
            accent="info"
            height={180}
          />
        </SectionCard>
      </div>

      {/* Activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Recent Activity"
          description="Latest registrations and threads"
          className="lg:col-span-2"
          actions={
            <Button asChild size="sm" variant="ghost">
              <Link href="/admin/audit">View audit log</Link>
            </Button>
          }
        >
          <RealtimeActivityFeed items={activity} />
        </SectionCard>

        <SectionCard title="Quick Actions" description="Jump to common tasks">
          <div className="grid gap-2">
            {[
              { label: "Review moderation queue", href: "/admin/moderation" },
              { label: "Manage users", href: "/admin/users" },
              { label: "Marketplace orders", href: "/admin/orders" },
              { label: "Post announcement", href: "/admin/announcements" },
              { label: "Platform settings", href: "/admin/settings" },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex items-center justify-between rounded-lg border bg-background px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
              >
                {a.label}
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
