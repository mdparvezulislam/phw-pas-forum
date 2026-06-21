"use client";

import { useRouter } from "next/navigation";
import { useActionState, useCallback } from "react";
import { RichTextEditor } from "@/modules/editor/components";
import { useEditorForm } from "@/modules/editor/hooks/use-editor-form";
import { createThread } from "@/modules/thread/actions";

interface CreateThreadFormProps {
  forumId: string;
}

export function CreateThreadForm({ forumId }: CreateThreadFormProps) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createThread, undefined);
  const { handleEditorChange, handleFormSubmit, contentJsonRef, contentRef } =
    useEditorForm();

  if (state?.success && state.threadId) {
    router.push(`/forums`);
  }

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      handleFormSubmit();
    },
    [handleFormSubmit],
  );

  return (
    <form action={action} onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="forumId" value={forumId} />
      <input type="hidden" name="contentJson" ref={contentJsonRef} />
      <textarea
        name="content"
        className="hidden"
        defaultValue=""
        tabIndex={-1}
        aria-hidden="true"
        ref={contentRef}
      />
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
        <label
          htmlFor="thread-content"
          className="mb-1 block text-sm font-medium"
        >
          Content
        </label>
        <RichTextEditor
          onChange={handleEditorChange}
          placeholder="Write your thread content..."
          maxLength={100000}
          minHeight="200px"
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
