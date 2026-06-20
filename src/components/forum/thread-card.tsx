import Link from "next/link";
import { MessageSquare, Eye, Pin, Lock, Star, CheckCircle2 } from "lucide-react";
import { formatDateRelative } from "@/lib/utils";

interface ThreadCardProps {
  thread: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    isPinned?: boolean;
    isLocked?: boolean;
    isFeatured?: boolean;
    isSolved?: boolean;
    status?: string;
    viewCount: number;
    replyCount: number;
    reactionCount?: number;
    publishedAt?: Date | null;
    createdAt: Date;
    author: {
      id: string;
      username: string | null;
      displayName: string | null;
      image?: string | null;
      role?: { name: string } | null;
    };
    tags?: { tag: string }[];
    lastReply?: {
      author: { username: string | null; displayName: string | null };
      createdAt: Date;
    } | null;
  };
  categorySlug: string;
  forumSlug: string;
}

export function ThreadCard({ thread, categorySlug, forumSlug }: ThreadCardProps) {
  const authorName = thread.author.displayName ?? thread.author.username ?? "Unknown";
  const isPremium = thread.author.role?.name === "VIP" || thread.author.role?.name === "VIP+" || thread.author.role?.name === "ELITE";

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card transition-all hover:border-primary/20 hover:shadow-md hover:shadow-primary/5">
      <div className="flex gap-4 p-4 sm:p-5">
        {/* Author Avatar */}
        <div className="hidden shrink-0 sm:block">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-sm font-semibold">
            {authorName[0]?.toUpperCase()}
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Title Row */}
          <div className="flex flex-wrap items-center gap-2">
            {thread.isPinned && (
              <Pin className="h-3.5 w-3.5 shrink-0 text-primary" />
            )}
            {thread.isLocked && (
              <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}
            {thread.isFeatured && (
              <Star className="h-3.5 w-3.5 shrink-0 text-amber-500" />
            )}
            {thread.isSolved && (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
            )}
            <Link
              href={`/forums/${categorySlug}/${forumSlug}/${thread.slug}`}
              className="text-sm font-semibold leading-snug group-hover:text-primary sm:text-base"
            >
              {thread.title}
            </Link>
          </div>

          {/* Excerpt */}
          {thread.excerpt && (
            <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
              {thread.excerpt}
            </p>
          )}

          {/* Tags */}
          {thread.tags && thread.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {thread.tags.slice(0, 4).map((t) => (
                <span
                  key={t.tag}
                  className="inline-flex items-center rounded-full bg-primary/5 px-2 py-0.5 text-[11px] font-medium text-primary"
                >
                  {t.tag}
                </span>
              ))}
              {thread.tags.length > 4 && (
                <span className="text-xs text-muted-foreground">
                  +{thread.tags.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Meta Row */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="font-medium text-foreground">{authorName}</span>
              {isPremium && (
                <span className="rounded-full bg-premium/10 px-1.5 py-0.5 text-[9px] font-bold text-premium">
                  VIP
                </span>
              )}
            </span>
            <span>{formatDateRelative(thread.publishedAt ?? thread.createdAt)}</span>
            {thread.lastReply && (
              <>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  Last reply by <span className="font-medium text-foreground">{thread.lastReply.author.displayName ?? thread.lastReply.author.username}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Stats Column (Desktop) */}
        <div className="hidden shrink-0 flex-col items-end gap-1 text-right text-xs text-muted-foreground sm:flex">
          <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1">
            <MessageSquare className="h-3 w-3" />
            <span className="font-medium">{thread.replyCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1">
            <Eye className="h-3 w-3" />
            <span>{thread.viewCount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Mobile Stats Bar */}
      <div className="flex items-center gap-4 border-t px-4 py-2.5 text-xs text-muted-foreground sm:hidden">
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          {thread.replyCount}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {thread.viewCount}
        </span>
        <span className="ml-auto">{formatDateRelative(thread.publishedAt ?? thread.createdAt)}</span>
      </div>
    </div>
  );
}
