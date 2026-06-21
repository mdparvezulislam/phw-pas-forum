"use client";

import React, { useState, useTransition } from "react";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  HardDrive,
  Cpu,
  Search,
  Database,
  Cloud,
  RefreshCw,
  Trash2,
  Play,
  Activity,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/admin";
import { adminTriggerReindexAction } from "@/modules/search/actions/search";
import {
  clearMemoryCacheAction,
  recoverIndexJobs,
} from "@/modules/infrastructure/actions/ops";

// --- HEALTH STATUS GRID ---
interface HealthReport {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  details: Record<
    string,
    { status: "up" | "down" | "degraded"; latencyMs: number; error?: string }
  >;
}

export function HealthStatusGrid({ report }: { report: HealthReport }) {
  const servicesList = [
    {
      key: "db",
      name: "PostgreSQL Database",
      icon: <Database className="h-4 w-4" />,
    },
    {
      key: "redis",
      name: "Redis Cache (L2)",
      icon: <HardDrive className="h-4 w-4" />,
    },
    {
      key: "search",
      name: "Typesense Search",
      icon: <Search className="h-4 w-4" />,
    },
    {
      key: "storage",
      name: "Cloudflare R2",
      icon: <Cloud className="h-4 w-4" />,
    },
    { key: "ai", name: "OpenRouter AI", icon: <Cpu className="h-4 w-4" /> },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {servicesList.map((service) => {
        const detail = report.details[service.key] || {
          status: "down",
          latencyMs: 0,
        };
        const isUp = detail.status === "up";
        const isDegraded = detail.status === "degraded";

        return (
          <div
            key={service.key}
            className="flex flex-col justify-between rounded-xl border bg-card p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                {service.icon}
              </span>
              <p className="text-sm font-medium text-card-foreground">
                {service.name}
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-muted-foreground tabular-nums">
                {isUp ? `${Math.round(detail.latencyMs)}ms` : "Offline"}
              </span>
              <Badge
                variant={
                  isUp ? "success" : isDegraded ? "warning" : "destructive"
                }
                size="sm"
              >
                {isUp ? "Online" : isDegraded ? "Degraded" : "Offline"}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- QUEUE MONITOR ---
interface QueueMetrics {
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  waiting: number;
}

export function QueueMonitor({
  metrics,
  onRefresh,
}: {
  metrics: Record<string, QueueMetrics>;
  onRefresh: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleRecoverJobs = () => {
    startTransition(async () => {
      try {
        const res = await recoverIndexJobs();
        if (res.success && "recoveredCount" in res) {
          alert(`Recovered ${res.recoveredCount} failed index jobs.`);
          onRefresh();
        }
      } catch (err: any) {
        alert("Failed to recover jobs: " + err.message);
      }
    });
  };

  return (
    <SectionCard
      title="Background Queues"
      description="BullMQ workers task processing health"
      icon={<Layers className="h-4 w-4" />}
      actions={
        <div className="flex gap-2">
          <button
            onClick={handleRecoverJobs}
            disabled={isPending}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-xs font-semibold hover:bg-muted"
          >
            <RefreshCw className="h-3 w-3" /> Retry Failed Jobs
          </button>
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-xs font-semibold text-muted-foreground">
              <th className="pb-2">Queue Name</th>
              <th className="pb-2 text-right">Active</th>
              <th className="pb-2 text-right">Waiting</th>
              <th className="pb-2 text-right">Delayed</th>
              <th className="pb-2 text-right">Failed</th>
              <th className="pb-2 text-right">Completed</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {Object.entries(metrics).map(([name, counts]) => (
              <tr key={name} className="hover:bg-muted/50">
                <td className="py-2.5 font-medium">{name}</td>
                <td className="py-2.5 text-right tabular-nums">
                  {counts.active}
                </td>
                <td className="py-2.5 text-right tabular-nums">
                  {counts.waiting}
                </td>
                <td className="py-2.5 text-right tabular-nums">
                  {counts.delayed}
                </td>
                <td className="py-2.5 text-right text-destructive tabular-nums font-semibold">
                  {counts.failed}
                </td>
                <td className="py-2.5 text-right text-success tabular-nums">
                  {counts.completed}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

// --- CACHE MONITOR ---
interface CacheStats {
  enabled: boolean;
  memoryUsed: string;
  keysCount: number;
  hitRate: string;
}

export function CacheMonitor({
  stats,
  onRefresh,
}: {
  stats: CacheStats;
  onRefresh: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleClearCache = () => {
    if (!confirm("Are you sure you want to clear the L1 Memory Cache?")) return;
    startTransition(async () => {
      try {
        await clearMemoryCacheAction();
        alert("L1 Memory Cache cleared successfully.");
        onRefresh();
      } catch (err: any) {
        alert("Failed to clear cache: " + err.message);
      }
    });
  };

  return (
    <SectionCard
      title="Cache Optimization"
      description="L1 Memory & L2 Redis Cache metrics"
      icon={<HardDrive className="h-4 w-4" />}
      actions={
        <button
          onClick={handleClearCache}
          disabled={isPending}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-destructive bg-background px-3 text-xs font-semibold text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-3 w-3" /> Flush Memory Cache
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Redis Memory
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums">
            {stats.memoryUsed}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Cached Keys Count
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums">
            {stats.keysCount}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground">
            L2 Key Hit Rate
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums">{stats.hitRate}</p>
        </div>
      </div>
    </SectionCard>
  );
}

// --- SEARCH MONITOR ---
interface SearchMetrics {
  isOperational: boolean;
  latencyMs: number;
  pendingJobs: number;
  failedJobs: number;
}

export function SearchMonitor({
  metrics,
  onRefresh,
}: {
  metrics: SearchMetrics;
  onRefresh: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleReindex = (type: any) => {
    if (
      !confirm(
        `Trigger full search reindexing for ${type}? This rebuilds the collection.`,
      )
    )
      return;
    startTransition(async () => {
      const res = await adminTriggerReindexAction(type);
      if (res.success) {
        alert(res.message);
        onRefresh();
      } else {
        alert("Failed to reindex: " + res.error);
      }
    });
  };

  return (
    <SectionCard
      title="Search Indexing"
      description="Typesense Enterprise indexing performance"
      icon={<Search className="h-4 w-4" />}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground">Status</p>
          <Badge
            className="mt-1"
            variant={metrics.isOperational ? "success" : "destructive"}
          >
            {metrics.isOperational ? "Operational" : "Offline"}
          </Badge>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Query Latency
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums">
            {metrics.latencyMs}ms
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Queue Pending Syncs
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums">
            {metrics.pendingJobs}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Queue Failed Syncs
          </p>
          <p className="mt-1 text-xl font-bold text-destructive tabular-nums">
            {metrics.failedJobs}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground mr-2 self-center">
          Trigger Bulk Reindex:
        </span>
        {["THREAD", "POST", "USER", "MARKETPLACE_LISTING"].map((type) => (
          <button
            key={type}
            onClick={() => handleReindex(type)}
            disabled={isPending}
            className="inline-flex h-7 items-center gap-1 rounded-md border bg-muted px-2.5 text-xs font-medium hover:bg-muted-foreground/10"
          >
            <Play className="h-2.5 w-2.5" /> {type.replace("_", " ")}
          </button>
        ))}
      </div>
    </SectionCard>
  );
}

// --- PERFORMANCE METRICS ---
export function PerformanceMetrics() {
  // Simple CPU/Memory representation
  return (
    <SectionCard
      title="System Load"
      description="Web servers and processing node workloads"
      icon={<Cpu className="h-4 w-4" />}
    >
      <div className="space-y-4">
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Node.js CPU Workload</span>
            <span className="text-sm font-semibold tabular-nums">8%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-muted">
            <div className="h-2 w-[8%] rounded-full bg-success" />
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Docker Memory Workload</span>
            <span className="text-sm font-semibold tabular-nums">54%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-muted">
            <div className="h-2 w-[54%] rounded-full bg-info" />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
export default HealthStatusGrid;
