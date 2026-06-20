"use client";

import { useState, useTransition } from "react";
import { editMessageAction, deleteMessageAction } from "../actions/conversations";
import { ContentRenderer } from "@/modules/editor/components/content-renderer";
import { Button } from "@/components/ui";
import { MoreHorizontal, Pencil, Trash, X, Check, FileIcon } from "lucide-react";

interface Attachment {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  url: string;
}

interface Message {
  id: string;
  senderId: string;
  contentJson: any;
  hasAttachments: boolean;
  isEdited: boolean;
  editedAt: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  sender: {
    id: string;
    username: string | null;
    displayName: string | null;
    image: string | null;
  };
  attachments: Attachment[];
  readReceipts: {
    userId: string;
    username: string | null;
    displayName: string | null;
    readAt: Date;
  }[];
}

interface ConversationMessageProps {
  message: Message;
  currentUserId: string;
}

export function ConversationMessage({ message, currentUserId }: ConversationMessageProps) {
  const isOwn = message.senderId === currentUserId;
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Mark edit draft value
  const handleStartEdit = () => {
    setIsEditing(true);
    setIsMenuOpen(false);
    // Simple text extraction from JSON content if it's a paragraph
    const text = message.contentJson?.content?.[0]?.content?.[0]?.text || "";
    setEditValue(text);
  };

  const handleSaveEdit = () => {
    if (!editValue.trim() || editValue === message.contentJson?.content?.[0]?.content?.[0]?.text) {
      setIsEditing(false);
      return;
    }

    startTransition(async () => {
      const contentJson = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: editValue }],
          },
        ],
      };
      const res = await editMessageAction(message.id, contentJson);
      if (res.success) {
        setIsEditing(false);
      } else {
        alert(res.error || "Failed to edit message");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    startTransition(async () => {
      const res = await deleteMessageAction(message.id);
      if (!res.success) {
        alert(res.error || "Failed to delete message");
      }
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  // Filter out sender's own read receipts for rendering receipts list
  const otherReadReceipts = message.readReceipts.filter((r) => r.userId !== message.senderId);

  return (
    <div className={`flex w-full gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
        {(message.sender.displayName || message.sender.username || "?").charAt(0).toUpperCase()}
      </div>

      {/* Bubble Container */}
      <div className={`flex max-w-[70%] flex-col space-y-1 ${isOwn ? "items-end" : "items-start"}`}>
        {/* Meta */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            {message.sender.displayName || message.sender.username}
          </span>
          <span>
            {new Date(message.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
          </span>
          {message.isEdited && <span className="text-[10px] italic">(edited)</span>}
        </div>

        {/* Bubble */}
        <div className="relative group flex items-start gap-2">
          {/* Controls Trigger (Own messages, not deleted) */}
          {isOwn && !message.isDeleted && !isEditing && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              {isMenuOpen && (
                <div className="absolute right-8 top-0 z-10 rounded border bg-popover shadow-md py-1 text-xs divide-y min-w-[80px]">
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="flex w-full items-center gap-1.5 px-3 py-1.5 hover:bg-muted text-left"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex w-full items-center gap-1.5 px-3 py-1.5 hover:bg-muted text-left text-destructive"
                  >
                    <Trash className="h-3 w-3" /> Delete
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Message Content */}
          <div
            className={`rounded-lg px-3 py-2 text-sm ${
              message.isDeleted
                ? "bg-muted text-muted-foreground italic border border-dashed border-muted-foreground/30"
                : isOwn
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            }`}
          >
            {isEditing ? (
              <div className="flex items-center gap-2 max-w-sm">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="rounded border bg-background text-foreground px-2 py-1 text-sm focus:outline-none"
                  autoFocus
                />
                <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground" onClick={handleSaveEdit} disabled={isPending}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <ContentRenderer content={message.contentJson} />
            )}
          </div>
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-1">
            {message.attachments.map((att) => (
              <a
                key={att.id}
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded border bg-card hover:bg-muted/30 px-3 py-1.5 text-xs text-foreground no-underline border-muted"
              >
                <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{att.originalName}</p>
                  <p className="text-[10px] text-muted-foreground">{formatSize(att.fileSize)}</p>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Seen receipts */}
        {isOwn && otherReadReceipts.length > 0 && (
          <div className="text-[10px] text-muted-foreground italic mt-0.5">
            Seen by {otherReadReceipts.map((r) => r.displayName).join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}
export default ConversationMessage;
