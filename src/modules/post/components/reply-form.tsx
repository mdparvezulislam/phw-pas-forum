"use client";

import { useRouter } from "next/navigation";
import { useActionState, useCallback } from "react";
import { RichTextEditor } from "@/modules/editor/components";
import { useEditorForm } from "@/modules/editor/hooks/use-editor-form";
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
  const { handleEditorChange, handleFormSubmit, contentJsonRef } =
    useEditorForm();

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

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      handleFormSubmit();
    },
    [handleFormSubmit],
  );

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b bg-muted/20 px-4 py-2">
        <h3 className="text-sm font-semibold">Reply to Thread</h3>
        <p className="text-xs text-muted-foreground">Post #{nextPostNumber}</p>
      </div>

      <form action={action} onSubmit={handleSubmit} className="p-4">
        <input type="hidden" name="threadId" value={threadId} />
        <input type="hidden" name="contentJson" ref={contentJsonRef} />
        <textarea
          name="content"
          className="hidden"
          defaultValue=""
          tabIndex={-1}
          aria-hidden="true"
        />

        <RichTextEditor
          onChange={handleEditorChange}
          placeholder="Write your reply..."
          maxLength={50000}
          minHeight="150px"
        />

        <p className="mt-1 text-xs text-muted-foreground">
          Minimum 2 characters, maximum 50,000 characters.
        </p>

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
