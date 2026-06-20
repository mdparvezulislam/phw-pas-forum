"use client";

import React from "react";

interface TrendingSearchesProps {
  trending: string[];
  onSelectQuery: (query: string) => void;
}

export function TrendingSearches({ trending, onSelectQuery }: TrendingSearchesProps) {
  if (trending.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        🔥 Trending Searches
      </h4>
      <div className="flex flex-wrap gap-2">
        {trending.map((term, index) => (
          <button
            key={`${term}-${index}`}
            onClick={() => onSelectQuery(term)}
            type="button"
            className="text-sm px-3 py-1.5 rounded-full border bg-muted/30 hover:bg-muted text-foreground transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>{term}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
