import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/services/leaderboard";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  category: string;
}

export function LeaderboardTable({ entries, category }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">No data available yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="divide-y">
        {entries.map((entry) => (
          <div
            key={entry.userId}
            className={cn(
              "flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/30",
              entry.rank <= 3 && "bg-amber-500/5",
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                entry.rank === 1 &&
                  "bg-amber-500/20 text-amber-600 dark:text-amber-400",
                entry.rank === 2 &&
                  "bg-slate-400/20 text-slate-600 dark:text-slate-400",
                entry.rank === 3 &&
                  "bg-orange-500/20 text-orange-600 dark:text-orange-400",
                entry.rank > 3 && "bg-muted text-muted-foreground",
              )}
            >
              {entry.rank}
            </div>

            <Link
              href={`/profile/${entry.username ?? entry.userId}`}
              className="flex items-center gap-3 min-w-0 flex-1"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm text-primary">
                {entry.image ? (
                  <Image
                    src={entry.image}
                    alt=""
                    width={32}
                    height={32}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  (entry.displayName ?? entry.username ?? "U")
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">
                  {entry.displayName ?? entry.username}
                </div>
                {entry.username && (
                  <div className="text-xs text-muted-foreground">
                    @{entry.username}
                  </div>
                )}
              </div>
            </Link>

            <div className="text-right shrink-0">
              <div className="text-sm font-semibold">
                {entry.value.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">{category}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
