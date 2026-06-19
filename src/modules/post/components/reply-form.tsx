"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { createPost } from "@/modules/post/actions";

interface ReplyFormProps {
  threadId: string;
  isLocked: boolean;
  nextPostNumber: number;
}

export function ReplyForm({
  threadId,
  isLocked,
  nextPostNumber,
}: ReplyFormProps) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createPost, undefined);

  if (state?.success && state.postId) {
    router.refresh();
  }

  if (isLocked) {
    return (
      <div className="rounded-lg border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
        This thread is locked. You cannot reply.
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b bg-muted/20 px-4 py-2">
        <h3 className="text-sm font-semibold">Reply to Thread</h3>
        <p className="text-xs text-muted-foreground">Post #{nextPostNumber}</p>
      </div>

      <form action={action} className="p-4">
        <input type="hidden" name="threadId" value={threadId} />

        <div>
          <label
            htmlFor="reply-content"
            className="mb-1 block text-sm font-medium"
          >
            Content
          </label>
          <textarea
            id="reply-content"
            name="content"
            required
            rows={6}
            minLength={2}
            maxLength={50000}
            placeholder="Write your reply..."
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Minimum 2 characters, maximum 50,000 characters.
          </p>
        </div>

        {state?.error && (
          <p className="mt-2 text-sm text-red-500">{state.error}</p>
        )}

        <div className="mt-4 flex items-center justify-end">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {pending ? "Posting..." : "Post Reply"}
          </button>
        </div>
      </form>
    </div>
  );
}
