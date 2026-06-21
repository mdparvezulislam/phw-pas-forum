import type { Trophy } from "@/db/schema/trophies";
import { formatDate } from "@/lib/utils";

interface TrophyGridProps {
  trophies: Array<
    Trophy & {
      earnedAt?: Date;
    }
  >;
  compact?: boolean;
}

export function TrophyGrid({ trophies, compact }: TrophyGridProps) {
  if (trophies.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        No trophies earned yet
      </div>
    );
  }

  return (
    <div
      className={
        compact
          ? "flex flex-wrap gap-2"
          : "grid grid-cols-1 gap-3 sm:grid-cols-2"
      }
    >
      {trophies.map((trophy) => (
        <div
          key={trophy.id}
          className={
            compact
              ? "inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2"
              : "rounded-lg border bg-card p-4"
          }
        >
          <span
            className={
              compact
                ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-base"
                : "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-2xl"
            }
          >
            {trophy.icon}
          </span>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{trophy.title}</div>
            {!compact && trophy.description && (
              <div className="mt-0.5 text-xs text-muted-foreground">
                {trophy.description}
              </div>
            )}
            {trophy.earnedAt && (
              <div className="text-[10px] text-muted-foreground/60">
                Earned {formatDate(trophy.earnedAt)}
              </div>
            )}
            {trophy.reputationReward > 0 && !compact && (
              <div className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                +{trophy.reputationReward} rep
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
