"use client";

import { useCallback, useRef, useState } from "react";
import type { JSONContent } from "@tiptap/core";
import { generatePlainText } from "@/modules/editor/utils/content";

interface EditorSubmitOptions {
  contentJsonRef?: React.RefObject<HTMLInputElement | null>;
  contentRef?: React.RefObject<HTMLTextAreaElement | null>;
}

/**
 * Hook to manage TipTap editor content for form submission.
 * Tracks JSON content, generates plain text for the content field,
 * and syncs both into form inputs before submission.
 */
export function useEditorForm() {
  const [editorJson, setEditorJson] = useState<JSONContent | null>(null);
  const contentJsonRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const handleEditorChange = useCallback((json: JSONContent) => {
    setEditorJson(json);
  }, []);

  const handleFormSubmit = useCallback(() => {
    if (editorJson && contentJsonRef.current) {
      contentJsonRef.current.value = JSON.stringify(editorJson);
    }
    if (editorJson && contentRef.current) {
      const plainText = generatePlainText(editorJson);
      contentRef.current.value = plainText;
    }
  }, [editorJson]);

  return {
    editorJson,
    handleEditorChange,
    handleFormSubmit,
    contentJsonRef,
    contentRef,
  };
}
