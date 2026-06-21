"use client";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  SectionCard,
  AreaTrend,
  BarSeries,
  Donut,
  type DonutDatum,
} from "@/components/admin";
import { formatCurrency } from "@/lib/utils";

function shortDate(iso: string) {
  const [, m, d] = iso.split("-");
  return m && d ? `${m}/${d}` : iso;
}

export interface AnalyticsData {
  registrations: { date: string; count: number }[];
  dailyOrders: { date: string; count: number; revenue: number }[];
  orderStatus: { status: string; count: number }[];
  categoryBreakdown: { name: string; count: number }[];
  topSellers: {
    username: string | null;
    displayName: string | null;
    totalSales: number;
    averageRating: number;
    trustScore: number;
  }[];
  activeByPlan: { planName: string; activeCount: number; monthlyPrice: number }[];
  topSearches: { query: string; count: number }[];
}

export function AnalyticsView({ data }: { data: AnalyticsData }) {
  const regData = data.registrations.map((r) => ({
    date: shortDate(r.date),
    Registrations: r.count,
  }));
  const orderData = data.dailyOrders.map((r) => ({
    date: shortDate(r.date),
    Orders: r.count,
    Revenue: r.revenue,
  }));
  const statusDonut: DonutDatum[] = data.orderStatus.map((s) => ({
    name: s.status,
    value: s.count,
  }));
  const categoryDonut: DonutDatum[] = data.categoryBreakdown
    .filter((c) => c.count > 0)
    .map((c) => ({ name: c.name, value: c.count }));
  const planData = data.activeByPlan.map((p) => ({
    name: p.planName,
    Subscribers: p.activeCount,
  }));
  const searchData = data.topSearches
    .slice(0, 10)
    .map((s) => ({ name: s.query, Searches: s.count }));

  return (
    <Tabs defaultValue="users" className="space-y-4">
      <TabsList className="flex-wrap">
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="orders">Revenue &amp; Orders</TabsTrigger>
        <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        <TabsTrigger value="memberships">Memberships</TabsTrigger>
        <TabsTrigger value="search">Search</TabsTrigger>
      </TabsList>

      {/* Users */}
      <TabsContent value="users">
        <SectionCard
          title="Registrations (30d)"
          description="New members per day"
        >
          <AreaTrend
            data={regData}
            xKey="date"
            dataKey="Registrations"
            accent="info"
            height={300}
          />
        </SectionCard>
      </TabsContent>

      {/* Revenue & Orders */}
      <TabsContent value="orders">
        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard title="Revenue (30d)" description="Daily order revenue">
            <AreaTrend
              data={orderData}
              xKey="date"
              dataKey="Revenue"
              accent="success"
              height={260}
              valueFormatter={(v) => formatCurrency(Number(v))}
            />
          </SectionCard>
          <SectionCard title="Orders (30d)" description="Daily order volume">
            <BarSeries
              data={orderData}
              xKey="date"
              dataKey="Orders"
              accent="primary"
              height={260}
            />
          </SectionCard>
          <SectionCard
            title="Order Status"
            description="Breakdown by status"
            className="lg:col-span-2"
          >
            {statusDonut.length > 0 ? (
              <div className="grid items-center gap-4 sm:grid-cols-2">
                <Donut data={statusDonut} height={240} />
                <div className="space-y-1.5">
                  {data.orderStatus.map((s) => (
                    <div
                      key={s.status}
                      className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                    >
                      <Badge variant="secondary" size="sm">
                        {s.status}
                      </Badge>
                      <span className="font-semibold tabular-nums">
                        {s.count.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No order data yet.
              </p>
            )}
          </SectionCard>
        </div>
      </TabsContent>

      {/* Marketplace */}
      <TabsContent value="marketplace">
        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard
            title="Listings by Category"
            description="Active listing distribution"
          >
            {categoryDonut.length > 0 ? (
              <Donut data={categoryDonut} height={260} />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No category data yet.
              </p>
            )}
          </SectionCard>
          <SectionCard title="Top Sellers" description="By total sales" flush>
            <div className="divide-y">
              {data.topSellers.length === 0 && (
                <p className="p-5 text-center text-sm text-muted-foreground">
                  No sellers yet.
                </p>
              )}
              {data.topSellers.map((s, i) => (
                <div
                  key={s.username ?? i}
                  className="flex items-center gap-3 px-5 py-2.5"
                >
                  <span className="w-5 text-sm font-semibold tabular-nums text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {s.displayName ?? s.username ?? "Seller"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Trust {s.trustScore} · ★ {s.averageRating}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {s.totalSales.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </TabsContent>

      {/* Memberships */}
      <TabsContent value="memberships">
        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard
            title="Active Subscribers by Plan"
            description="Current active memberships"
          >
            {planData.length > 0 ? (
              <BarSeries
                data={planData}
                xKey="name"
                dataKey="Subscribers"
                accent="premium"
                height={260}
              />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No membership plans yet.
              </p>
            )}
          </SectionCard>
          <SectionCard title="Plans" description="Pricing and active count" flush>
            <div className="divide-y">
              {data.activeByPlan.map((p) => (
                <div
                  key={p.planName}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{p.planName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(p.monthlyPrice)}/mo
                    </p>
                  </div>
                  <Badge variant="premium" size="sm">
                    {p.activeCount} active
                  </Badge>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </TabsContent>

      {/* Search */}
      <TabsContent value="search">
        <SectionCard
          title="Top Searches (7d)"
          description="Most frequent search queries"
        >
          {searchData.length > 0 ? (
            <BarSeries
              data={searchData}
              xKey="name"
              dataKey="Searches"
              accent="marketplace"
              height={300}
            />
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No search activity yet.
            </p>
          )}
        </SectionCard>
      </TabsContent>
    </Tabs>
  );
}
