"use client";

import type { JSONContent } from "@tiptap/core";
import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { RichTextEditor } from "@/modules/editor/components";
import { generatePlainText } from "@/modules/editor/utils/content";
import { updatePost } from "@/modules/post/actions";
import type { PostWithAuthor } from "@/modules/post/types";

interface EditReplyFormProps {
  post: PostWithAuthor;
  onCancel: () => void;
}

export function EditReplyForm({ post, onCancel }: EditReplyFormProps) {
  const [state, action, pending] = useActionState(updatePost, undefined);
  const [editorJson, setEditorJson] = useState<JSONContent | null>(null);
  const contentJsonRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [initialContent, setInitialContent] = useState<
    JSONContent | string | null
  >(null);

  useEffect(() => {
    if (post.contentJson) {
      try {
        setInitialContent(
          JSON.parse(post.contentJson as string) as JSONContent,
        );
      } catch {
        setInitialContent(post.content);
      }
    } else {
      setInitialContent(post.content);
    }
  }, [post.contentJson, post.content]);

  if (state?.success) {
    onCancel();
  }

  const handleEditorChange = useCallback((json: JSONContent) => {
    setEditorJson(json);
  }, []);

  const handleSubmit = useCallback(() => {
    if (editorJson && contentJsonRef.current) {
      contentJsonRef.current.value = JSON.stringify(editorJson);
    }
    if (editorJson && contentRef.current) {
      contentRef.current.value = generatePlainText(editorJson);
    }
  }, [editorJson]);

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b bg-muted/20 px-4 py-2">
        <h3 className="text-sm font-semibold">Edit Post #{post.postNumber}</h3>
      </div>

      <form action={action} onSubmit={handleSubmit} className="p-4">
        <input type="hidden" name="id" value={post.id} />
        <input type="hidden" name="contentJson" ref={contentJsonRef} />
        <textarea
          name="content"
          className="hidden"
          defaultValue={post.content}
          tabIndex={-1}
          aria-hidden="true"
          ref={contentRef}
        />

        <div className="space-y-4">
          <RichTextEditor
            content={initialContent}
            onChange={handleEditorChange}
            placeholder="Edit your post..."
            maxLength={50000}
            minHeight="150px"
          />

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
