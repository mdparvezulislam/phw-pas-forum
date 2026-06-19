"use client";

import { useCallback, useRef, useState } from "react";
import { getSignedUploadUrl, saveAttachment } from "@/modules/media/actions/upload";
import type { UploadProgress, UploadResult } from "@/modules/media/types";
import {
  ALLOWED_MIME_TYPES,
  DEFAULT_MAX_FILE_SIZE,
  validateFileSize,
  validateFileType,
} from "@/validations/media";

interface UseFileUploadOptions {
  maxFileSize?: number;
  allowedTypes?: readonly string[];
  onUploadComplete?: (result: UploadResult) => void;
  onUploadProgress?: (progress: UploadProgress) => void;
  onUploadError?: (error: string) => void;
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const {
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
    allowedTypes = ALLOWED_MIME_TYPES,
    onUploadComplete,
    onUploadProgress,
    onUploadError,
  } = options;

  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setProgress(null);
    setIsUploading(false);
    setError(null);
  }, []);

  const upload = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      if (!validateFileType(file.type)) {
        const msg = "File type not allowed";
        setError(msg);
        onUploadError?.(msg);
        return null;
      }

      if (!validateFileSize(file.size, maxFileSize)) {
        const msg = "File too large";
        setError(msg);
        onUploadError?.(msg);
        return null;
      }

      setIsUploading(true);
      setError(null);
      setProgress({ loaded: 0, total: file.size, percentage: 0 });

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const signedUrlData = await getSignedUploadUrl(
          file.name,
          file.type,
          file.size,
        );

        if ("error" in signedUrlData) {
          throw new Error(signedUrlData.error);
        }

        const { uploadUrl, key, url } = signedUrlData;

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const prog: UploadProgress = {
                loaded: e.loaded,
                total: e.total,
                percentage: Math.round((e.loaded / e.total) * 100),
              };
              setProgress(prog);
              onUploadProgress?.(prog);
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error("Upload failed"));
            }
          });

          xhr.addEventListener("error", () =>
            reject(new Error("Network error")),
          );
          xhr.addEventListener("abort", () =>
            reject(new Error("Upload cancelled")),
          );

          controller.signal.addEventListener("abort", () => xhr.abort());

          xhr.send(file);
        });

        const saveResult = await saveAttachment({
          fileName: key.split("/").pop() || file.name,
          originalName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          storageKey: key,
          url,
        });

        if ("error" in saveResult) {
          throw new Error(saveResult.error);
        }

        const result: UploadResult = {
          id: saveResult.attachment.id,
          url: saveResult.attachment.url,
          originalName: saveResult.attachment.originalName,
          fileName: saveResult.attachment.fileName,
          mimeType: saveResult.attachment.mimeType,
          fileSize: saveResult.attachment.fileSize,
          storageKey: saveResult.attachment.storageKey,
          width: saveResult.attachment.width,
          height: saveResult.attachment.height,
        };
        onUploadComplete?.(result);
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        if (msg !== "Upload cancelled") {
          setError(msg);
          onUploadError?.(msg);
        }
        return null;
      } finally {
        setIsUploading(false);
        abortRef.current = null;
      }
    },
    [maxFileSize, allowedTypes, onUploadComplete, onUploadProgress, onUploadError],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setIsUploading(false);
    setProgress(null);
  }, []);

  return { upload, progress, isUploading, error, reset, cancel };
}
