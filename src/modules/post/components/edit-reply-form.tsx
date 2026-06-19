"use client";

import { useActionState } from "react";
import { updatePost } from "@/modules/post/actions";
import type { PostWithAuthor } from "@/modules/post/types";

interface EditReplyFormProps {
  post: PostWithAuthor;
  onCancel: () => void;
}

export function EditReplyForm({ post, onCancel }: EditReplyFormProps) {
  const [state, action, pending] = useActionState(updatePost, undefined);

  if (state?.success) {
    onCancel();
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b bg-muted/20 px-4 py-2">
        <h3 className="text-sm font-semibold">Edit Post #{post.postNumber}</h3>
      </div>

      <form action={action} className="p-4">
        <input type="hidden" name="id" value={post.id} />

        <div className="space-y-4">
          <div>
            <label
              htmlFor={`edit-content-${post.id}`}
              className="mb-1 block text-sm font-medium"
            >
              Content
            </label>
            <textarea
              id={`edit-content-${post.id}`}
              name="content"
              required
              rows={6}
              minLength={2}
              maxLength={50000}
              defaultValue={post.content}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor={`edit-reason-${post.id}`}
              className="mb-1 block text-sm font-medium"
            >
              Reason for editing (optional)
            </label>
            <input
              id={`edit-reason-${post.id}`}
              name="reason"
              type="text"
              maxLength={500}
              placeholder="e.g., Fixed typo, added more details"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {state?.error && (
          <p className="mt-2 text-sm text-red-500">{state.error}</p>
        )}

        <div className="mt-4 flex items-center gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {pending ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
