"use client";

import { useCallback, useEffect, useState } from "react";

interface CollectionMetrics {
  collectionName: string;
  documentCount: number;
  lastSyncAt: string | null;
}

export function SearchMonitor() {
  const [collections, setCollections] = useState<CollectionMetrics[] | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/search");
      if (res.ok) {
        const data = await res.json();
        setCollections(data);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-1/3 rounded bg-muted" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-full rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!collections) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Search metrics unavailable
        </p>
      </div>
    );
  }

  const totalDocs = collections.reduce((sum, c) => sum + c.documentCount, 0);

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Search Index</h3>
          <span className="text-sm text-muted-foreground">
            {totalDocs.toLocaleString()} total docs
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-2">
          {collections.map((col) => (
            <div
              key={col.collectionName}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <span className="font-medium">{col.collectionName}</span>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{col.documentCount.toLocaleString()} docs</span>
                {col.lastSyncAt && (
                  <span>{new Date(col.lastSyncAt).toLocaleTimeString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
