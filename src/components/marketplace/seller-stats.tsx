import {
  CheckCircle2,
  Clock,
  Repeat,
  ShoppingBag,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SellerStatsProps {
  stats: {
    totalSales?: number;
    averageRating?: number;
    totalReviews?: number;
    responseRate?: number;
    responseTime?: number;
    completionRate?: number;
    trustScore?: number;
    repeatBuyers?: number;
  };
  layout?: "grid" | "row";
  className?: string;
}

export function SellerStats({
  stats,
  layout = "grid",
  className,
}: SellerStatsProps) {
  const items = [
    {
      icon: ShoppingBag,
      label: "Completed Orders",
      value: (stats.totalSales ?? 0).toLocaleString(),
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      icon: Star,
      label: "Avg. Rating",
      value:
        (stats.averageRating ?? 0) > 0
          ? (stats.averageRating ?? 0).toFixed(1)
          : "N/A",
      sub: stats.totalReviews
        ? `(${stats.totalReviews.toLocaleString()} reviews)`
        : undefined,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      icon: TrendingUp,
      label: "Trust Score",
      value: (stats.trustScore ?? 0).toLocaleString(),
      sub: "/ 1000",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      icon: CheckCircle2,
      label: "Completion Rate",
      value:
        (stats.completionRate ?? 0) > 0 ? `${stats.completionRate}%` : "N/A",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      icon: Clock,
      label: "Response Time",
      value: (stats.responseTime ?? 0) > 0 ? `${stats.responseTime}h` : "N/A",
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-500/10",
    },
    {
      icon: Repeat,
      label: "Repeat Buyers",
      value: (stats.repeatBuyers ?? 0).toLocaleString(),
      color: "text-pink-600 dark:text-pink-400",
      bg: "bg-pink-500/10",
    },
  ];

  if (layout === "row") {
    return (
      <div className={cn("flex flex-wrap gap-6", className)}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  item.bg,
                )}
              >
                <Icon className={cn("h-5 w-5", item.color)} />
              </div>
              <div>
                <p className="text-lg font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3", className)}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="rounded-xl border bg-card p-4 transition-colors hover:bg-accent/30"
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  item.bg,
                )}
              >
                <Icon className={cn("h-4 w-4", item.color)} />
              </div>
              <span className="text-xs text-muted-foreground">
                {item.label}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold">{item.value}</span>
              {item.sub && (
                <span className="text-xs text-muted-foreground">
                  {item.sub}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
