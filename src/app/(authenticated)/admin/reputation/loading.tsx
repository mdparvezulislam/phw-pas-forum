import { KpiSkeleton } from "@/components/admin";

export default function ReputationLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-4 space-y-3">
          <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-6 w-8 animate-pulse rounded bg-muted" />
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                <div className="h-2.5 w-20 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
