"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { createThread } from "@/modules/thread/actions";

interface CreateThreadFormProps {
  forumId: string;
}

export function CreateThreadForm({ forumId }: CreateThreadFormProps) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createThread, undefined);

  if (state?.success && state.threadId) {
    router.push(`/forums`);
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="forumId" value={forumId} />
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
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
          required
          rows={12}
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
          placeholder="seo, marketing, guide"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? "Creating..." : "Create Thread"}
        </button>
        <button
          type="submit"
          name="status"
          value="DRAFT"
          disabled={pending}
          className="rounded-lg border bg-card px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
        >
          Save as Draft
        </button>
      </div>
    </form>
  );
}
