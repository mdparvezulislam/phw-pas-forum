"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { getExtensions } from "@/modules/editor/utils/extensions";
import { EditorToolbar } from "./editor-toolbar";
import { SlashCommandDropdown } from "./slash-command-dropdown";

interface RichTextEditorProps {
  content?: JSONContent | string | null;
  onChange?: (json: JSONContent) => void;
  placeholder?: string;
  editable?: boolean;
  maxLength?: number;
  className?: string;
  minHeight?: string;
  postId?: string;
  threadId?: string;
  onImageUpload?: (file: File) => Promise<string>;
  onAttachmentUpload?: (file: File) => Promise<string>;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Write something...",
  editable = true,
  maxLength,
  className,
  minHeight = "200px",
  postId,
  threadId,
  onImageUpload,
  onAttachmentUpload,
}: RichTextEditorProps) {
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [characterCount, setCharacterCount] = useState(0);

  const extensions = getExtensions({ placeholder, maxLength });

  const editor = useEditor({
    extensions,
    content: content ?? "",
    editable,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none min-h-[var(--editor-min-height)]",
          "focus:outline-none",
          "[&_.ProseMirror]:min-h-[var(--editor-min-height)]",
        ),
        style: `--editor-min-height: ${minHeight}; min-height: ${minHeight};`,
      },
    },
    onUpdate: ({ editor: ed }) => {
      const json = ed.getJSON();
      setCharacterCount(ed.storage.characterCount?.characters() ?? 0);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        onChange?.(json);
      }, 300);
    },
  });

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (editor && content !== undefined) {
      const currentContent = JSON.stringify(editor.getJSON());
      const newContent =
        typeof content === "string" ? content : JSON.stringify(content);
      if (currentContent !== newContent) {
        editor.commands.setContent(content ?? "");
      }
    }
  }, [editor, content]);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (!editor || !onImageUpload) return;

      const items = Array.from(e.clipboardData.items);
      const imageItem = items.find((item) => item.type.startsWith("image/"));

      if (imageItem) {
        e.preventDefault();
        const file = imageItem.getAsFile();
        if (file) {
          onImageUpload(file).then((url) => {
            editor
              .chain()
              .focus()
              .insertContent({
                type: "image",
                attrs: { src: url, alt: file.name, title: file.name },
              })
              .run();
          });
        }
      }
    },
    [editor, onImageUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (!editor || !onImageUpload) return;

      const items = Array.from(e.dataTransfer.files);
      const imageItem = items.find((file) => file.type.startsWith("image/"));

      if (imageItem) {
        e.preventDefault();
        onImageUpload(imageItem).then((url) => {
          editor
            .chain()
            .focus()
            .insertContent({
              type: "image",
              attrs: { src: url, alt: imageItem.name, title: imageItem.name },
            })
            .run();
        });
      }
    },
    [editor, onImageUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  if (!editor) return null;

  return (
      <div
        className={cn("relative rounded-lg border bg-card", className)}
      data-post-id={postId}
      data-thread-id={threadId}
    >
      {editable && (
        <EditorToolbar
          editor={editor}
          onImageUpload={onImageUpload}
          onAttachmentUpload={onAttachmentUpload}
        />
      )}

      <div
        className={cn(
          "relative min-h-[var(--editor-min-height)] px-4 py-3",
          !editable && "rounded-lg",
        )}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <EditorContent
          editor={editor}
          className="min-h-[var(--editor-min-height)]"
        />
        <SlashCommandDropdown editor={editor} />
      </div>

      {editable && maxLength && (
        <div className="flex items-center justify-end border-t px-4 py-2">
          <span
            className={cn(
              "text-xs tabular-nums",
              characterCount > maxLength * 0.9
                ? "text-destructive"
                : "text-muted-foreground",
            )}
          >
            {characterCount.toLocaleString()} / {maxLength.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
