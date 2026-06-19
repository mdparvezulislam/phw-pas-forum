"use client";

import { useState } from "react";
import { formatDateRelative } from "@/lib/utils";
import type { PostEditHistoryItem } from "@/modules/post/types";

interface PostHistoryDialogProps {
  postId: string;
  postNumber: number;
  currentContent: string;
  history: PostEditHistoryItem[];
}

export function PostHistoryDialog({ postId, postNumber, currentContent, history }: PostHistoryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<PostEditHistoryItem | null>(null);

  if (history.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-accent"
      >
        History ({history.length})
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-lg border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-lg font-semibold">
                Edit History - Post #{postNumber}
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded p-1 hover:bg-accent"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto p-4">
              <div className="space-y-4">
                <div className="rounded-lg border bg-green-500/5 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      Current Version
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{currentContent}</p>
                </div>

                {history.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-lg border p-3 ${
                      selectedVersion?.id === item.id ? "border-primary" : ""
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-sm">
                        <span className="font-medium">
                          {item.editor.displayName ?? item.editor.username}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}edited {formatDateRelative(item.editedAt)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedVersion(selectedVersion?.id === item.id ? null : item)}
                        className="text-xs text-primary hover:underline"
                      >
                        {selectedVersion?.id === item.id ? "Hide" : "View"}
                      </button>
                    </div>
                    {item.reason && (
                      <p className="mb-2 text-xs text-muted-foreground">
                        Reason: {item.reason}
                      </p>
                    )}
                    {selectedVersion?.id === item.id && (
                      <div className="mt-2 rounded border bg-muted/30 p-2">
                        <p className="whitespace-pre-wrap text-sm">{item.previousContent}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
