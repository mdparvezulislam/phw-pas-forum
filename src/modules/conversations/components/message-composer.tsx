"use client";

import type { JSONContent } from "@tiptap/core";
import { FileIcon, Loader2, Paperclip, Send, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui";
import { RichTextEditor } from "@/modules/editor/components";
import { generatePlainText } from "@/modules/editor/utils/content";
import {
  getSignedUploadUrl,
  saveAttachment,
} from "@/modules/media/actions/upload";
import { sendMessageAction, sendTypingAction } from "../actions/conversations";

interface MessageComposerProps {
  conversationId: string;
}

interface UploadedFile {
  id: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  url: string;
}

export function MessageComposer({ conversationId }: MessageComposerProps) {
  const [editorContent, setEditorContent] = useState<JSONContent | null>(null);
  const [editorKey, setEditorKey] = useState(0); // Used to reset editor on send
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // File Upload State
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  // Clean up typing timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  // Handle typing state debounce
  const handleEditorChange = (json: JSONContent) => {
    setEditorContent(json);

    if (!isTyping) {
      setIsTyping(true);
      sendTypingAction(conversationId, true);
    }

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingAction(conversationId, false);
    }, 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        // 1. Get presigned upload URL
        const signedRes = await getSignedUploadUrl(
          file.name,
          file.type,
          file.size,
        );
        if ("error" in signedRes) {
          alert(signedRes.error);
          continue;
        }

        // 2. Put file to R2
        const putRes = await fetch(signedRes.uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!putRes.ok) {
          throw new Error("Failed to upload file to storage bucket");
        }

        // 3. Save attachment reference in database
        const saveRes = await saveAttachment({
          fileName: file.name,
          originalName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          storageKey: signedRes.key,
          url: signedRes.url,
        });

        if ("error" in saveRes) {
          alert(saveRes.error);
          continue;
        }

        setUploadedFiles((prev) => [
          ...prev,
          {
            id: saveRes.attachment.id,
            originalName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            url: signedRes.url,
          },
        ]);
      }
    } catch (err: any) {
      console.error("[AttachmentUpload] error:", err);
      alert("Attachment upload failed: " + (err.message || "Unknown error"));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSend = () => {
    if (!editorContent) return;
    const plainText = generatePlainText(editorContent);
    if (!plainText.trim() && uploadedFiles.length === 0) return;

    startTransition(async () => {
      const attachmentIds = uploadedFiles.map((f) => f.id);
      const res = await sendMessageAction(
        conversationId,
        editorContent,
        attachmentIds,
      );

      if (res.success) {
        // Reset state
        setEditorContent(null);
        setUploadedFiles([]);
        setEditorKey((k) => k + 1); // Reset EditorComponent
        if (typingTimerRef.current) {
          clearTimeout(typingTimerRef.current);
        }
        setIsTyping(false);
        await sendTypingAction(conversationId, false); // Cancel typing status
      } else {
        alert(res.error || "Failed to send message");
      }
    });
  };

  const handleImageUploadHelper = async (file: File): Promise<string> => {
    const signedRes = await getSignedUploadUrl(file.name, file.type, file.size);
    if ("error" in signedRes) throw new Error(signedRes.error);

    const putRes = await fetch(signedRes.uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
    if (!putRes.ok) throw new Error("Upload failed");

    await saveAttachment({
      fileName: file.name,
      originalName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      storageKey: signedRes.key,
      url: signedRes.url,
    });
    return signedRes.url;
  };

  return (
    <div className="border-t bg-background p-4 space-y-3 shrink-0">
      {/* Uploaded Files Snippets */}
      {uploadedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-1.5 text-xs text-foreground"
            >
              <FileIcon className="h-4 w-4 text-muted-foreground" />
              <span className="max-w-[120px] truncate font-medium">
                {file.originalName}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveFile(file.id)}
                className="text-muted-foreground hover:text-destructive ml-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Editor & Controls */}
      <div className="flex items-end gap-3">
        <div className="flex-1 min-w-0">
          <RichTextEditor
            key={editorKey}
            content={null}
            onChange={handleEditorChange}
            placeholder="Write a message..."
            maxLength={20000}
            minHeight="80px"
            onImageUpload={handleImageUploadHelper}
            onAttachmentUpload={handleImageUploadHelper}
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isPending}
            title="Attach Files"
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <Paperclip className="h-5 w-5" />
            )}
          </Button>

          <Button
            size="icon"
            onClick={handleSend}
            disabled={
              isUploading ||
              isPending ||
              (!editorContent && uploadedFiles.length === 0)
            }
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
export default MessageComposer;
