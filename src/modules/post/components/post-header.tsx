"use client";

import { useActionState } from "react";
import { formatDateRelative } from "@/lib/utils";
import { deletePost, hidePost, unhidePost } from "@/modules/post/actions";
import type { PostWithAuthor } from "@/modules/post/types";

interface PostHeaderProps {
  post: PostWithAuthor;
  isOwner: boolean;
  isModerator: boolean;
  baseUrl: string;
}

export function PostHeader({
  post,
  isOwner,
  isModerator,
  baseUrl,
}: PostHeaderProps) {
  const [, deleteAction, deletePending] = useActionState(deletePost, undefined);
  const [, hideAction, hidePending] = useActionState(hidePost, undefined);
  const [, unhideAction, unhidePending] = useActionState(unhidePost, undefined);

  return (
    <div className="flex items-center justify-between border-b bg-muted/20 px-4 py-2">
      <div className="flex items-center gap-2">
        <a
          href={`${baseUrl}#post-${post.postNumber}`}
          className="text-sm font-semibold text-primary hover:underline"
        >
          #{post.postNumber}
        </a>
        {post.status === "HIDDEN" && (
          <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            Hidden
          </span>
        )}
        {post.isEdited && (
          <span className="text-xs text-muted-foreground">(edited)</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {formatDateRelative(post.createdAt)}
        </span>

        <div className="flex items-center gap-1">
          {(isOwner || isModerator) && (
            <form action={deleteAction}>
              <input type="hidden" name="postId" value={post.id} />
              <button
                type="submit"
                disabled={deletePending}
                className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
              >
                Delete
              </button>
            </form>
          )}

          {isModerator &&
            (post.status === "HIDDEN" ? (
              <form action={unhideAction}>
                <input type="hidden" name="postId" value={post.id} />
                <button
                  type="submit"
                  disabled={unhidePending}
                  className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-accent disabled:opacity-50"
                >
                  Unhide
                </button>
              </form>
            ) : (
              <form action={hideAction}>
                <input type="hidden" name="postId" value={post.id} />
                <button
                  type="submit"
                  disabled={hidePending}
                  className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-accent disabled:opacity-50"
                >
                  Hide
                </button>
              </form>
            ))}
        </div>
      </div>
    </div>
  );
}
