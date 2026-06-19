"use client";

import { useState } from "react";
import { X, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFileUpload } from "@/modules/media/hooks/use-file-upload";
import type { UploadResult } from "@/modules/media/types";

interface ImagePickerProps {
  onSelect: (url: string, alt: string) => void;
  onClose: () => void;
}

export function ImagePicker({ onSelect, onClose }: ImagePickerProps) {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [alt, setAlt] = useState("");

  const { upload, isUploading, progress } = useFileUpload({
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    onUploadComplete: (result: UploadResult) => {
      setSelectedUrl(result.url);
    },
  });

  const handleInsert = () => {
    if (selectedUrl) {
      onSelect(selectedUrl, alt);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-lg rounded-lg border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-semibold">Insert Image</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <label
              htmlFor="image-url"
              className="mb-1 block text-sm font-medium"
            >
              Image URL
            </label>
            <input
              id="image-url"
              type="url"
              value={selectedUrl || ""}
              onChange={(e) => setSelectedUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="image-alt"
              className="mb-1 block text-sm font-medium"
            >
              Alt Text
            </label>
            <input
              id="image-alt"
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Describe the image"
              className="w-full rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="mb-4">
            <p className="mb-2 text-sm font-medium">Or upload an image</p>
            <label
              className={cn(
                "flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 transition-colors",
                isUploading
                  ? "pointer-events-none opacity-50"
                  : "hover:border-primary/50",
              )}
            >
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {isUploading
                  ? `Uploading... ${progress?.percentage || 0}%`
                  : "Click to upload"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) upload(file);
                }}
              />
            </label>
          </div>

          {selectedUrl && (
            <div className="mb-4">
              <img
                src={selectedUrl}
                alt={alt}
                className="max-h-48 rounded border object-contain"
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border px-3 py-1.5 text-sm hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInsert}
              disabled={!selectedUrl}
              className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Insert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
