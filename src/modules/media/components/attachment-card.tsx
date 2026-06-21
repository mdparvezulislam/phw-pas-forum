import {
  Archive,
  Download,
  Eye,
  FileText,
  Film,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/modules/media/types";
import { formatFileSize, getMimeTypeCategory } from "@/validations/media";

interface AttachmentCardProps {
  attachment: MediaItem;
  onRemove?: (id: string) => void;
  onPreview?: (attachment: MediaItem) => void;
  showActions?: boolean;
}

export function AttachmentCard({
  attachment,
  onRemove,
  onPreview,
  showActions = true,
}: AttachmentCardProps) {
  const category = getMimeTypeCategory(attachment.mimeType);

  const iconMap = {
    image: <ImageIcon className="h-5 w-5" />,
    video: <Film className="h-5 w-5" />,
    document: <FileText className="h-5 w-5" />,
    unknown: <Archive className="h-5 w-5" />,
  };

  return (
    <div className="group flex items-center gap-3 rounded-md border bg-muted/30 p-3 transition-colors hover:bg-muted/50">
      {category === "image" ? (
        <img
          src={attachment.url}
          alt={attachment.originalName}
          className="h-12 w-12 shrink-0 rounded object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
          {iconMap[category]}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {attachment.originalName}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(attachment.fileSize)}
          {attachment.width && attachment.height
            ? ` · ${attachment.width}×${attachment.height}`
            : ""}
        </p>
      </div>

      {showActions && (
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {category === "image" && onPreview && (
            <button
              type="button"
              onClick={() => onPreview(attachment)}
              className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          <a
            href={attachment.url}
            download={attachment.originalName}
            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Download className="h-4 w-4" />
          </a>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(attachment.id)}
              className="rounded p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
