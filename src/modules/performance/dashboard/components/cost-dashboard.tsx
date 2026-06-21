"use client";

import { useCallback, useEffect, useState } from "react";

interface CostBreakdown {
  category: string;
  currentCents: number;
  dailyCents: number;
  monthlyCents: number;
  budgetCents: number;
  percentage: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  ai: "AI",
  storage: "Storage",
  search: "Search",
  realtime: "Realtime",
  infrastructure: "Infrastructure",
};

export function CostDashboard() {
  const [costs, setCosts] = useState<CostBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCosts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/costs");
      if (res.ok) {
        setCosts(await res.json());
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCosts();
    const interval = setInterval(fetchCosts, 60000);
    return () => clearInterval(interval);
  }, [fetchCosts]);

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-1/3 rounded bg-muted" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-full rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  const totalDaily = costs.reduce((sum, c) => sum + c.dailyCents, 0);

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Cost Monitoring</h3>
          <span className="text-sm text-muted-foreground">
            ${(totalDaily / 100).toFixed(2)} / day
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {costs.map((cost) => {
            const pct = Math.min(cost.percentage, 100);
            const isOverBudget = pct > 80;

            return (
              <div key={cost.category}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>
                      {CATEGORY_LABELS[cost.category] ?? cost.category}
                    </span>
                    {isOverBudget && (
                      <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-xs text-red-500">
                        Over {pct.toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <span className="text-muted-foreground">
                    ${(cost.dailyCents / 100).toFixed(2)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverBudget
                        ? "bg-red-500"
                        : pct > 60
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-0.5 flex justify-between text-xs text-muted-foreground">
                  <span>${(cost.dailyCents / 100).toFixed(2)} today</span>
                  <span>${(cost.monthlyCents / 100).toFixed(2)} month</span>
                  <span>
                    Budget: ${(cost.budgetCents / 100).toFixed(2)}/day
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
