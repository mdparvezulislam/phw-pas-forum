import { cn } from "@/lib/utils";

function Skel({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

export function ChartSkeleton({ height = 240 }: { height?: number }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <Skel className="mb-4 h-4 w-32" />
      <div className="animate-pulse rounded-md bg-muted" style={{ height }} />
    </div>
  );
}

export function KpiSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <Skel className="h-4 w-24" />
        <Skel className="h-8 w-8 rounded-lg" />
      </div>
      <Skel className="mt-3 h-7 w-20" />
      <Skel className="mt-2 h-3 w-28" />
    </div>
  );
}

export function AdminTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Skel className="h-9 flex-1" />
        <Skel className="h-9 w-24" />
      </div>
      <div className="overflow-hidden rounded-xl border">
        <div className="border-b bg-muted/50 px-4 py-3">
          <Skel className="h-4 w-40" />
        </div>
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skel className="h-8 w-8 rounded-full" />
              <Skel className="h-4 flex-1" />
              <Skel className="h-4 w-20" />
              <Skel className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skel className="h-7 w-56" />
        <Skel className="h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <Skel className="h-7 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>
      <ChartSkeleton height={300} />
    </div>
  );
}

export function ModerationSkeleton() {
  return (
    <div className="space-y-6">
      <Skel className="h-7 w-44" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4">
            <Skel className="h-4 w-1/3" />
            <Skel className="mt-2 h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
