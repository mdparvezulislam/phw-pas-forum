import { Activity, CheckCircle, AlertTriangle } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader, KpiCard } from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import {
  getSystemHealthAction,
  getQueueMetricsAction,
  getCacheMetricsAction,
  getSearchMetricsAction,
} from "@/modules/infrastructure/actions/ops";
import type { HealthCheckReport } from "@/modules/infrastructure/monitoring/health-service";
import {
  HealthStatusGrid,
  QueueMonitor,
  CacheMonitor,
  SearchMonitor,
  PerformanceMetrics,
} from "@/components/admin/operations/ops-dashboard-components";

export const metadata: Metadata = {
  title: "Operations Center",
};

export const dynamic = "force-dynamic";

export default async function AdminOperationsPage() {
  const [healthRes, queueRes, cacheRes, searchRes] = await Promise.all([
    getSystemHealthAction(),
    getQueueMetricsAction(),
    getCacheMetricsAction(),
    getSearchMetricsAction(),
  ]);

  const report = (
    healthRes.success && healthRes.data
      ? healthRes.data
      : {
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          details: {},
        }
  ) as HealthCheckReport;

  const queueMetrics = queueRes.success && queueRes.data ? queueRes.data : {};
  const cacheStats =
    cacheRes.success && cacheRes.data
      ? cacheRes.data
      : {
          enabled: false,
          memoryUsed: "N/A",
          keysCount: 0,
          hitRate: "N/A",
        };
  const searchMetrics =
    searchRes.success && searchRes.data
      ? searchRes.data
      : {
          isOperational: false,
          latencyMs: 0,
          pendingJobs: 0,
          failedJobs: 0,
        };

  const allOperational = report.status === "healthy";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations Center"
        description="System health, infrastructure status, and service monitoring"
        icon={<Activity className="h-5 w-5" />}
        actions={
          <Badge variant={allOperational ? "success" : "warning"} size="lg">
            {allOperational
              ? "All Systems Operational"
              : "Degraded Performance"}
          </Badge>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="System Status"
          value={
            allOperational
              ? "Healthy"
              : report.status === "degraded"
                ? "Degraded"
                : "Unhealthy"
          }
          icon={Activity}
          description="Overall platform health"
          accent={allOperational ? "success" : "warning"}
        />
        <KpiCard
          title="Uptime"
          value="99.98%"
          icon={CheckCircle}
          description="Last 30 days"
          accent="success"
        />
        <KpiCard
          title="DB Latency"
          value={
            report.details.db
              ? `${Math.round(report.details.db.latencyMs)}ms`
              : "N/A"
          }
          icon={Activity}
          description="Average response time"
          accent="info"
        />
        <KpiCard
          title="Search Latency"
          value={`${searchMetrics.latencyMs}ms`}
          icon={Activity}
          description="Query response time"
          accent="info"
        />
      </div>

      <HealthStatusGrid report={report as any} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <QueueMonitor metrics={queueMetrics} onRefresh={() => {}} />
          <CacheMonitor stats={cacheStats} onRefresh={() => {}} />
        </div>
        <div className="space-y-6">
          <SearchMonitor metrics={searchMetrics} onRefresh={() => {}} />
          <PerformanceMetrics />
        </div>
      </div>
    </div>
  );
}
