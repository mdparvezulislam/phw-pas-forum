"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Clock,
  CornerDownLeft,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import type React from "react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { overlay, scaleIn, staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ============================================
   TYPES
   ============================================ */

export interface SearchResult {
  id: string;
  icon: ReactNode;
  title: string;
  description?: string;
  group: string;
  href?: string;
  onClick?: () => void;
}

export interface GlobalSearchOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  results?: SearchResult[];
  onQueryChange?: (query: string) => void;
  placeholder?: string;
}

/* ============================================
   RECENT SEARCHES
   ============================================ */

const RECENT_KEY = "global-search-recent";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(q: string) {
  if (typeof window === "undefined") return;
  try {
    const recent = getRecentSearches().filter((r) => r !== q);
    recent.unshift(q);
    localStorage.setItem(
      RECENT_KEY,
      JSON.stringify(recent.slice(0, MAX_RECENT)),
    );
  } catch {
    // localStorage unavailable
  }
}

function clearAllRecentSearches() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {
    // localStorage unavailable
  }
}

/* ============================================
   EMPTY STATE SUGGESTIONS
   ============================================ */

const SUGGESTED_ACTIONS = [
  { label: "Browse Forums", icon: "💬", href: "/forums" },
  { label: "View Marketplace", icon: "🛒", href: "/marketplace" },
  { label: "Your Profile", icon: "👤", href: "/profile" },
  { label: "Notifications", icon: "🔔", href: "/notifications" },
];

/* ============================================
   KEYBOARD SHORTCUT BADGE
   ============================================ */

const isMac =
  typeof navigator !== "undefined" &&
  navigator.platform?.toUpperCase().includes("MAC");

/* ============================================
   COMPONENT
   ============================================ */

export function GlobalSearchOverlay({
  open,
  onOpenChange,
  results = [],
  onQueryChange,
  placeholder = "Search forums, members, threads...",
}: GlobalSearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load recent searches when overlay opens
  useEffect(() => {
    if (open) {
      setRecentSearches(getRecentSearches());
    }
  }, [open]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 60);
      setQuery("");
      setActiveIndex(-1);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Sync query to parent
  useEffect(() => {
    onQueryChange?.(query);
  }, [query, onQueryChange]);

  // Group results
  const grouped = useMemo(() => {
    const map = new Map<string, SearchResult[]>();
    for (const item of results) {
      const existing = map.get(item.group) ?? [];
      existing.push(item);
      map.set(item.group, existing);
    }
    return map;
  }, [results]);

  // Flat list for keyboard navigation
  const flatResults = useMemo(() => results, [results]);

  // Reset active index when results change
  const prevResultsLen = useRef(flatResults.length);
  if (prevResultsLen.current !== flatResults.length) {
    prevResultsLen.current = flatResults.length;
    setActiveIndex(-1);
  }

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex < 0) return;
    const el = listRef.current?.querySelector(
      `[data-result-index="${activeIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const close = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const selectResult = useCallback(
    (item: SearchResult) => {
      if (query.trim()) saveRecentSearch(query.trim());
      close();
      if (item.onClick) {
        item.onClick();
      } else if (item.href) {
        window.location.href = item.href;
      }
    },
    [query, close],
  );

  const selectRecent = useCallback(
    (term: string) => {
      setQuery(term);
      onQueryChange?.(term);
    },
    [onQueryChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev + 1 >= flatResults.length ? 0 : prev + 1,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev - 1 < 0 ? flatResults.length - 1 : prev - 1,
        );
      } else if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        selectResult(flatResults[activeIndex]);
      }
    },
    [close, flatResults, activeIndex, selectResult],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        saveRecentSearch(query.trim());
        close();
      }
    },
    [query, close],
  );

  const removeRecent = useCallback(
    (term: string, e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
      clearAllRecentSearches();
      setRecentSearches((prev) => prev.filter((r) => r !== term));
    },
    [],
  );

  const clearRecent = useCallback(() => {
    clearAllRecentSearches();
    setRecentSearches([]);
  }, []);

  const showEmpty = query.trim().length === 0;
  const hasResults = flatResults.length > 0;

  // Build a global flat index for each group
  let runningIndex = 0;

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] sm:pt-[18vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          {/* ── Backdrop ── */}
          <motion.div
            variants={overlay}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={close}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* ── Search Card ── */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "relative z-10 w-full max-w-xl mx-4",
              "rounded-2xl border border-white/[0.08] bg-[#1a1a1e]/95 shadow-2xl shadow-black/40",
              "ring-1 ring-white/[0.04]",
            )}
          >
            {/* ── Search Input ── */}
            <form
              onSubmit={handleSubmit}
              className="relative flex items-center"
            >
              <Search className="absolute left-4 h-5 w-5 text-neutral-500" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                role="combobox"
                aria-expanded={open}
                aria-controls="search-results"
                aria-activedescendant={
                  activeIndex >= 0 ? `search-result-${activeIndex}` : undefined
                }
                aria-label="Search"
                className={cn(
                  "w-full bg-transparent pl-12 pr-24 py-4",
                  "text-[15px] text-neutral-100 placeholder:text-neutral-500",
                  "focus:outline-none rounded-t-2xl",
                )}
              />
              <div className="absolute right-3 flex items-center gap-1.5">
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                    className="rounded-md p-1 text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.06] transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={close}
                  className={cn(
                    "flex items-center gap-0.5 rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-1",
                    "text-[11px] text-neutral-500 font-medium font-mono",
                    "hover:bg-white/[0.08] hover:text-neutral-400 transition-colors",
                  )}
                  aria-label="Close search"
                >
                  <span>{isMac ? "⌘" : "Ctrl"}</span>
                  <span>K</span>
                </button>
              </div>
            </form>

            {/* ── Divider ── */}
            <div className="h-px bg-white/[0.06]" />

            {/* ── Results Area ── */}
            <div
              ref={listRef}
              id="search-results"
              role="listbox"
              aria-label="Search results"
              className="max-h-[380px] overflow-y-auto overscroll-contain"
            >
              {/* ── Empty State / Recent ── */}
              {showEmpty && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="p-3"
                >
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between px-2 mb-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                          Recent
                        </span>
                        <button
                          type="button"
                          onClick={clearRecent}
                          className="text-[11px] text-neutral-600 hover:text-neutral-400 transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="space-y-0.5">
                        {recentSearches.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => selectRecent(term)}
                            className={cn(
                              "group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm",
                              "text-neutral-400 hover:bg-white/[0.05] hover:text-neutral-200 transition-colors",
                            )}
                          >
                            <Clock className="h-4 w-4 shrink-0 text-neutral-600 group-hover:text-neutral-500" />
                            <span className="flex-1 truncate">{term}</span>
                            <button
                              type="button"
                              onClick={(e) => removeRecent(term, e)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  removeRecent(term, e);
                                }
                              }}
                              className="text-neutral-700 group-hover:text-neutral-500 hover:text-neutral-300 transition-colors opacity-0 group-hover:opacity-100"
                              tabIndex={-1}
                              aria-label={`Remove ${term} from recent searches`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Actions */}
                  <div>
                    <span className="block px-2 mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                      Quick Links
                    </span>
                    <div className="space-y-0.5">
                      {SUGGESTED_ACTIONS.map((action) => (
                        <a
                          key={action.href}
                          href={action.href}
                          onClick={close}
                          className={cn(
                            "group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm",
                            "text-neutral-400 hover:bg-white/[0.05] hover:text-neutral-200 transition-colors",
                          )}
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-base group-hover:bg-white/[0.08] transition-colors">
                            {action.icon}
                          </span>
                          <span className="flex-1">{action.label}</span>
                          <CornerDownLeft className="h-3.5 w-3.5 text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Grouped Results ── */}
              {!showEmpty && hasResults && (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="p-3"
                >
                  {Array.from(grouped.entries()).map(([group, items]) => {
                    const groupStartIndex = runningIndex;
                    return (
                      <motion.div
                        key={group}
                        variants={staggerItem}
                        className="mb-3 last:mb-0"
                      >
                        {/* Group Header */}
                        <div className="flex items-center gap-2 px-2 mb-1.5">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                            {group}
                          </span>
                          <div className="flex-1 h-px bg-white/[0.04]" />
                          <span className="text-[10px] text-neutral-600 font-mono">
                            {items.length}
                          </span>
                        </div>

                        {/* Items */}
                        <div className="space-y-0.5">
                          {items.map((item, i) => {
                            const globalIndex = groupStartIndex + i;
                            const isActive = activeIndex === globalIndex;
                            runningIndex++;

                            return (
                              <button
                                key={item.id}
                                type="button"
                                data-result-index={globalIndex}
                                id={`search-result-${globalIndex}`}
                                role="option"
                                aria-selected={isActive}
                                onClick={() => selectResult(item)}
                                className={cn(
                                  "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-100",
                                  isActive
                                    ? "bg-white/[0.08] text-neutral-100"
                                    : "text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200",
                                )}
                              >
                                {/* Icon */}
                                <span
                                  className={cn(
                                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                                    isActive
                                      ? "bg-white/[0.1] text-neutral-200"
                                      : "bg-white/[0.04] text-neutral-500 group-hover:bg-white/[0.08] group-hover:text-neutral-400",
                                  )}
                                >
                                  {item.icon}
                                </span>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                  <span className="block text-sm font-medium truncate">
                                    {item.title}
                                  </span>
                                  {item.description && (
                                    <span className="block text-xs text-neutral-500 truncate mt-0.5">
                                      {item.description}
                                    </span>
                                  )}
                                </div>

                                {/* Arrow hint */}
                                <CornerDownLeft
                                  className={cn(
                                    "h-3.5 w-3.5 shrink-0 transition-all duration-100",
                                    isActive
                                      ? "text-neutral-400 opacity-100"
                                      : "text-neutral-700 opacity-0 group-hover:opacity-100",
                                  )}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {/* ── No Results ── */}
              {!showEmpty && !hasResults && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-12 px-6 text-center"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] mb-4">
                    <Search className="h-5 w-5 text-neutral-600" />
                  </div>
                  <p className="text-sm font-medium text-neutral-400 mb-1">
                    No results found
                  </p>
                  <p className="text-xs text-neutral-600 max-w-[240px]">
                    No matches for &ldquo;
                    <span className="text-neutral-400">{query}</span>
                    &rdquo;. Try a different search term.
                  </p>
                </motion.div>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="h-px bg-white/[0.06]" />
            <div className="flex items-center gap-3 px-4 py-2.5 text-[11px] text-neutral-600">
              <span className="flex items-center gap-1.5">
                <span className="flex items-center gap-0.5">
                  <ArrowUp className="h-3 w-3" />
                  <ArrowDown className="h-3 w-3" />
                </span>
                Navigate
              </span>
              <span className="flex items-center gap-1.5">
                <CornerDownLeft className="h-3 w-3" />
                Select
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="inline-flex h-4 items-center rounded border bg-white/[0.04] px-1 font-mono text-[10px]">
                  esc
                </kbd>
                Close
              </span>
              {query && (
                <span className="ml-auto flex items-center gap-1 text-neutral-700">
                  <Sparkles className="h-3 w-3" />
                  <span className="font-mono">
                    {flatResults.length} result
                    {flatResults.length !== 1 ? "s" : ""}
                  </span>
                </span>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
