"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { updateThread } from "@/modules/thread/actions";
import type { ThreadWithRelations } from "@/modules/thread/types";

interface EditThreadFormProps {
  thread: ThreadWithRelations;
}

export function EditThreadForm({ thread }: EditThreadFormProps) {
  const router = useRouter();
  const [state, action, pending] = useActionState(updateThread, undefined);

  if (state?.success) {
    router.push(`/forums`);
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={thread.id} />
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={thread.title}
          minLength={3}
          maxLength={200}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="content" className="mb-1 block text-sm font-medium">
          Content
        </label>
        <textarea
          id="content"
          name="content"
          rows={12}
          defaultValue={thread.content}
          minLength={10}
          maxLength={100000}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="tags" className="mb-1 block text-sm font-medium">
          Tags (comma-separated)
        </label>
        <input
          id="tags"
          name="tags"
          type="text"
          defaultValue={thread.tags.map((t) => t.tag).join(", ")}
          placeholder="seo, marketing, guide"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
