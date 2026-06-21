import type { ReactNode } from "react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface QueueItem {
  id: string;
  title: string;
  excerpt?: string | null;
  /** Small labelled tags (e.g. report reason, content type). */
  tags?: Array<{ label: string; variant?: BadgeProps["variant"] }>;
  meta?: string;
  href?: string;
}

/**
 * Presentational moderation queue. Action buttons are provided per-item by the
 * page via `renderActions`, keeping all mutation logic in existing actions.
 */
export function ModerationQueue({
  items,
  renderActions,
  empty,
  className,
}: {
  items: QueueItem[];
  renderActions?: (item: QueueItem) => ReactNode;
  empty?: ReactNode;
  className?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
        {empty ?? "Queue is clear — nothing to review."}
      </div>
    );
  }

  return (
    <ul className={cn("space-y-2", className)}>
      {items.map((item) => {
        const Title = item.href ? "a" : "div";
        return (
          <li
            key={item.id}
            className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:border-border-strong sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Title
                  {...(item.href ? { href: item.href } : {})}
                  className={cn(
                    "truncate text-sm font-semibold",
                    item.href && "hover:text-primary",
                  )}
                >
                  {item.title}
                </Title>
                {item.tags?.map((tag) => (
                  <Badge key={tag.label} variant={tag.variant ?? "secondary"} size="sm">
                    {tag.label}
                  </Badge>
                ))}
              </div>
              {item.excerpt && (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {item.excerpt}
                </p>
              )}
              {item.meta && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {item.meta}
                </p>
              )}
            </div>
            {renderActions && (
              <div className="flex shrink-0 items-center gap-2">
                {renderActions(item)}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
