"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/modules/media/types";

interface MediaGalleryProps {
  items: MediaItem[];
  initialIndex?: number;
  onClose: () => void;
}

export function MediaGallery({
  items,
  initialIndex = 0,
  onClose,
}: MediaGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const current = items[currentIndex];

  const goNext = () =>
    setCurrentIndex((i) => Math.min(i + 1, items.length - 1));
  const goPrev = () => setCurrentIndex((i) => Math.max(i - 1, 0));

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
      >
        <X className="h-6 w-6" />
      </button>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 disabled:opacity-30"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={currentIndex === items.length - 1}
            className="absolute right-16 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 disabled:opacity-30"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <div className="flex flex-col items-center gap-4 px-16">
        <img
          src={current.url}
          alt={current.originalName}
          className="max-h-[80vh] max-w-[90vw] object-contain"
        />
        <div className="text-center text-white">
          <p className="text-sm font-medium">{current.originalName}</p>
          <p className="text-xs text-white/60">
            {currentIndex + 1} / {items.length}
          </p>
        </div>
      </div>
    </div>
  );
}
