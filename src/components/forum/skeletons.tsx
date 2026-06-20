import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("skeleton rounded-md bg-muted", className)} />
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center gap-3 border-b px-5 py-3.5">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <div className="space-y-1 p-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <ForumCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function ForumCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-lg p-4">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-64" />
      </div>
      <div className="hidden space-y-1 text-right md:block">
        <Skeleton className="ml-auto h-3 w-16" />
        <Skeleton className="ml-auto h-3 w-12" />
      </div>
    </div>
  );
}

export function ThreadCardSkeleton() {
  return (
    <div className="flex items-start gap-4 rounded-xl border bg-card p-5">
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3.5 w-full" />
        <div className="flex gap-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="hidden h-12 w-16 md:block" />
    </div>
  );
}

export function PostSkeleton() {
  return (
    <div className="flex gap-4 rounded-xl border bg-card p-5">
      <div className="hidden w-48 shrink-0 space-y-3 md:block">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="space-y-4 rounded-xl border bg-card p-5">
      <Skeleton className="h-4 w-24" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2.5 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
