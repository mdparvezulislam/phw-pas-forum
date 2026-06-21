"use client";

import { useActionState } from "react";
import { Pin, Lock, Star } from "lucide-react";
import type { ThreadStatus } from "@/db/schema/threads";
import { featureThread, lockThread, pinThread } from "@/modules/thread/actions";
import { ThreadStatusBadge } from "@/modules/thread/components";
import { Badge } from "@/components/ui/badge";
import { DataTable, type AdminColumn } from "@/components/admin";

export interface AdminThreadItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  isPinned: boolean;
  isLocked: boolean;
  isFeatured: boolean;
  replyCount: number;
  viewCount: number;
  authorName: string;
  forumTitle: string;
}

function ThreadActions({ thread }: { thread: AdminThreadItem }) {
  const [, pinAction, pinPending] = useActionState(pinThread, undefined);
  const [, lockAction, lockPending] = useActionState(lockThread, undefined);
  const [, featureAction, featurePending] = useActionState(
    featureThread,
    undefined,
  );

  const btn =
    "inline-flex items-center gap-1 rounded-lg border bg-background px-2 py-1 text-xs font-medium hover:bg-accent disabled:opacity-50";

  return (
    <div
      className="flex flex-wrap justify-end gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      <form action={pinAction}>
        <input type="hidden" name="id" value={thread.id} />
        <button type="submit" disabled={pinPending} className={btn}>
          <Pin className="h-3 w-3" />
          {thread.isPinned ? "Unpin" : "Pin"}
        </button>
      </form>
      <form action={lockAction}>
        <input type="hidden" name="id" value={thread.id} />
        <button type="submit" disabled={lockPending} className={btn}>
          <Lock className="h-3 w-3" />
          {thread.isLocked ? "Unlock" : "Lock"}
        </button>
      </form>
      <form action={featureAction}>
        <input type="hidden" name="id" value={thread.id} />
        <button type="submit" disabled={featurePending} className={btn}>
          <Star className="h-3 w-3" />
          {thread.isFeatured ? "Unfeature" : "Feature"}
        </button>
      </form>
    </div>
  );
}

export function ThreadsTable({ threads }: { threads: AdminThreadItem[] }) {
  const columns: AdminColumn<AdminThreadItem>[] = [
    {
      key: "title",
      header: "Thread",
      sortable: true,
      sortValue: (t) => t.title,
      searchValue: (t) => `${t.title} ${t.authorName} ${t.forumTitle}`,
      cell: (t) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{t.title}</p>
          <div className="mt-0.5 flex flex-wrap gap-1">
            {t.isPinned && (
              <Badge variant="info" size="sm">
                Pinned
              </Badge>
            )}
            {t.isLocked && (
              <Badge variant="warning" size="sm">
                Locked
              </Badge>
            )}
            {t.isFeatured && (
              <Badge variant="premium" size="sm">
                Featured
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "author",
      header: "Author",
      sortable: true,
      sortValue: (t) => t.authorName,
      cell: (t) => <span className="text-sm">{t.authorName}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (t) => <ThreadStatusBadge status={t.status as ThreadStatus} />,
      exportValue: (t) => t.status,
    },
    {
      key: "replies",
      header: "Replies",
      align: "right",
      sortable: true,
      sortValue: (t) => t.replyCount,
      cell: (t) => (
        <span className="tabular-nums text-muted-foreground">
          {t.replyCount}
        </span>
      ),
    },
    {
      key: "views",
      header: "Views",
      align: "right",
      sortable: true,
      sortValue: (t) => t.viewCount,
      cell: (t) => (
        <span className="tabular-nums text-muted-foreground">
          {t.viewCount}
        </span>
      ),
    },
    {
      key: "forum",
      header: "Forum",
      sortable: true,
      sortValue: (t) => t.forumTitle,
      cell: (t) => (
        <span className="text-sm text-muted-foreground">{t.forumTitle}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (t) => <ThreadActions thread={t} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={threads}
      getRowId={(t) => t.id}
      searchPlaceholder="Search threads, authors, forums…"
      exportFileName="threads"
      pageSize={15}
      empty="No threads found."
    />
  );
}
