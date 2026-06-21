"use client";

import React, { useEffect, useState } from "react";
import {
  clearSearchHistoryAction,
  executeSearchAction,
  getSearchHistoryAction,
  getTrendingSearchesAction,
  type SerializableSearchOptions,
} from "@/modules/search/actions/search";
import { SearchBar } from "./search-bar";
import { SearchEmptyState } from "./search-empty-state";
import { type SearchFilterState, SearchFilters } from "./search-filters";
import { SearchHistory } from "./search-history";
import { SearchResults } from "./search-results";
import { TrendingSearches } from "./trending-searches";

export function SearchDashboard() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    hits: any[];
    found: number;
    page: number;
    totalPages: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search filter options
  const [filters, setFilters] = useState<SearchFilterState>({
    contentType: "all",
    author: "",
    minReputation: "",
    sortBy: "relevance",
    startDate: "",
    endDate: "",
    tagsString: "",
  });

  // Auxiliary lists
  const [history, setHistory] = useState<any[]>([]);
  const [trending, setTrending] = useState<string[]>([]);

  // Load auxiliary lists on mount
  useEffect(() => {
    loadHistory();
    loadTrending();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await getSearchHistoryAction();
      if (res.success && res.history) {
        setHistory(res.history);
      }
    } catch (err) {
      console.error("Failed to load search history:", err);
    }
  };

  const loadTrending = async () => {
    try {
      const res = await getTrendingSearchesAction();
      if (res.success && res.trending) {
        setTrending(res.trending);
      }
    } catch (err) {
      console.error("Failed to load trending queries:", err);
    }
  };

  const handleClearHistory = async () => {
    try {
      const res = await clearSearchHistoryAction();
      if (res.success) {
        setHistory([]);
      }
    } catch (err) {
      console.error("Failed to clear search history:", err);
    }
  };

  // Perform search operation
  const handleSearch = async (
    searchQuery: string,
    overridePage?: number,
    overrideFilters?: SearchFilterState,
  ) => {
    const activeFilters = overrideFilters || filters;
    const activePage = overridePage ?? 1;

    setQuery(searchQuery);
    setIsLoading(true);
    setError(null);

    // Map serializable options
    const options: SerializableSearchOptions = {
      contentType: activeFilters.contentType,
      author: activeFilters.author.trim() || undefined,
      minReputation: activeFilters.minReputation
        ? parseInt(activeFilters.minReputation, 10)
        : undefined,
      sortBy: activeFilters.sortBy,
      startDate: activeFilters.startDate || undefined,
      endDate: activeFilters.endDate || undefined,
      tags: activeFilters.tagsString
        ? activeFilters.tagsString
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,
      page: activePage,
      perPage: 15,
    };

    try {
      const res = await executeSearchAction(searchQuery, options);
      if (res.success) {
        const data = res as any;
        setResults({
          hits: data.hits ?? [],
          found: data.found ?? 0,
          page: data.page ?? 1,
          totalPages: data.totalPages ?? 0,
        });
        // Reload history to capture newly performed query
        loadHistory();
      } else {
        setError(res.error || "Failed to retrieve search results.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (contentType: SearchFilterState["contentType"]) => {
    const updatedFilters = { ...filters, contentType };
    setFilters(updatedFilters);

    if (query) {
      handleSearch(query, 1, updatedFilters);
    }
  };

  const handlePageChange = (page: number) => {
    handleSearch(query, page);
  };

  const handleFilterUpdate = (updates: Partial<SearchFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text">
          Advanced Search Engine
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl">
          Search the entire ecosystem with lightning speed, advanced filter
          queries, and autocompletion.
        </p>
      </div>

      {/* Main Search Panel */}
      <div className="space-y-4">
        <SearchBar initialQuery={query} onSearch={(q) => handleSearch(q)} />
        <SearchFilters
          filters={filters}
          onChange={handleFilterUpdate}
          onApply={() => handleSearch(query)}
        />
      </div>

      {/* Content Layout */}
      {query ? (
        <div className="space-y-6">
          {/* Results Header Tabs */}
          <div className="flex items-center justify-between border-b pb-1 overflow-x-auto gap-2">
            <div className="flex gap-2 shrink-0">
              {(
                [
                  "all",
                  "threads",
                  "posts",
                  "users",
                  "forums",
                  "badges",
                  "trophies",
                ] as const
              ).map((tab) => {
                const label =
                  tab === "all"
                    ? "All"
                    : tab.charAt(0).toUpperCase() + tab.slice(1);
                const isActive = filters.contentType === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    type="button"
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {results && !isLoading && (
              <span className="text-xs text-muted-foreground shrink-0 font-medium bg-muted px-2.5 py-1 rounded-full">
                Found {results.found} matches
              </span>
            )}
          </div>

          {/* Results Rendering */}
          {isLoading ? (
            <div className="space-y-4 py-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="p-5 border rounded-xl bg-card/20 space-y-3 animate-pulse"
                >
                  <div className="h-4 bg-muted rounded w-2/5" />
                  <div className="h-3 bg-muted rounded w-4/5" />
                  <div className="h-3 bg-muted rounded w-3/5" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-sm font-medium">
              ⚠️ Error: {error}
            </div>
          ) : results && results.hits.length > 0 ? (
            <div className="space-y-6">
              <SearchResults
                hits={results.hits}
                contentType={filters.contentType}
              />

              {/* Pagination */}
              {results.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-muted/50">
                  <button
                    onClick={() => handlePageChange(results.page - 1)}
                    disabled={results.page === 1}
                    type="button"
                    className="inline-flex items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    ← Previous
                  </button>
                  <span className="text-sm font-semibold text-muted-foreground">
                    Page {results.page} of {results.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(results.page + 1)}
                    disabled={results.page === results.totalPages}
                    type="button"
                    className="inline-flex items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          ) : (
            <SearchEmptyState query={query} />
          )}
        </div>
      ) : (
        /* Idle State - Show History and Trending */
        <div className="grid gap-6 md:grid-cols-2 pt-4">
          <TrendingSearches
            trending={trending}
            onSelectQuery={(q) => handleSearch(q)}
          />
          <SearchHistory
            history={history}
            onSelectQuery={(q) => handleSearch(q)}
            onClear={handleClearHistory}
          />
        </div>
      )}
    </div>
  );
}
