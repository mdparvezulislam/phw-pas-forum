"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
} from "lucide-react";
import { ADMIN_NAV } from "../nav-config";
import { useAdminUI } from "@/stores/admin-ui-store";
import { useTheme } from "@/providers/theme-provider";
import { overlay, scaleIn } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface CommandEntry {
  id: string;
  label: string;
  hint?: string;
  group: string;
  icon: LucideIcon;
  keywords: string[];
  run: () => void;
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
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const entries = useMemo<CommandEntry[]>(() => {
    const nav: CommandEntry[] = ADMIN_NAV.flatMap((section) =>
      section.items.map((item) => ({
        id: `nav:${item.href}`,
        label: item.label,
        hint: section.label,
        group: "Navigation",
        icon: item.icon,
        keywords: [
          item.label,
          section.label,
          item.description,
          ...(item.keywords ?? []),
        ].map((k) => k.toLowerCase()),
        run: () => router.push(item.href),
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
        run: () => setTheme(theme === "dark" ? "light" : "dark"),
      },
    ];

    return [...nav, ...actions];
  }, [router, theme, setTheme, resolvedTheme]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.keywords.some((k) => k.includes(q)) ||
        e.label.toLowerCase().includes(q),
    );
  }, [entries, query]);

  // Keep active index in range
  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, results.length - 1)));
  }, [results.length]);

  function close() {
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % Math.max(1, results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const entry = results[active];
      if (entry) {
        entry.run();
        close();
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
              {results.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No results for “{query}”
                </p>
              ) : (
                grouped.map(([group, items]) => (
                  <div key={group} className="mb-1">
                    <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {group}
                    </p>
                    {items.map(({ entry, index }) => {
                      const Icon = entry.icon;
                      const isActive = index === active;
                      return (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => {
                            entry.run();
                            close();
                          }}
                          onMouseMove={() => setActive(index)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                            isActive
                              ? "bg-accent text-accent-foreground"
                              : "text-foreground/80 hover:bg-accent/50",
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="flex-1 truncate">{entry.label}</span>
                          {entry.hint && (
                            <span className="text-xs text-muted-foreground">
                              {entry.hint}
                            </span>
                          )}
                          {isActive && (
                            <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
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
