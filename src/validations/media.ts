import { z } from "zod";

export const FILE_SIZE_UNITS = ["B", "KB", "MB", "GB"] as const;

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/zip",
  "application/x-rar-compressed",
  "video/mp4",
] as const;

export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/zip",
  "application/x-rar-compressed",
] as const;

export const VIDEO_MIME_TYPES = ["video/mp4"] as const;

export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;
export const IMAGE_MAX_SIZE = 5 * 1024 * 1024;
export const VIDEO_MAX_SIZE = 50 * 1024 * 1024;
export const DOCUMENT_MAX_SIZE = 10 * 1024 * 1024;

export const uploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.string().refine(
    (type) => (ALLOWED_MIME_TYPES as readonly string[]).includes(type),
    "File type not allowed",
  ),
  fileSize: z
    .number()
    .min(1, "File is empty")
    .max(DEFAULT_MAX_FILE_SIZE, "File too large"),
});

export const deleteAttachmentSchema = z.object({
  id: z.string().uuid("Invalid attachment ID"),
});

export const autoSaveDraftSchema = z.object({
  content: z.any().nullable(),
  title: z.string().max(200).optional(),
  threadId: z.string().uuid().optional(),
  postId: z.string().uuid().optional(),
});

export function validateFileType(mimeType: string): boolean {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function validateFileSize(
  size: number,
  maxSize = DEFAULT_MAX_FILE_SIZE,
): boolean {
  return size > 0 && size <= maxSize;
}

export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return "";
  return filename.slice(lastDot + 1).toLowerCase();
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = Number.parseFloat((bytes / k ** i).toFixed(1));
  return `${size} ${FILE_SIZE_UNITS[i]}`;
}

export function getMimeTypeCategory(
  mimeType: string,
): "image" | "video" | "document" | "unknown" {
  if ((IMAGE_MIME_TYPES as readonly string[]).includes(mimeType)) return "image";
  if ((VIDEO_MIME_TYPES as readonly string[]).includes(mimeType)) return "video";
  if ((DOCUMENT_MIME_TYPES as readonly string[]).includes(mimeType))
    return "document";
  return "unknown";
}
