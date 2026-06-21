"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  MessageSquare,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { haptics } from "./haptics-vibrator";

interface MobileSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSearch({ isOpen, onClose }: MobileSearchProps) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "forums" | "marketplace" | "users"
  >("forums");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Esc key closure
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Load recent searches from LocalStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const cache = localStorage.getItem("bhw_recent_searches");
    if (cache) {
      try {
        setRecentSearches(JSON.parse(cache));
      } catch {
        // Clear corrupt cache
        localStorage.removeItem("bhw_recent_searches");
      }
    }
  }, [isOpen]);

  const handleSearchSubmit = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    haptics.success();

    // Cache to recent searches
    const updated = [
      searchQuery.trim(),
      ...recentSearches.filter((s) => s !== searchQuery.trim()),
    ].slice(0, 5);

    setRecentSearches(updated);
    localStorage.setItem("bhw_recent_searches", JSON.stringify(updated));

    // Redirect to main search path
    const searchUrl =
      activeTab === "marketplace"
        ? `/marketplace?q=${encodeURIComponent(searchQuery)}`
        : activeTab === "users"
          ? `/search?q=${encodeURIComponent(searchQuery)}&type=users`
          : `/search?q=${encodeURIComponent(searchQuery)}`;

    onClose();
    window.location.href = searchUrl;
  };

  const clearRecentSearch = (item: string) => {
    haptics.tap();
    const updated = recentSearches.filter((s) => s !== item);
    setRecentSearches(updated);
    localStorage.setItem("bhw_recent_searches", JSON.stringify(updated));
  };

  // Static trending topics
  const trendingTopics = [
    "SEO link building",
    "Instagram bots",
    "TikTok viral setup",
    "PWA design guide",
    "Auth.js v5",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="fixed inset-0 z-modal flex flex-col bg-background"
        >
          {/* Header Input bar */}
          <div className="flex h-14 items-center justify-between border-b px-4 gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputRef}
                autoFocus
                placeholder={`Search ${activeTab}...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleSearchSubmit(query)
                }
                className="pl-9 pr-8 h-10 w-full rounded-full border bg-muted/30 focus-visible:bg-background"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    haptics.tap();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-sm font-medium"
            >
              Cancel
            </Button>
          </div>

          {/* Search Category Tabs */}
          <div className="flex border-b px-2 py-1.5 bg-muted/10 shrink-0">
            {(["forums", "marketplace", "users"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  haptics.tap();
                  setActiveTab(tab);
                }}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors",
                  activeTab === tab
                    ? "bg-card border text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab === "forums" && <MessageSquare className="h-3.5 w-3.5" />}
                {tab === "marketplace" && (
                  <ShoppingBag className="h-3.5 w-3.5" />
                )}
                {tab === "users" && <User className="h-3.5 w-3.5" />}
                {tab}
              </button>
            ))}
          </div>

          {/* Results / Suggestion panels */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
            {/* Auto Suggestions when query is typed */}
            {query.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Suggestions
                </h4>
                <div className="rounded-xl border bg-card/50 overflow-hidden divide-y">
                  {[
                    query,
                    `${query} tutorial`,
                    `${query} service`,
                    `best ${query}`,
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearchSubmit(suggestion)}
                      className="flex w-full items-center justify-between px-4 py-3 text-sm text-foreground hover:bg-accent/50 text-left"
                    >
                      <span className="truncate font-medium">{suggestion}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Recent Searches
                      </h4>
                      <button
                        onClick={() => {
                          haptics.tap();
                          setRecentSearches([]);
                          localStorage.removeItem("bhw_recent_searches");
                        }}
                        className="text-xs text-muted-foreground hover:text-danger transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="space-y-2">
                      {recentSearches.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-xl border bg-card p-3"
                        >
                          <button
                            onClick={() => handleSearchSubmit(item)}
                            className="flex flex-1 items-center gap-2.5 text-sm text-foreground text-left font-medium truncate"
                          >
                            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="truncate">{item}</span>
                          </button>
                          <button
                            onClick={() => clearRecentSearch(item)}
                            className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Topics */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Trending Right Now
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {trendingTopics.map((topic, i) => (
                      <button
                        key={i}
                        onClick={() => handleSearchSubmit(topic)}
                        className="rounded-full border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-all hover:bg-accent/50"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
