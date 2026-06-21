import type { Badge } from "@/db/schema/badges";

const BADGE_COLORS: Record<string, string> = {
  slate: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  red: "bg-red-500/10 text-red-600 dark:text-red-400",
  purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  pink: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
};

interface BadgeGridProps {
  badges: Array<
    Badge & {
      earnedAt?: Date;
    }
  >;
  compact?: boolean;
}

export function BadgeGrid({ badges, compact }: BadgeGridProps) {
  if (badges.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        No badges earned yet
      </div>
    );
  }

  return (
    <div
      className={
        compact
          ? "flex flex-wrap gap-2"
          : "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
      }
    >
      {badges.map((badge) => {
        const colorClass = BADGE_COLORS[badge.color] ?? BADGE_COLORS.slate;
        return (
          <div
            key={badge.id}
            className={
              compact ? "group relative" : "rounded-lg border bg-card p-3"
            }
            title={badge.description ?? badge.name}
          >
            {compact ? (
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm ${colorClass}`}
              >
                {badge.icon}
              </span>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${colorClass}`}
                >
                  {badge.icon}
                </span>
                <div>
                  <div className="text-sm font-medium">{badge.name}</div>
                  {badge.description && (
                    <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {badge.description}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
