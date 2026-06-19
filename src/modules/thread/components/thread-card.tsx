import Link from "next/link";
import { formatDateRelative } from "@/lib/utils";
import type { ThreadWithRelations } from "@/modules/thread/types";
import { ThreadStatusBadge } from "./thread-status-badge";

interface ThreadCardProps {
  thread: ThreadWithRelations;
  categorySlug: string;
  forumSlug: string;
}

export function ThreadCard({
  thread,
  categorySlug,
  forumSlug,
}: ThreadCardProps) {
  return (
    <div className="group rounded-lg border bg-card p-4 transition-colors hover:border-muted-foreground/25">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg text-primary">
          {thread.isPinned ? "📌" : thread.isLocked ? "🔒" : "📄"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/forums/${categorySlug}/${forumSlug}/${thread.slug}`}
              className="font-semibold hover:text-primary"
            >
              {thread.title}
            </Link>
            <ThreadStatusBadge status={thread.status} />
            {thread.isFeatured && (
              <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                Featured
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
            {thread.excerpt}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
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
            <div className="mt-2 flex flex-wrap gap-1">
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
        <div className="hidden shrink-0 text-right text-sm text-muted-foreground md:block">
          <div>{thread.replyCount} replies</div>
          <div>{thread.viewCount} views</div>
        </div>
      </div>
    </div>
  );
}
