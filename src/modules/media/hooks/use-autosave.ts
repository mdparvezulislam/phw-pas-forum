"use client";

import type { JSONContent } from "@tiptap/core";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteEditorDraftAction,
  getEditorDraftAction,
  saveEditorDraftAction,
} from "@/modules/media/actions/editor-drafts";

interface UseAutosaveOptions {
  content: JSONContent | null;
  title?: string;
  threadId?: string;
  postId?: string;
  enabled?: boolean;
  interval?: number;
}

export function useAutosave({
  content,
  title,
  threadId,
  postId,
  enabled = true,
  interval = 30000,
}: UseAutosaveOptions) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef(content);
  contentRef.current = content;

  const save = useCallback(async () => {
    if (isSaving) return;
    if (!contentRef.current) return;

    setIsSaving(true);
    setError(null);
    try {
      const result = await saveEditorDraftAction({
        content: JSON.stringify(contentRef.current),
        title,
        threadId,
        postId,
      });
      if (result.success) {
        setLastSaved(new Date());
      } else {
        setError(result.error || "Save failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  }, [title, threadId, postId, isSaving]);

  useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(() => {
      if (contentRef.current && !isSaving) {
        save();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [enabled, interval, save, isSaving]);

  useEffect(() => {
    const handleBlur = () => {
      if (enabled && contentRef.current && !isSaving) {
        save();
      }
    };
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, [enabled, save, isSaving]);

  const discard = useCallback(async () => {
    try {
      await deleteEditorDraftAction({ threadId, postId });
      setLastSaved(null);
    } catch {
      // silent
    }
  }, [threadId, postId]);

  const recover = useCallback(async () => {
    const result = await getEditorDraftAction({ threadId, postId });
    if (result.success && result.data) {
      return result.data;
    }
    return null;
  }, [threadId, postId]);

  return { save, lastSaved, isSaving, error, discard, recover };
}
