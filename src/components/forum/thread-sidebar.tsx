import Link from "next/link";
import { Clock, Eye, MessageSquare, Users, TrendingUp } from "lucide-react";
import { formatDateRelative } from "@/lib/utils";

interface ThreadSidebarProps {
  thread: {
    createdAt: Date;
    viewCount: number;
    replyCount: number;
    watchCount?: number;
    bookmarkCount?: number;
  };
  participants?: { username: string | null; displayName: string | null }[];
  relatedThreads?: { title: string; slug: string; replyCount: number }[];
}

export function ThreadSidebar({ thread, participants, relatedThreads }: ThreadSidebarProps) {
  return (
    <div className="space-y-4">
      {/* Thread Info */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="border-b px-4 py-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Thread Info</h3>
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Created
            </span>
            <span className="font-medium">{formatDateRelative(thread.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Eye className="h-3.5 w-3.5" />
              Views
            </span>
            <span className="font-medium">{thread.viewCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              Replies
            </span>
            <span className="font-medium">{thread.replyCount.toLocaleString()}</span>
          </div>
          {thread.watchCount != null && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                Watchers
              </span>
              <span className="font-medium">{thread.watchCount.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Participants */}
      {participants && participants.length > 0 && (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="border-b px-4 py-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Participants ({participants.length})
            </h3>
          </div>
          <div className="space-y-2 p-4">
            {participants.slice(0, 10).map((p, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-[10px] font-bold">
                  {(p.displayName ?? p.username ?? "?")[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium truncate">
                  {p.displayName ?? p.username}
                </span>
              </div>
            ))}
            {participants.length > 10 && (
              <p className="text-xs text-muted-foreground">
                +{participants.length - 10} more
              </p>
            )}
          </div>
        </div>
      )}

      {/* Related Threads */}
      {relatedThreads && relatedThreads.length > 0 && (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="border-b px-4 py-3">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Related
            </h3>
          </div>
          <div className="divide-y">
            {relatedThreads.map((t) => (
              <Link
                key={t.slug}
                href={`/forums/${t.slug}`}
                className="block px-4 py-3 transition-colors hover:bg-accent/50"
              >
                <p className="text-sm font-medium line-clamp-2">{t.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t.replyCount} replies
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
