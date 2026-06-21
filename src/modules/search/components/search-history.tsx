"use client";

import React from "react";
import { formatDateRelative } from "@/lib/utils";

interface SearchHistoryItem {
  id: string;
  query: string;
  searchedAt: Date | string;
}

interface SearchHistoryProps {
  history: SearchHistoryItem[];
  onSelectQuery: (query: string) => void;
  onClear: () => void;
}

export function SearchHistory({
  history,
  onSelectQuery,
  onClear,
}: SearchHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          ⏳ Recent Searches
        </h4>
        <button
          onClick={onClear}
          type="button"
          className="text-xs text-destructive hover:underline font-medium cursor-pointer"
        >
          Clear History
        </button>
      </div>
      <div className="space-y-1 rounded-lg border bg-card/50 overflow-hidden divide-y">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectQuery(item.query)}
            className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">🔍</span>
              <span className="font-medium text-sm text-foreground">
                {item.query}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDateRelative(new Date(item.searchedAt))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
