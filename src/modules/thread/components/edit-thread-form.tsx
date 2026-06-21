"use client";

import type { JSONContent } from "@tiptap/core";
import { useRouter } from "next/navigation";
import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { RichTextEditor } from "@/modules/editor/components";
import { generatePlainText } from "@/modules/editor/utils/content";
import { updateThread } from "@/modules/thread/actions";
import type { ThreadWithRelations } from "@/modules/thread/types";

interface EditThreadFormProps {
  thread: ThreadWithRelations;
}

export function EditThreadForm({ thread }: EditThreadFormProps) {
  const router = useRouter();
  const [state, action, pending] = useActionState(updateThread, undefined);
  const [editorJson, setEditorJson] = useState<JSONContent | null>(null);
  const contentJsonRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [initialContent, setInitialContent] = useState<
    JSONContent | string | null
  >(null);

  useEffect(() => {
    if (thread.contentJson) {
      try {
        setInitialContent(
          JSON.parse(thread.contentJson as string) as JSONContent,
        );
      } catch {
        setInitialContent(thread.content);
      }
    } else {
      setInitialContent(thread.content);
    }
  }, [thread.contentJson, thread.content]);

  if (state?.success) {
    router.push(`/forums`);
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
    <form action={action} onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="id" value={thread.id} />
      <input type="hidden" name="contentJson" ref={contentJsonRef} />
      <textarea
        name="content"
        className="hidden"
        defaultValue={thread.content}
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
        <RichTextEditor
          content={initialContent}
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
          defaultValue={thread.tags.map((t) => t.tag).join(", ")}
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
          {pending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
