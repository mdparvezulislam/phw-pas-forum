"use client";

import React from "react";

interface SearchEmptyStateProps {
  query: string;
}

export function SearchEmptyState({ query }: SearchEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed rounded-xl bg-card/30 backdrop-blur-sm animate-fade-in">
      <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4 text-3xl">
        🔍
      </div>
      <h3 className="text-xl font-semibold mb-2">No results found</h3>
      <p className="text-muted-foreground max-w-md">
        We couldn&apos;t find anything matching <span className="font-semibold text-foreground">&ldquo;{query}&rdquo;</span>.
      </p>
      <div className="mt-6 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-2">Search tips:</p>
        <ul className="list-disc pl-5 text-left space-y-1">
          <li>Check for spelling errors</li>
          <li>Use more general keywords</li>
          <li>Try searching for a different content tab (e.g. Users, Forums)</li>
          <li>Use advanced operators like <code className="bg-muted px-1.5 py-0.5 rounded text-xs text-foreground font-mono">author:username</code> or <code className="bg-muted px-1.5 py-0.5 rounded text-xs text-foreground font-mono">forum:seo</code></li>
        </ul>
      </div>
    </div>
  );
}
