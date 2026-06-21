import { KpiSkeleton, ChartSkeleton } from "@/components/admin";

export default function MarketplaceLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-56 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-80 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-4 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                <div className="h-8 w-full animate-pulse rounded-lg bg-muted" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-4 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                <div className="h-8 w-full animate-pulse rounded-lg bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
