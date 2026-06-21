"use client";

import { useCallback, useEffect, useState } from "react";

interface SystemStatus {
  status: "healthy" | "degraded" | "unhealthy";
  version: string;
  timestamp: string;
  uptime: number;
  checks: Record<string, ComponentStatus>;
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
}

interface ComponentStatus {
  status: "healthy" | "degraded" | "unhealthy";
  latency: number;
  message?: string;
  details?: Record<string, unknown>;
}

export function SystemStatusCard() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setStatus(data);
      setError(null);
    } catch {
      setError("Failed to fetch system status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-1/3 rounded bg-muted" />
          <div className="h-8 w-1/2 rounded bg-muted" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-3 w-full rounded bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-2 text-destructive">
          <div className="h-2 w-2 rounded-full bg-destructive" />
          <p className="text-sm font-medium">{error}</p>
        </div>
        <button
          type="button"
          onClick={fetchStatus}
          className="mt-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!status) return null;

  const statusColor: Record<string, string> = {
    healthy: "bg-emerald-500",
    degraded: "bg-amber-500",
    unhealthy: "bg-red-500",
  };

  const componentLabels: Record<string, string> = {
    database: "Database",
    redis: "Redis",
    typesense: "Search",
    storage: "Storage",
    circuitBreakers: "Circuit Breakers",
    queues: "Queues",
  };

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h3 className="font-semibold">System Health</h3>
        <div className="flex items-center gap-2">
          <div
            className={`h-2.5 w-2.5 rounded-full ${statusColor[status.status]}`}
          />
          <span className="text-sm font-medium capitalize">
            {status.status}
          </span>
        </div>
      </div>

      <div className="space-y-3 p-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-2xl font-bold text-emerald-500">
              {status.summary.healthy}
            </p>
            <p className="text-xs text-muted-foreground">Healthy</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-2xl font-bold text-amber-500">
              {status.summary.degraded}
            </p>
            <p className="text-xs text-muted-foreground">Degraded</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-2xl font-bold text-red-500">
              {status.summary.unhealthy}
            </p>
            <p className="text-xs text-muted-foreground">Unhealthy</p>
          </div>
        </div>

        <div className="space-y-2">
          {Object.entries(status.checks).map(([key, check]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${statusColor[check.status]}`}
                />
                <span>{componentLabels[key] ?? key}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{check.latency}ms</span>
                <span
                  className={`capitalize ${check.status === "unhealthy" ? "text-red-500" : check.status === "degraded" ? "text-amber-500" : "text-emerald-500"}`}
                >
                  {check.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
          <span>v{status.version}</span>
          <span>Uptime: {status.uptime}s</span>
        </div>
      </div>
    </div>
  );
}
