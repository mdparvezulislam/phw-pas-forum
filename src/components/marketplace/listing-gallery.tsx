"use client";

import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Maximize2,
  Video,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MediaItem {
  id: string;
  type: "IMAGE" | "VIDEO" | "DOCUMENT";
  attachment: {
    url: string;
    name?: string;
  };
}

interface ListingGalleryProps {
  media: MediaItem[];
  className?: string;
}

export function ListingGallery({ media, className }: ListingGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  if (media.length === 0) {
    return (
      <div
        className={cn(
          "flex aspect-video items-center justify-center rounded-xl bg-muted",
          className,
        )}
      >
        <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
      </div>
    );
  }

  const active = media[activeIndex];

  return (
    <>
      <div className={cn("space-y-3", className)}>
        {/* Main view */}
        <div className="group relative aspect-video overflow-hidden rounded-xl bg-muted">
          {active?.type === "IMAGE" ? (
            <img
              src={active.attachment.url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : active?.type === "VIDEO" ? (
            <video
              src={active.attachment.url}
              className="h-full w-full object-cover"
              controls
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <FileText className="h-12 w-12 text-muted-foreground/40" />
              <span className="text-sm text-muted-foreground">
                {active?.attachment.name ?? "Document"}
              </span>
            </div>
          )}

          {/* Navigation */}
          {media.length > 1 && (
            <>
              <button
                onClick={() =>
                  setActiveIndex((i) => (i > 0 ? i - 1 : media.length - 1))
                }
                className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  setActiveIndex((i) => (i < media.length - 1 ? i + 1 : 0))
                }
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Fullscreen button */}
          <button
            onClick={() => setFullscreen(true)}
            className="absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-sm"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          {/* Counter */}
          <div className="absolute bottom-2 left-2 rounded-full bg-black/40 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
            {activeIndex + 1} / {media.length}
          </div>
        </div>

        {/* Thumbnails */}
        {media.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {media.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                  i === activeIndex
                    ? "border-primary"
                    : "border-transparent opacity-60 hover:opacity-100",
                )}
              >
                {item.type === "IMAGE" ? (
                  <img
                    src={item.attachment.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : item.type === "VIDEO" ? (
                  <div className="flex h-full items-center justify-center bg-muted">
                    <Video className="h-4 w-4 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setFullscreen(false)}
        >
          <button
            onClick={() => setFullscreen(false)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm"
          >
            <X className="h-5 w-5" />
          </button>

          {active?.type === "IMAGE" ? (
            <img
              src={active.attachment.url}
              alt=""
              className="max-h-[85vh] max-w-[85vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          ) : active?.type === "VIDEO" ? (
            <video
              src={active.attachment.url}
              className="max-h-[85vh] max-w-[85vw]"
              controls
              onClick={(e) => e.stopPropagation()}
            />
          ) : null}

          {media.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((i) => (i > 0 ? i - 1 : media.length - 1));
                }}
                className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((i) => (i < media.length - 1 ? i + 1 : 0));
                }}
                className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
