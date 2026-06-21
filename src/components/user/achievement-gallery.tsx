import { Award, CheckCircle2, Lock, Star, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeDisplay {
  id: string;
  name: string;
  icon?: string | null;
  description?: string | null;
  color?: string | null;
  category?: string | null;
  earnedAt?: Date | string | null;
}

interface AchievementGalleryProps {
  badges: BadgeDisplay[];
  earnedBadgeIds?: Set<string>;
  className?: string;
  title?: string;
  emptyMessage?: string;
}

export function AchievementGallery({
  badges,
  earnedBadgeIds,
  className,
  title = "Badges",
  emptyMessage = "No badges yet",
}: AchievementGalleryProps) {
  const earnedSet =
    earnedBadgeIds ??
    new Set(badges.filter((b) => b.earnedAt).map((b) => b.id));

  if (badges.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {title && (
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      )}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {badges.map((badge) => {
          const isEarned = earnedSet.has(badge.id);
          return (
            <div
              key={badge.id}
              className={cn(
                "group relative flex flex-col items-center rounded-xl border p-3 text-center transition-all",
                isEarned
                  ? "bg-card hover:border-primary/30 hover:shadow-md"
                  : "bg-muted/30 opacity-50",
              )}
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl text-2xl",
                  isEarned
                    ? badge.color
                      ? `${badge.color}/10`
                      : "bg-primary/10"
                    : "bg-muted",
                )}
              >
                {isEarned ? (
                  badge.icon ? (
                    <span>{badge.icon}</span>
                  ) : (
                    <Award className="h-6 w-6 text-primary/60" />
                  )
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground/40" />
                )}
              </div>
              <p
                className={cn(
                  "mt-2 text-xs font-medium leading-tight",
                  isEarned ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {badge.name}
              </p>
              {isEarned && badge.earnedAt && (
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {new Date(badge.earnedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface TrophyDisplay {
  id: string;
  title: string;
  icon?: string | null;
  description?: string | null;
  reputationReward?: number;
  earnedAt?: Date | string | null;
}

interface TrophyGalleryProps {
  trophies: TrophyDisplay[];
  earnedTrophyIds?: Set<string>;
  className?: string;
  title?: string;
  emptyMessage?: string;
}

export function TrophyGallery({
  trophies,
  earnedTrophyIds,
  className,
  title = "Trophies",
  emptyMessage = "No trophies yet",
}: TrophyGalleryProps) {
  const earnedSet =
    earnedTrophyIds ??
    new Set(trophies.filter((t) => t.earnedAt).map((t) => t.id));

  if (trophies.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {title && (
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {trophies.map((trophy) => {
          const isEarned = earnedSet.has(trophy.id);
          return (
            <div
              key={trophy.id}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-4 transition-all",
                isEarned
                  ? "bg-card hover:border-primary/20"
                  : "bg-muted/30 opacity-60",
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl",
                  isEarned ? "bg-primary/10" : "bg-muted",
                )}
              >
                {isEarned ? (
                  trophy.icon ? (
                    <span>{trophy.icon}</span>
                  ) : (
                    <Trophy className="h-5 w-5 text-amber-500" />
                  )
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground/40" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{trophy.title}</span>
                  {isEarned && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  )}
                </div>
                {trophy.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                    {trophy.description}
                  </p>
                )}
                {trophy.reputationReward && isEarned ? (
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                    +{trophy.reputationReward} rep
                  </p>
                ) : null}
                {isEarned && trophy.earnedAt && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Earned {new Date(trophy.earnedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
