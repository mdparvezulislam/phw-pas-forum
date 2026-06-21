import { KpiSkeleton } from "@/components/admin";

export default function ForumsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-40 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-9 w-32 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-4 space-y-3">
          <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
              <div className="space-y-1">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="h-3 w-48 animate-pulse rounded bg-muted" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
              <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
