"use client";

import { useCallback, useEffect, useState } from "react";

interface RateLimitStatus {
  enabled: boolean;
  currentKeys: number;
  blockedIPs: number;
}

interface SecurityEvent {
  id: string;
  action: string;
  userId: string | null;
  createdAt: string;
  ipAddress: string;
  metadata: Record<string, unknown> | null;
}

export function SecurityDashboard() {
  const [rateLimitStatus, setRateLimitStatus] =
    useState<RateLimitStatus | null>(null);
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [rateRes, eventsRes] = await Promise.all([
        fetch("/api/admin/rate-limits"),
        fetch("/api/admin/security-events"),
      ]);

      if (rateRes.ok) {
        setRateLimitStatus(await rateRes.json());
      }
      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setRecentEvents(data.events ?? []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

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

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-6 py-4">
        <h3 className="font-semibold">Security Overview</h3>
      </div>
      <div className="p-6">
        {rateLimitStatus && (
          <div className="mb-4 grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <div
                className={`mx-auto mb-1 h-2 w-2 rounded-full ${rateLimitStatus.enabled ? "bg-emerald-500" : "bg-amber-500"}`}
              />
              <p className="text-xs text-muted-foreground">Rate Limiting</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-lg font-bold">{rateLimitStatus.currentKeys}</p>
              <p className="text-xs text-muted-foreground">Active Keys</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p
                className={`text-lg font-bold ${rateLimitStatus.blockedIPs > 0 ? "text-red-500" : ""}`}
              >
                {rateLimitStatus.blockedIPs}
              </p>
              <p className="text-xs text-muted-foreground">Blocked IPs</p>
            </div>
          </div>
        )}

        <div>
          <h4 className="mb-2 text-sm font-medium">Recent Security Events</h4>
          {recentEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No recent security events
            </p>
          ) : (
            <div className="space-y-2">
              {recentEvents.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-red-500/10 px-1.5 py-0.5 font-medium text-red-500">
                      {event.action
                        .replace("AUTH_", "")
                        .replace("SECURITY_", "")}
                    </span>
                    <span className="text-muted-foreground">
                      {event.userId
                        ? event.userId.substring(0, 8)
                        : "anonymous"}
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    {new Date(event.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
