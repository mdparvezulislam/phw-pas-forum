"use client";

import { useCallback, useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  CodeSquare,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Image,
  Paperclip,
  Table,
  Undo2,
  Redo2,
  ChevronDown,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  editor: Editor | null;
  onImageUpload?: (file: File) => Promise<string>;
  onAttachmentUpload?: (file: File) => Promise<string>;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "disabled:pointer-events-none disabled:opacity-50",
        isActive && "bg-accent text-accent-foreground",
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-6 w-px bg-border" />;
}

export function EditorToolbar({
  editor,
  onImageUpload,
  onAttachmentUpload,
}: EditorToolbarProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);

  const setLink = useCallback(() => {
    if (!editor) return;

    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    }
    setShowLinkInput(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && onImageUpload && editor) {
        const url = await onImageUpload(file);
        editor
          .chain()
          .focus()
          .insertContent({
            type: "image",
            attrs: { src: url, alt: file.name, title: file.name },
          })
          .run();
      }
    };
    input.click();
  }, [editor, onImageUpload]);

  const handleAttachmentUpload = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && onAttachmentUpload) {
        await onAttachmentUpload(file);
      }
    };
    input.click();
  }, [onAttachmentUpload]);

  const insertTable = useCallback(() => {
    if (editor) {
      editor
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    }
  }, [editor]);

  if (!editor) return null;

  const currentLevel = editor.getAttributes("heading").level;

  return (
    <div className="flex flex-wrap items-center gap-0.5 rounded-t-lg border border-b-0 bg-muted/30 px-2 py-1.5">
      <div className="flex items-center gap-0.5 sm:hidden">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="hidden items-center gap-0.5 sm:flex">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <ToolbarDivider />

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowHeadingMenu(!showHeadingMenu)}
          title="Headings"
          className={cn(
            "inline-flex h-8 items-center gap-1 rounded-md px-2 transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            currentLevel && "bg-accent text-accent-foreground",
          )}
        >
          {currentLevel ? (
            <span className="text-xs font-semibold">H{currentLevel}</span>
          ) : (
            <span className="text-xs">Text</span>
          )}
          <ChevronDown className="h-3 w-3" />
        </button>

        {showHeadingMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowHeadingMenu(false)}
            />
            <div className="absolute left-0 top-full z-50 mt-1 w-36 rounded-lg border bg-popover p-1 shadow-md">
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().setParagraph().run();
                  setShowHeadingMenu(false);
                }}
                className={cn(
                  "flex w-full items-center rounded-md px-2 py-1.5 text-sm transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  !currentLevel && "bg-accent text-accent-foreground",
                )}
              >
                Normal text
              </button>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().toggleHeading({ level: 1 }).run();
                  setShowHeadingMenu(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  currentLevel === 1 && "bg-accent text-accent-foreground",
                )}
              >
                <Heading1 className="h-4 w-4" />
                <span>Heading 1</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().toggleHeading({ level: 2 }).run();
                  setShowHeadingMenu(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  currentLevel === 2 && "bg-accent text-accent-foreground",
                )}
              >
                <Heading2 className="h-4 w-4" />
                <span>Heading 2</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().toggleHeading({ level: 3 }).run();
                  setShowHeadingMenu(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  currentLevel === 3 && "bg-accent text-accent-foreground",
                )}
              >
                <Heading3 className="h-4 w-4" />
                <span>Heading 3</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().toggleHeading({ level: 4 }).run();
                  setShowHeadingMenu(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  currentLevel === 4 && "bg-accent text-accent-foreground",
                )}
              >
                <Heading4 className="h-4 w-4" />
                <span>Heading 4</span>
              </button>
            </div>
          </>
        )}
      </div>

      <ToolbarDivider />

      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <ToolbarDivider />

      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive("taskList")}
          title="Task List"
        >
          <ListChecks className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <ToolbarDivider />

      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          title="Code Block"
        >
          <CodeSquare className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="hidden items-center gap-0.5 sm:flex">
        <ToolbarDivider />

        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().setTextAlign("left").run()
            }
            isActive={editor.isActive({ textAlign: "left" })}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().setTextAlign("center").run()
            }
            isActive={editor.isActive({ textAlign: "center" })}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().setTextAlign("right").run()
            }
            isActive={editor.isActive({ textAlign: "right" })}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>

      <div className="hidden items-center gap-0.5 md:flex">
        <ToolbarDivider />

        <div className="relative">
          <ToolbarButton
            onClick={() => {
              if (editor.isActive("link")) {
                editor.chain().focus().unsetLink().run();
              } else {
                const prevUrl = editor.getAttributes("link").href ?? "";
                setLinkUrl(prevUrl);
                setShowLinkInput(true);
              }
            }}
            isActive={editor.isActive("link")}
            title="Add/Edit Link"
          >
            <Link className="h-4 w-4" />
          </ToolbarButton>

          {showLinkInput && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowLinkInput(false)}
              />
              <div className="absolute left-0 top-full z-50 mt-1 flex w-64 items-center gap-1 rounded-lg border bg-popover p-1 shadow-md">
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 rounded-md border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setLink();
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={setLink}
                  className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowLinkInput(false)}
                  className="rounded-md p-1 hover:bg-accent"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-0.5 md:hidden">
        <ToolbarDivider />

        <ToolbarButton
          onClick={() => {
            if (editor.isActive("link")) {
              editor.chain().focus().unsetLink().run();
            } else {
              const prevUrl = editor.getAttributes("link").href ?? "";
              setLinkUrl(prevUrl);
              setShowLinkInput(true);
            }
          }}
          isActive={editor.isActive("link")}
          title="Add Link"
        >
          <Link className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <ToolbarDivider />

      <div className="flex items-center gap-0.5">
        {onImageUpload && (
          <ToolbarButton onClick={handleImageUpload} title="Insert Image">
            <Image className="h-4 w-4" />
          </ToolbarButton>
        )}
        {onAttachmentUpload && (
          <ToolbarButton
            onClick={handleAttachmentUpload}
            title="Attach File"
          >
            <Paperclip className="h-4 w-4" />
          </ToolbarButton>
        )}
        <ToolbarButton onClick={insertTable} title="Insert Table">
          <Table className="h-4 w-4" />
        </ToolbarButton>
      </div>
    </div>
  );
}
