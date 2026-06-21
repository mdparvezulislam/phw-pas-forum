"use client";

import { useCallback, useEffect, useState } from "react";

interface Deployment {
  id: string;
  version: string;
  environment: string;
  status: "deploying" | "healthy" | "failed" | "rolled_back";
  deployedAt: string;
  commitSha: string;
  commitMessage: string;
}

interface Release {
  version: string;
  date: string;
  changelog: string[];
  status: "current" | "previous" | "rollback";
}

export function DeploymentDashboard() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeployments = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/deployments");
      if (res.ok) {
        setDeployments(await res.json());
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeployments();
    const interval = setInterval(fetchDeployments, 60000);
    return () => clearInterval(interval);
  }, [fetchDeployments]);

  const releases: Release[] = [
    {
      version: "1.0.0",
      date: new Date().toISOString().split("T")[0],
      changelog: [
        "Production launch - complete platform",
        "AI-powered moderation and recommendations",
        "Marketplace with ordering and dispute system",
        "Premium memberships with tiered benefits",
        "Real-time notifications and messaging",
        "Performance optimization and caching layer",
      ],
      status: "current",
    },
  ];

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-6 py-4">
        <h3 className="font-semibold">Deployments</h3>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 w-full rounded bg-muted" />
            ))}
          </div>
        ) : deployments.length > 0 ? (
          <div className="space-y-2">
            {deployments.map((dep) => (
              <div
                key={dep.id}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      dep.status === "healthy"
                        ? "bg-emerald-500"
                        : dep.status === "deploying"
                          ? "bg-blue-500"
                          : dep.status === "failed"
                            ? "bg-red-500"
                            : "bg-amber-500"
                    }`}
                  />
                  <span className="font-medium">{dep.version}</span>
                  <span className="text-xs text-muted-foreground">
                    {dep.environment}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-mono">
                    {dep.commitSha?.substring(0, 7)}
                  </span>
                  <span>{new Date(dep.deployedAt).toLocaleDateString()}</span>
                  <span
                    className={`capitalize ${
                      dep.status === "healthy"
                        ? "text-emerald-500"
                        : dep.status === "failed"
                          ? "text-red-500"
                          : ""
                    }`}
                  >
                    {dep.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {releases.map((release) => (
              <div key={release.version} className="rounded-md border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">
                      v{release.version}
                    </span>
                    {release.status === "current" && (
                      <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-500">
                        Current
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {release.date}
                  </span>
                </div>
                <ul className="space-y-1">
                  {release.changelog.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
