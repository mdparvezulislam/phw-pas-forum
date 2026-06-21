import { KpiSkeleton } from "@/components/admin";

export default function SearchLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-56 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-9 w-44 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="h-3 w-64 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
