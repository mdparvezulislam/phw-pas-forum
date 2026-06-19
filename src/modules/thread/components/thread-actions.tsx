"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { watchThread, bookmarkThread } from "@/modules/thread/actions";
import type { ThreadWithRelations } from "@/modules/thread/types";

interface ThreadActionsProps {
  thread: ThreadWithRelations;
  isOwner?: boolean;
  categorySlug: string;
  forumSlug: string;
}

export function ThreadActions({ thread, isOwner, categorySlug, forumSlug }: ThreadActionsProps) {
  const router = useRouter();

  const [, watchAction, watchPending] = useActionState(watchThread, undefined);
  const [, bookmarkAction, bookmarkPending] = useActionState(bookmarkThread, undefined);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={watchAction}>
        <input type="hidden" name="threadId" value={thread.id} />
        <button
          type="submit"
          disabled={watchPending}
          className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-sm font-medium hover:bg-accent disabled:opacity-50"
        >
          {thread.isWatched ? "🔔 Watching" : "🔕 Watch"}
        </button>
      </form>

      <form action={bookmarkAction}>
        <input type="hidden" name="threadId" value={thread.id} />
        <button
          type="submit"
          disabled={bookmarkPending}
          className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-sm font-medium hover:bg-accent disabled:opacity-50"
        >
          {thread.isBookmarked ? "🔖 Bookmarked" : "🏷️ Bookmark"}
        </button>
      </form>
    </div>
  );
}
