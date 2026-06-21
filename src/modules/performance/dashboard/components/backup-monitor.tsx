"use client";

import { useCallback, useEffect, useState } from "react";

interface BackupStatus {
  lastBackup: string | null;
  lastBackupSize: string | null;
  lastBackupStatus: "success" | "failed" | null;
  totalBackups: number;
  totalSize: string;
  nextScheduledBackup: string | null;
}

export function BackupMonitor() {
  const [status, setStatus] = useState<BackupStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/backups");
      if (res.ok) {
        setStatus(await res.json());
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 120000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-6 py-4">
        <h3 className="font-semibold">Backup Status</h3>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-2/3 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted" />
          </div>
        ) : status ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <div
                  className={`mx-auto mb-1 h-2.5 w-2.5 rounded-full ${
                    status.lastBackupStatus === "success"
                      ? "bg-emerald-500"
                      : status.lastBackupStatus === "failed"
                        ? "bg-red-500"
                        : "bg-amber-500"
                  }`}
                />
                <p className="text-lg font-bold">
                  {status.lastBackupStatus ?? "N/A"}
                </p>
                <p className="text-xs text-muted-foreground">Last Backup</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-lg font-bold">{status.totalBackups}</p>
                <p className="text-xs text-muted-foreground">Total Backups</p>
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Backup Time</span>
                <span>
                  {status.lastBackup
                    ? new Date(status.lastBackup).toLocaleString()
                    : "Never"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Backup Size</span>
                <span>{status.lastBackupSize ?? "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Size</span>
                <span>{status.totalSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next Scheduled</span>
                <span>
                  {status.nextScheduledBackup
                    ? new Date(status.nextScheduledBackup).toLocaleString()
                    : "Manual only"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Backup data unavailable
          </p>
        )}
      </div>
    </div>
  );
}
