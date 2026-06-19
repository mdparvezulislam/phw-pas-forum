"use client";

import { useActionState } from "react";
import { ThreadStatusBadge } from "@/modules/thread/components";
import { pinThread, lockThread, featureThread } from "@/modules/thread/actions";

interface AdminThreadRowProps {
  thread: {
    id: string;
    title: string;
    slug: string;
    status: string;
    isPinned: boolean;
    isLocked: boolean;
    isFeatured: boolean;
    replyCount: number;
    viewCount: number;
    author: { id: string; username: string | null; displayName: string | null };
    forum: {
      id: string;
      title: string;
      slug: string;
      category: { slug: string };
    };
  };
}

export function AdminThreadRow({ thread }: AdminThreadRowProps) {
  const [, pinAction, pinPending] = useActionState(pinThread, undefined);
  const [, lockAction, lockPending] = useActionState(lockThread, undefined);
  const [, featureAction, featurePending] = useActionState(featureThread, undefined);

  return (
    <tr className="hover:bg-muted/30">
      <td className="px-4 py-3">
        <div className="font-medium">{thread.title}</div>
        <div className="flex gap-2 text-xs text-muted-foreground">
          {thread.isPinned && <span className="text-primary">Pinned</span>}
          {thread.isLocked && <span className="text-amber-500">Locked</span>}
          {thread.isFeatured && <span className="text-amber-500">Featured</span>}
        </div>
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        {thread.author.displayName ?? thread.author.username}
      </td>
      <td className="px-4 py-3">
        <ThreadStatusBadge status={thread.status as any} />
      </td>
      <td className="px-4 py-3 text-center text-muted-foreground">
        {thread.replyCount}
      </td>
      <td className="px-4 py-3 text-center text-muted-foreground">
        {thread.viewCount}
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        {thread.forum.title}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          <form action={pinAction}>
            <input type="hidden" name="id" value={thread.id} />
            <button
              type="submit"
              disabled={pinPending}
              className="rounded border px-2 py-1 text-xs hover:bg-accent disabled:opacity-50"
            >
              {thread.isPinned ? "Unpin" : "Pin"}
            </button>
          </form>
          <form action={lockAction}>
            <input type="hidden" name="id" value={thread.id} />
            <button
              type="submit"
              disabled={lockPending}
              className="rounded border px-2 py-1 text-xs hover:bg-accent disabled:opacity-50"
            >
              {thread.isLocked ? "Unlock" : "Lock"}
            </button>
          </form>
          <form action={featureAction}>
            <input type="hidden" name="id" value={thread.id} />
            <button
              type="submit"
              disabled={featurePending}
              className="rounded border px-2 py-1 text-xs hover:bg-accent disabled:opacity-50"
            >
              {thread.isFeatured ? "Unfeature" : "Feature"}
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
