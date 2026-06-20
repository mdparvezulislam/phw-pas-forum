import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 w-28 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="mt-5 grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 rounded-2xl sm:h-52" />
      <div className="flex items-end gap-4 px-4 -mt-20">
        <Skeleton className="h-28 w-28 rounded-2xl border-4 border-card" />
        <div className="flex-1 space-y-2 pb-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function NotificationSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border bg-card p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex h-[600px] rounded-xl border bg-card">
      <div className="w-80 border-r p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-3/4 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function AchievementSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center rounded-xl border bg-card p-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <Skeleton className="mt-2 h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
