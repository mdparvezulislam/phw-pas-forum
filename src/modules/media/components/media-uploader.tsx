"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, FileText, Image as ImageIcon, Film, Archive } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFileUpload } from "@/modules/media/hooks/use-file-upload";
import { formatFileSize, getMimeTypeCategory } from "@/validations/media";
import type { UploadResult } from "@/modules/media/types";

interface MediaUploaderProps {
  onUpload: (file: UploadResult) => void;
  onRemove?: (id: string) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  className?: string;
}

export function MediaUploader({
  onUpload,
  onRemove,
  accept = "image/*,.pdf,.zip,.rar,.mp4",
  multiple = false,
  maxFiles = 10,
  maxSize,
  className,
}: MediaUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { upload, progress, isUploading, error } = useFileUpload({
    maxFileSize: maxSize,
    onUploadComplete: (result) => {
      setUploadedFiles((prev) => [...prev, result]);
      onUpload(result);
    },
  });

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files);
      const remaining = maxFiles - uploadedFiles.length;
      const toUpload = arr.slice(0, remaining);

      for (const file of toUpload) {
        await upload(file);
      }
    },
    [upload, maxFiles, uploadedFiles.length],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      const files: File[] = [];
      for (const item of items) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) handleFiles(files);
    },
    [handleFiles],
  );

  const getFileIcon = (mimeType: string) => {
    const category = getMimeTypeCategory(mimeType);
    switch (category) {
      case "image":
        return <ImageIcon className="h-5 w-5" />;
      case "video":
        return <Film className="h-5 w-5" />;
      case "document":
        return <FileText className="h-5 w-5" />;
      default:
        return <Archive className="h-5 w-5" />;
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onPaste={handlePaste}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
        )}
      >
        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Drag & drop or click to upload
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Images, documents, videos up to {formatFileSize(maxSize || 10485760)}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {isUploading && progress && (
        <div className="space-y-1">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Uploading... {progress.percentage}%
          </p>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 rounded-md border bg-muted/30 p-2"
            >
              {file.mimeType.startsWith("image/") ? (
                <img
                  src={file.url}
                  alt={file.originalName}
                  className="h-10 w-10 rounded object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                  {getFileIcon(file.mimeType)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {file.originalName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.fileSize)}
                </p>
              </div>
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(file.id)}
                  className="rounded p-1 hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
