"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui";
import { getSuggestionsAction } from "@/modules/search/actions/search";

export function GlobalSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{
    threads: any[];
    users: any[];
    forums: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Listen for CMD+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Autofocus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSuggestions(null);
    }
  }, [isOpen]);

  // Debounced suggestions fetching
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await getSuggestionsAction(query);
        if (res.success && res.suggestions) {
          setSuggestions(res.suggestions);
          setActiveIndex(-1);
        }
      } catch (err) {
        console.error("Suggestions error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!suggestions) return;
    const items = [
      ...suggestions.threads.map((t) => ({ type: "thread", data: t })),
      ...suggestions.users.map((u) => ({ type: "user", data: u })),
      ...suggestions.forums.map((f) => ({ type: "forum", data: f })),
    ];

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1 >= items.length ? 0 : prev + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 < 0 ? items.length - 1 : prev - 1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      navigateSuggestion(items[activeIndex]);
    }
  };

  const navigateSuggestion = (item: { type: string; data: any }) => {
    setIsOpen(false);
    if (item.type === "thread") {
      const catSlug = item.data.categorySlug ?? "general";
      const forSlug = item.data.forumSlug ?? "general";
      router.push(
        `/forums/${catSlug}/${forSlug}/${item.data.slug ?? item.data.id}`,
      );
    } else if (item.type === "user") {
      router.push(`/profile/${item.data.username}`);
    } else if (item.type === "forum") {
      router.push(`/forums/forum-id/${item.data.id}`);
    }
  };

  return (
    <>
      {/* Navbar Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className="flex items-center gap-2 text-xs text-muted-foreground border bg-muted/40 hover:bg-muted px-3 py-1.5 rounded-lg transition-all focus:outline-none cursor-pointer"
      >
        <span>🔍 Search...</span>
        <kbd className="pointer-events-none select-none rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto">
          ⌘K
        </kbd>
      </button>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-lg overflow-hidden rounded-xl border bg-card shadow-2xl mx-4"
            >
              {/* Input Row */}
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex items-center border-b p-3"
              >
                <span className="text-muted-foreground mr-2.5 pl-1.5">🔍</span>
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search forums, posts, badges..."
                  className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base h-10 p-0 shadow-none bg-transparent"
                  autoComplete="off"
                />
                {isLoading && (
                  <span className="absolute right-4 animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                )}
              </form>

              {/* Suggestions */}
              {suggestions && (
                <div className="max-h-[350px] overflow-y-auto p-2 divide-y divide-muted/40">
                  {suggestions.threads.length === 0 &&
                    suggestions.users.length === 0 &&
                    suggestions.forums.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        No suggestions found.
                      </p>
                    )}

                  {/* Threads */}
                  {suggestions.threads.length > 0 && (
                    <div className="py-2 space-y-1">
                      <span className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Threads
                      </span>
                      {suggestions.threads.map((t, idx) => {
                        const isSelected = activeIndex === idx;
                        return (
                          <button
                            key={t.id}
                            onClick={() =>
                              navigateSuggestion({ type: "thread", data: t })
                            }
                            type="button"
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex flex-col cursor-pointer ${
                              isSelected
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-muted/50 text-foreground"
                            }`}
                          >
                            <span className="font-semibold truncate">
                              {t.title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              In {t.forum} • By {t.author}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Users */}
                  {suggestions.users.length > 0 && (
                    <div className="py-2 space-y-1">
                      <span className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Members
                      </span>
                      {suggestions.users.map((u, idx) => {
                        const isSelected =
                          activeIndex === suggestions.threads.length + idx;
                        return (
                          <button
                            key={u.id}
                            onClick={() =>
                              navigateSuggestion({ type: "user", data: u })
                            }
                            type="button"
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-muted/50 text-foreground"
                            }`}
                          >
                            <span className="font-semibold">
                              {u.displayName ?? u.username}
                            </span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">
                              ⭐ {u.reputation} Rep
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Forums */}
                  {suggestions.forums.length > 0 && (
                    <div className="py-2 space-y-1">
                      <span className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Forums
                      </span>
                      {suggestions.forums.map((f, idx) => {
                        const isSelected =
                          activeIndex ===
                          suggestions.threads.length +
                            suggestions.users.length +
                            idx;
                        return (
                          <button
                            key={f.id}
                            onClick={() =>
                              navigateSuggestion({ type: "forum", data: f })
                            }
                            type="button"
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex flex-col cursor-pointer ${
                              isSelected
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-muted/50 text-foreground"
                            }`}
                          >
                            <span className="font-semibold">{f.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Instructions Bar */}
              <div className="flex items-center gap-4 border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
                <span>↑↓ to navigate</span>
                <span>↵ to select</span>
                <span>esc to close</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
