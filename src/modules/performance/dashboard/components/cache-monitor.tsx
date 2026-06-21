"use client";

import { useCallback, useEffect, useState } from "react";

interface CacheHealth {
  connected: boolean;
  hitRate: number;
  memoryUsage: string;
  uptime: number;
}

export function CacheMonitor() {
  const [health, setHealth] = useState<CacheHealth | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCacheHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/cache");
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCacheHealth();
    const interval = setInterval(fetchCacheHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchCacheHealth]);

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-1/3 rounded bg-muted" />
          <div className="h-20 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Cache metrics unavailable
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-6 py-4">
        <h3 className="font-semibold">Cache Performance</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-2xl font-bold">
              {Math.round(health.hitRate * 100)}%
            </p>
            <p className="text-xs text-muted-foreground">Hit Rate</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <div
              className={`mx-auto mb-1 h-2.5 w-2.5 rounded-full ${health.connected ? "bg-emerald-500" : "bg-red-500"}`}
            />
            <p className="text-xs text-muted-foreground">
              {health.connected ? "Connected" : "Disconnected"}
            </p>
          </div>
        </div>
        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Memory Usage</span>
            <span>{health.memoryUsage}</span>
          </div>
          <div className="flex justify-between">
            <span>Uptime</span>
            <span>
              {Math.floor(health.uptime / 3600)}h{" "}
              {Math.floor((health.uptime % 3600) / 60)}m
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
