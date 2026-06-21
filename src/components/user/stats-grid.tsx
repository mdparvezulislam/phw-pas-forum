import {
  Award,
  Bookmark,
  Eye,
  FileText,
  Heart,
  type LucideIcon,
  MessageSquare,
  ShoppingBag,
  Star,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bg: string;
  link?: string;
}

interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export function StatsGrid({ stats, columns = 4, className }: StatsGridProps) {
  return (
    <div
      className={cn(
        "grid gap-3",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-2 sm:grid-cols-3",
        columns === 4 && "grid-cols-2 sm:grid-cols-4",
        columns === 5 && "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
        className,
      )}
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        const Wrapper = stat.link ? "a" : "div";
        return (
          <Wrapper
            key={stat.label}
            {...(stat.link ? { href: stat.link } : {})}
            className={cn(
              "rounded-xl border bg-card p-4 transition-colors",
              stat.link && "hover:bg-accent/50 cursor-pointer",
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  stat.bg,
                )}
              >
                <Icon className={cn("h-4 w-4", stat.color)} />
              </div>
              <span className="text-xs text-muted-foreground">
                {stat.label}
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
          </Wrapper>
        );
      })}
    </div>
  );
}

export const forumStats = [
  {
    label: "Threads",
    icon: FileText,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Posts",
    icon: MessageSquare,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    label: "Badges",
    icon: Award,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    label: "Trophies",
    icon: Star,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    label: "Watching",
    icon: Eye,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Bookmarks",
    icon: Bookmark,
    color: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-500/10",
  },
];
