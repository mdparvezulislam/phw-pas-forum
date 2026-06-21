import { KpiSkeleton } from "@/components/admin";

export default function AnnouncementsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-52 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-9 w-40 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                  <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                  <div className="h-5 w-12 animate-pulse rounded-full bg-muted" />
                </div>
                <div className="h-3 w-64 animate-pulse rounded bg-muted" />
                <div className="h-2.5 w-48 animate-pulse rounded bg-muted" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-16 animate-pulse rounded-lg bg-muted" />
                <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
