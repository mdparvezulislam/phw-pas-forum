"use client";

import { AlertTriangle, Trash2 } from "lucide-react";

interface DraftRecoveryDialogProps {
  lastSaved: string | null;
  onRecover: () => void;
  onDiscard: () => void;
}

export function DraftRecoveryDialog({
  lastSaved,
  onRecover,
  onDiscard,
}: DraftRecoveryDialogProps) {
  if (!lastSaved) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
          Recover draft?
        </p>
        <p className="text-xs text-amber-600 dark:text-amber-400">
          You have an unsaved draft from{" "}
          {new Date(lastSaved).toLocaleString()}.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onDiscard}
          className="flex items-center gap-1 rounded border border-amber-300 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/50"
        >
          <Trash2 className="h-3 w-3" />
          Discard
        </button>
        <button
          type="button"
          onClick={onRecover}
          className="rounded bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
        >
          Recover
        </button>
      </div>
    </div>
  );
}
