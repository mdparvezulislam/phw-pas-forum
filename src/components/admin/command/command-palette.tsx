"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  Moon,
  Sun,
  Command as CommandIcon,
  Layout,
  Clock,
  Zap,
  Trash2,
  Search as SearchIcon,
  ArrowRight,
  Plus,
  Settings,
} from "lucide-react";
import { ADMIN_NAV } from "../nav-config";
import { useAdminUI } from "@/stores/admin-ui-store";
import { useTheme } from "@/providers/theme-provider";
import { overlay, scaleIn, staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const RECENT_SEARCHES_KEY = "bhw-admin-recent-searches";
const MAX_RECENT = 5;

const SHORTCUT_MAP: Record<string, string[]> = {
  "/admin": ["G", "O"],
  "/admin/analytics": ["G", "A"],
  "/admin/users": ["G", "U"],
  "/admin/categories": ["G", "C"],
  "/admin/forums": ["G", "F"],
  "/admin/threads": ["G", "T"],
  "/admin/reputation": ["G", "R"],
  "/admin/badges": ["G", "B"],
  "/admin/trophies": ["G", "K"],
  "/admin/search": ["G", "S"],
  "/admin/marketplace": ["G", "M"],
  "/admin/orders": ["G", "O", "D"],
  "/admin/disputes": ["G", "D"],
  "/admin/transactions": ["G", "P"],
  "/admin/memberships": ["G", "V"],
  "/admin/moderation": ["G", "Q"],
  "/admin/announcements": ["G", "N"],
  "/admin/support": ["G", "Z"],
  "/admin/security": ["G", "X"],
  "/admin/audit": ["G", "L"],
  "/admin/staff": ["G", "W"],
  "/admin/operations": ["G", "H"],
  "/admin/feature-flags": ["G", "I"],
  "/admin/settings": ["G", "E"],
};

const GROUP_ICONS: Record<string, LucideIcon> = {
  Navigation: Layout,
  Recent: Clock,
  Actions: Zap,
};

interface CommandEntry {
  id: string;
  label: string;
  hint?: string;
  shortcut?: string[];
  group: string;
  icon: LucideIcon;
  keywords: string[];
  run: () => void;
}

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  if (!query.trim()) return;
  try {
    const recent = getRecentSearches().filter((r) => r !== query);
    recent.unshift(query);
    localStorage.setItem(
      RECENT_SEARCHES_KEY,
      JSON.stringify(recent.slice(0, MAX_RECENT)),
    );
  } catch {
    // localStorage unavailable
  }
}

function clearRecentSearches() {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // ignore
  }
}

export function CommandPalette() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const open = useAdminUI((s) => s.commandOpen);
  const setOpen = useAdminUI((s) => s.setCommandOpen);
  const toggleCommand = useAdminUI((s) => s.toggleCommand);

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Global CMD/CTRL+K hotkey
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleCommand();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleCommand]);

  // Reset query/selection when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setRecentSearches(getRecentSearches());
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const entries = useMemo<CommandEntry[]>(() => {
    const nav: CommandEntry[] = ADMIN_NAV.flatMap((section) =>
      section.items.map((item) => ({
        id: `nav:${item.href}`,
        label: item.label,
        hint: section.label,
        shortcut: SHORTCUT_MAP[item.href],
        group: "Navigation",
        icon: item.icon,
        keywords: [
          item.label,
          section.label,
          item.description,
          ...(item.keywords ?? []),
        ].map((k) => k.toLowerCase()),
        run: () => {
          saveRecentSearch(query || item.label);
          router.push(item.href);
        },
      })),
    );

    const actions: CommandEntry[] = [
      {
        id: "action:theme",
        label:
          resolvedTheme === "dark"
            ? "Switch to light theme"
            : "Switch to dark theme",
        group: "Actions",
        icon: resolvedTheme === "dark" ? Sun : Moon,
        keywords: ["theme", "dark", "light", "appearance", "toggle"],
        run: () => {
          saveRecentSearch(query);
          setTheme(theme === "dark" ? "light" : "dark");
        },
      },
    ];

    return [...nav, ...actions];
  }, [router, theme, setTheme, resolvedTheme, query]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.keywords.some((k) => k.includes(q)) ||
        e.label.toLowerCase().includes(q),
    );
  }, [entries, query]);

  const showRecent = !query.trim() && recentSearches.length > 0;

  // Keep active index in range
  useEffect(() => {
    const total = showRecent
      ? results.length + recentSearches.length
      : results.length;
    setActive((a) => Math.min(a, Math.max(0, total - 1)));
  }, [results.length, recentSearches.length, showRecent]);

  function close() {
    setOpen(false);
  }

  const handleSelectRecent = useCallback((term: string) => {
    setQuery(term);
    saveRecentSearch(term);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const handleClearRecent = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  const totalItems = showRecent
    ? results.length + recentSearches.length
    : results.length;

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % Math.max(1, totalItems));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + totalItems) % Math.max(1, totalItems));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (showRecent && active < recentSearches.length) {
        handleSelectRecent(recentSearches[active]);
      } else {
        const idx = showRecent ? active - recentSearches.length : active;
        const entry = results[idx];
        if (entry) {
          entry.run();
          close();
        }
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  // Group results preserving order
  const grouped = useMemo(() => {
    const map = new Map<string, { entry: CommandEntry; index: number }[]>();
    results.forEach((entry, index) => {
      const list = map.get(entry.group) ?? [];
      list.push({ entry, index });
      map.set(entry.group, list);
    });
    return [...map.entries()];
  }, [results]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-modal flex items-start justify-center p-4 pt-[12vh]"
          variants={overlay}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* backdrop */}
          <button
            type="button"
            aria-label="Close command palette"
            onClick={close}
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-xl overflow-hidden rounded-xl border bg-card shadow-2xl"
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-2.5 border-b px-4">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages and actions…"
                className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="hidden items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
                ESC
              </kbd>
            </div>

            <div
              ref={listRef}
              className="max-h-[min(60vh,24rem)] overflow-y-auto scrollbar-thin p-2"
            >
              {/* Recent searches */}
              {showRecent && (
                <motion.div
                  className="mb-1"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Recent
                    </span>
                    <button
                      type="button"
                      onClick={handleClearRecent}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((term, i) => {
                    const isActive = i === active;
                    return (
                      <motion.button
                        key={`recent:${term}`}
                        type="button"
                        variants={staggerItem}
                        onClick={() => handleSelectRecent(term)}
                        onMouseMove={() => setActive(i)}
                        whileHover={{ scale: 1.01 }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground/80 hover:bg-accent/50",
                        )}
                      >
                        <SearchIcon className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                        <span className="flex-1 truncate">{term}</span>
                        {isActive && (
                          <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}

              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-3 py-10 text-center">
                  <div className="mb-3 rounded-full bg-muted/50 p-3">
                    <SearchIcon className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                  <p className="mb-1 text-sm font-medium text-foreground/80">
                    No results for "{query}"
                  </p>
                  <p className="mb-4 text-xs text-muted-foreground/60">
                    Try searching for a page, action, or feature
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {["Users", "Analytics", "Settings"].map((label) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          setQuery(label);
                          requestAnimationFrame(() =>
                            inputRef.current?.focus(),
                          );
                        }}
                        className="flex items-center gap-1.5 rounded-md border bg-muted/30 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground/80"
                      >
                        <ArrowRight className="h-3 w-3" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {grouped.map(([group, items]) => {
                    const GroupIcon = GROUP_ICONS[group] ?? Layout;
                    return (
                      <motion.div
                        key={group}
                        className="mb-1"
                        variants={staggerItem}
                      >
                        <span className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          <GroupIcon className="h-3 w-3" />
                          {group}
                        </span>
                        {items.map(({ entry, index }) => {
                          const Icon = entry.icon;
                          const adjustedIndex = showRecent
                            ? index + recentSearches.length
                            : index;
                          const isActive = adjustedIndex === active;
                          return (
                            <motion.button
                              key={entry.id}
                              type="button"
                              variants={staggerItem}
                              onClick={() => {
                                entry.run();
                                close();
                              }}
                              onMouseMove={() => setActive(adjustedIndex)}
                              whileHover={{ scale: 1.01 }}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                                isActive
                                  ? "bg-accent text-accent-foreground"
                                  : "text-foreground/80 hover:bg-accent/50",
                              )}
                            >
                              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                              <span className="flex-1 truncate">
                                {entry.label}
                              </span>
                              {entry.hint && (
                                <span className="text-xs text-muted-foreground">
                                  {entry.hint}
                                </span>
                              )}
                              {entry.shortcut && (
                                <span className="flex items-center gap-0.5">
                                  {entry.shortcut.map((key) => (
                                    <kbd
                                      key={key}
                                      className="rounded border bg-muted px-1 py-0.5 text-[10px] font-medium text-muted-foreground"
                                    >
                                      {key}
                                    </kbd>
                                  ))}
                                </span>
                              )}
                              {isActive && (
                                <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                            </motion.button>
                          );
                        })}
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>

            <div className="flex items-center justify-between border-t px-4 py-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CommandIcon className="h-3 w-3" /> Command Palette
              </span>
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <ArrowUp className="h-3 w-3" />
                  <ArrowDown className="h-3 w-3" /> navigate
                </span>
                <span className="flex items-center gap-1">
                  <CornerDownLeft className="h-3 w-3" /> select
                </span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
