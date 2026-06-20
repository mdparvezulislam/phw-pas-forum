import Link from "next/link";
import { MessageSquare, Trophy, Award, Star } from "lucide-react";
import { formatDateRelative } from "@/lib/utils";

interface ActivityItem {
  type: "thread" | "reply" | "achievement" | "milestone";
  title: string;
  author: string;
  timestamp: Date;
  slug?: string;
  categorySlug?: string;
  forumSlug?: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
}

const typeConfig = {
  thread: { icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
  reply: { icon: MessageSquare, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  achievement: { icon: Award, color: "text-amber-500", bg: "bg-amber-500/10" },
  milestone: { icon: Trophy, color: "text-purple-500", bg: "bg-purple-500/10" },
};

export function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
        No recent activity
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="border-b px-4 py-3">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <Star className="h-4 w-4 text-amber-500" />
          Recent Activity
        </h3>
      </div>
      <div className="divide-y">
        {items.map((item, i) => {
          const config = typeConfig[item.type];
          const Icon = config.icon;
          return (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${config.bg}`}>
                <Icon className={`h-3.5 w-3.5 ${config.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                {item.slug && item.categorySlug && item.forumSlug ? (
                  <Link
                    href={`/forums/${item.categorySlug}/${item.forumSlug}/${item.slug}`}
                    className="text-sm font-medium hover:text-primary line-clamp-1"
                  >
                    {item.title}
                  </Link>
                ) : (
                  <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  by {item.author} · {formatDateRelative(item.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
