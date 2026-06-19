import { formatDateRelative } from "@/lib/utils";
import type { ThreadWithRelations } from "@/modules/thread/types";
import { ThreadActions } from "./thread-actions";
import { ThreadStatusBadge } from "./thread-status-badge";

interface ThreadHeaderProps {
  thread: ThreadWithRelations;
  categorySlug: string;
  forumSlug: string;
  isOwner?: boolean;
}

export function ThreadHeader({
  thread,
  categorySlug,
  forumSlug,
  isOwner,
}: ThreadHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {thread.title}
            </h1>
            <ThreadStatusBadge status={thread.status} />
            {thread.isPinned && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Pinned
              </span>
            )}
            {thread.isFeatured && (
              <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                Featured
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>
              by{" "}
              <span className="font-medium text-foreground">
                {thread.author.displayName ?? thread.author.username}
              </span>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {formatDateRelative(thread.publishedAt ?? thread.createdAt)}
            </span>
            <span aria-hidden="true">·</span>
            <span>{thread.replyCount} replies</span>
            <span aria-hidden="true">·</span>
            <span>{thread.viewCount} views</span>
          </div>
          {thread.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {thread.tags.map((t) => (
                <span
                  key={t.tag}
                  className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {t.tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
