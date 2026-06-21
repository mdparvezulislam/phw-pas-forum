import {
  AtSign,
  Award,
  FileText,
  Heart,
  MessageSquare,
  Quote,
  ShoppingBag,
  Star,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { cn, formatDateRelative } from "@/lib/utils";

interface ActivityItem {
  type: "post" | "thread" | "badge" | "trophy" | "review" | "reputation";
  id: string;
  title?: string;
  description?: string;
  createdAt: Date | string;
  link?: string;
}

interface ActivityTimelineProps {
  items: ActivityItem[];
  className?: string;
}

const activityConfig: Record<
  string,
  { icon: typeof MessageSquare; color: string; bg: string }
> = {
  post: {
    icon: MessageSquare,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
  },
  thread: {
    icon: FileText,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  badge: {
    icon: Award,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
  trophy: {
    icon: Star,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10",
  },
  review: {
    icon: Heart,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  reputation: {
    icon: TrendingUp,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10",
  },
};

export function ActivityTimeline({ items, className }: ActivityTimelineProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
        No recent activity
      </div>
    );
  }

  return (
    <div className={cn("space-y-0", className)}>
      {items.map((item, i) => {
        const config = activityConfig[item.type] ?? activityConfig.post;
        const Icon = config.icon;
        const isLast = i === items.length - 1;

        return (
          <div key={`${item.type}-${item.id}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  config.bg,
                )}
              >
                <Icon className={cn("h-4 w-4", config.color)} />
              </div>
              {!isLast && <div className="w-px flex-1 bg-border" />}
            </div>
            <div className={cn("pb-6", isLast && "pb-0")}>
              {item.link ? (
                <Link
                  href={item.link}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  {item.title ?? "Activity"}
                </Link>
              ) : (
                <p className="text-sm font-medium">
                  {item.title ?? "Activity"}
                </p>
              )}
              {item.description && (
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              )}
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatDateRelative(item.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
