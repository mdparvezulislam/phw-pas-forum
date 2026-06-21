"use client";

import { useCallback, useEffect, useState } from "react";

interface QueueMetrics {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
}

const QUEUE_LABELS: Record<string, string> = {
  email: "Email",
  notification: "Notification",
  ai: "AI",
  "search-index": "Search Index",
  analytics: "Analytics",
  moderation: "Moderation",
  marketplace: "Marketplace",
  "image-processing": "Image Processing",
  leaderboard: "Leaderboard",
  aggregation: "Aggregation",
  "audit-log": "Audit Log",
  cleanup: "Cleanup",
};

export function QueueMonitor() {
  const [queues, setQueues] = useState<Record<string, QueueMetrics> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const fetchQueues = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/queues");
      if (res.ok) {
        const data = await res.json();
        setQueues(data);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueues();
    const interval = setInterval(fetchQueues, 15000);
    return () => clearInterval(interval);
  }, [fetchQueues]);

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-1/3 rounded bg-muted" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 w-full rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!queues) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Queue metrics unavailable
        </p>
        <p className="text-xs text-muted-foreground">
          Redis connection required for queue monitoring
        </p>
      </div>
    );
  }

  const queueEntries = Object.entries(queues);

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-6 py-4">
        <h3 className="font-semibold">Queue Monitor</h3>
      </div>
      <div className="p-6">
        <div className="space-y-2">
          {queueEntries.map(([name, metrics]) => (
            <div
              key={name}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${metrics.paused ? "bg-amber-500" : "bg-emerald-500"}`}
                />
                <span className="font-medium">
                  {QUEUE_LABELS[name] ?? name}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span
                  className={
                    metrics.waiting > 0
                      ? "text-amber-500"
                      : "text-muted-foreground"
                  }
                >
                  {metrics.waiting} waiting
                </span>
                <span className="text-blue-500">{metrics.active} active</span>
                <span
                  className={
                    metrics.failed > 0
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }
                >
                  {metrics.failed} failed
                </span>
                {metrics.paused && (
                  <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-xs text-amber-500">
                    paused
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
