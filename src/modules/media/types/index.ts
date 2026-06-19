export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  id: string;
  url: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  storageKey: string;
  width?: number;
  height?: number;
}

export interface MediaItem extends UploadResult {
  uploaderId: string;
  createdAt: Date;
  status: "PENDING" | "ACTIVE" | "DELETED" | "QUARANTINED";
}

export interface AttachmentCardProps {
  attachment: MediaItem;
  onRemove?: (id: string) => void;
  onPreview?: (attachment: MediaItem) => void;
  showActions?: boolean;
}

export interface FileUploadOptions {
  maxFileSize?: number;
  allowedTypes?: string[];
  onUploadComplete?: (result: UploadResult) => void;
  onUploadProgress?: (progress: UploadProgress) => void;
  onUploadError?: (error: Error) => void;
}

export interface UseFileUploadReturn {
  upload: (file: File) => Promise<UploadResult | null>;
  progress: UploadProgress | null;
  isUploading: boolean;
  error: string | null;
  abort: () => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  isPasting: boolean;
  setIsPasting: (pasting: boolean) => void;
}

export interface MediaUploaderProps {
  onUpload?: (result: UploadResult) => void;
  onRemove?: (attachmentId: string) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  className?: string;
}

export interface ImagePickerProps {
  onSelect?: (attachment: MediaItem) => void;
  selectedId?: string;
  className?: string;
}

export interface ImagePickerSelection {
  attachmentId: string;
  url: string;
  alt: string;
  width?: "full" | "half" | "third";
  alignment?: "left" | "center" | "right";
}

export interface MediaGalleryProps {
  onSelect?: (attachment: MediaItem) => void;
  selectable?: boolean;
  className?: string;
}

export interface MediaGalleryFilter {
  type: "all" | "image" | "document" | "video";
  search: string;
  sortBy: "date" | "size" | "name";
  sortOrder: "asc" | "desc";
}

export interface DraftRecoveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draftContent: string;
  draftTitle?: string;
  lastSaved: Date;
  onRecover: () => void;
  onDiscard: () => void;
}

export interface UseAutosaveOptions {
  content: string;
  threadId?: string;
  postId?: string;
  enabled?: boolean;
}

export interface UseAutosaveReturn {
  save: () => Promise<void>;
  lastSaved: Date | null;
  isSaving: boolean;
  error: string | null;
}
