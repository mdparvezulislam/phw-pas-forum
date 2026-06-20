import Link from "next/link";
import {
  Pin,
  Lock,
  Star,
  Eye,
  MessageSquare,
  Clock,
  ChevronRight,
  BookmarkPlus,
  Bell,
  Share2,
  Flag,
} from "lucide-react";
import { formatDateRelative } from "@/lib/utils";

interface ThreadHeaderProps {
  thread: {
    title: string;
    slug: string;
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
      username: string | null;
      displayName: string | null;
    };
    tags?: { tag: string }[];
  };
  categorySlug: string;
  categoryTitle: string;
  forumSlug: string;
  forumTitle: string;
}

export function ThreadHeader({
  thread,
  categorySlug,
  categoryTitle,
  forumSlug,
  forumTitle,
}: ThreadHeaderProps) {
  const authorName = thread.author.displayName ?? thread.author.username ?? "Unknown";

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="p-5 sm:p-6">
        {/* Breadcrumbs */}
        <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/forums" className="hover:text-foreground">Forums</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/forums/${categorySlug}`} className="hover:text-foreground">{categoryTitle}</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/forums/${categorySlug}/${forumSlug}`} className="hover:text-foreground">{forumTitle}</Link>
        </div>

        {/* Title */}
        <div className="flex flex-wrap items-center gap-2">
          {thread.isPinned && <Pin className="h-4 w-4 shrink-0 text-primary" />}
          {thread.isLocked && <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />}
          {thread.isFeatured && <Star className="h-4 w-4 shrink-0 text-amber-500" />}
          {thread.isSolved && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              ✓ Solved
            </span>
          )}
          <h1 className="text-xl font-bold sm:text-2xl">{thread.title}</h1>
        </div>

        {/* Tags */}
        {thread.tags && thread.tags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {thread.tags.map((t) => (
              <span
                key={t.tag}
                className="inline-flex items-center rounded-full bg-primary/5 px-2 py-0.5 text-[11px] font-medium text-primary"
              >
                {t.tag}
              </span>
            ))}
          </div>
        )}

        {/* Meta */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            Started by <span className="font-medium text-foreground">{authorName}</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDateRelative(thread.publishedAt ?? thread.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {thread.viewCount.toLocaleString()} views
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {thread.replyCount.toLocaleString()} replies
          </span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-1 border-t px-4 py-2">
        <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <BookmarkPlus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Bookmark</span>
        </button>
        <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <Bell className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Watch</span>
        </button>
        <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <Share2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Share</span>
        </button>
        <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <Flag className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Report</span>
        </button>
      </div>
    </div>
  );
}
