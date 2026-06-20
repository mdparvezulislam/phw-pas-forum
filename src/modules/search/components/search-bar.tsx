"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSuggestionsAction } from "@/modules/search/actions/search";
import { Input } from "@/components/ui";

interface SearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ initialQuery = "", onSearch, placeholder = "Search forums, threads, members..." }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<{
    threads: any[];
    users: any[];
    forums: any[];
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initial query updates
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Debounced autocomplete suggestions fetching
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions(null);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await getSuggestionsAction(query);
        if (res.success && res.suggestions) {
          setSuggestions(res.suggestions);
          setActiveIndex(-1);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      onSearch(query.trim());
    }
  };

  // Keyboard navigation through suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || !suggestions) return;

    const flattenedList = [
      ...suggestions.threads.map(t => ({ type: "thread", data: t })),
      ...suggestions.users.map(u => ({ type: "user", data: u })),
      ...suggestions.forums.map(f => ({ type: "forum", data: f }))
    ];

    const totalCount = flattenedList.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1 >= totalCount ? 0 : prev + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 < 0 ? totalCount - 1 : prev - 1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const selected = flattenedList[activeIndex];
      navigateSuggestion(selected);
    }
  };

  const navigateSuggestion = (item: { type: string; data: any }) => {
    setIsOpen(false);
    if (item.type === "thread") {
      const catSlug = item.data.categorySlug ?? "general";
      const forSlug = item.data.forumSlug ?? "general";
      router.push(`/forums/${catSlug}/${forSlug}/${item.data.slug ?? item.data.id}`);
    } else if (item.type === "user") {
      router.push(`/profile/${item.data.username}`);
    } else if (item.type === "forum") {
      router.push(`/forums/forum-id/${item.data.id}`);
    }
  };

  const hasSuggestions = suggestions && (
    suggestions.threads.length > 0 ||
    suggestions.users.length > 0 ||
    suggestions.forums.length > 0
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 h-11 bg-card/60 border border-input rounded-lg shadow-sm focus-visible:ring-1 focus-visible:ring-ring text-base"
            autoComplete="off"
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none select-none">
            {isLoading ? (
              <span className="inline-block animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            ) : (
              "🔍"
            )}
          </div>
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-5 h-11 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* Autocomplete Dropdown List */}
      {isOpen && hasSuggestions && suggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border bg-card/95 backdrop-blur-xl shadow-lg max-h-[420px] overflow-y-auto divide-y divide-muted/50 animate-fade-in">
          {/* Threads */}
          {suggestions.threads.length > 0 && (
            <div className="p-2 space-y-1">
              <h5 className="px-3 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                📝 Threads
              </h5>
              {suggestions.threads.map((t, idx) => {
                const globalIdx = idx;
                const isActive = activeIndex === globalIdx;
                return (
                  <button
                    key={t.id}
                    onClick={() => navigateSuggestion({ type: "thread", data: t })}
                    type="button"
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex flex-col cursor-pointer ${
                      isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <span className="font-semibold truncate">{t.title}</span>
                    <span className="text-xs text-muted-foreground">In {t.forum} • By {t.author}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Members */}
          {suggestions.users.length > 0 && (
            <div className="p-2 space-y-1">
              <h5 className="px-3 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                👤 Members
              </h5>
              {suggestions.users.map((u, idx) => {
                const globalIdx = suggestions.threads.length + idx;
                const isActive = activeIndex === globalIdx;
                return (
                  <button
                    key={u.id}
                    onClick={() => navigateSuggestion({ type: "user", data: u })}
                    type="button"
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between cursor-pointer ${
                      isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">👤</span>
                      <span className="font-semibold">{u.displayName ?? u.username}</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/15">
                      ⭐ {u.reputation} Rep
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Forums */}
          {suggestions.forums.length > 0 && (
            <div className="p-2 space-y-1">
              <h5 className="px-3 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                📁 Forums
              </h5>
              {suggestions.forums.map((f, idx) => {
                const globalIdx = suggestions.threads.length + suggestions.users.length + idx;
                const isActive = activeIndex === globalIdx;
                return (
                  <button
                    key={f.id}
                    onClick={() => navigateSuggestion({ type: "forum", data: f })}
                    type="button"
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex flex-col cursor-pointer ${
                      isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <span className="font-semibold truncate">{f.title}</span>
                    {f.description && <span className="text-xs text-muted-foreground truncate">{f.description}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
