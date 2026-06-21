"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Star, Search, History, X } from "lucide-react";
import {
  ADMIN_NAV,
  ADMIN_NAV_FLAT,
  isNavItemActive,
  type AdminNavItem,
} from "../nav-config";
import { useAdminUI } from "@/stores/admin-ui-store";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  /** When provided, overrides the store collapse state (mobile drawer passes false). */
  collapsed?: boolean;
  /** Called after a nav link is clicked (mobile drawer uses it to close). */
  onNavigate?: () => void;
}

export function AdminSidebar({
  collapsed: collapsedProp,
  onNavigate,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const storeCollapsed = useAdminUI((s) => s.sidebarCollapsed);
  const collapsed = collapsedProp ?? storeCollapsed;

  const pinned = useAdminUI((s) => s.pinnedFavorites);
  const recent = useAdminUI((s) => s.recentPages);
  const toggleFavorite = useAdminUI((s) => s.toggleFavorite);

  const [filter, setFilter] = useState("");

  const sections = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return ADMIN_NAV;
    return ADMIN_NAV.map((section) => ({
      ...section,
      items: section.items.filter(
        (i) =>
          i.label.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          (i.keywords ?? []).some((k) => k.includes(q)),
      ),
    })).filter((s) => s.items.length > 0);
  }, [filter]);

  const favoriteItems = pinned
    .map((href) => ADMIN_NAV_FLAT.find((i) => i.href === href))
    .filter(Boolean) as AdminNavItem[];
  const recentItems = recent
    .map((href) => ADMIN_NAV_FLAT.find((i) => i.href === href))
    .filter(Boolean) as AdminNavItem[];

  function renderItem(item: AdminNavItem) {
    const Icon = item.icon;
    const active = isNavItemActive(item.href, pathname);
    const isFav = pinned.includes(item.href);

    const link = (
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group/item relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
          collapsed && "justify-center px-0",
          active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-foreground",
        )}
      >
        {active && !collapsed && (
          <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
        )}
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
        {!collapsed && (
          <button
            type="button"
            aria-label={isFav ? "Unpin" : "Pin to favorites"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(item.href);
            }}
            className={cn(
              "shrink-0 rounded p-0.5 opacity-0 transition-opacity hover:bg-accent group-hover/item:opacity-100",
              isFav && "opacity-100",
            )}
          >
            <Star
              className={cn(
                "h-3.5 w-3.5",
                isFav ? "fill-warning text-warning" : "text-muted-foreground",
              )}
            />
          </button>
        )}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.href} content={item.label} side="right">
          {link}
        </Tooltip>
      );
    }
    return <div key={item.href}>{link}</div>;
  }

  return (
    <div className="flex h-full flex-col">
      {/* Search filter */}
      {!collapsed && (
        <div className="px-3 pb-2 pt-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter…"
              className="h-8 w-full rounded-lg border bg-background pl-8 pr-7 text-xs outline-none focus:ring-1 focus:ring-ring"
            />
            {filter && (
              <button
                type="button"
                aria-label="Clear filter"
                onClick={() => setFilter("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      <nav
        aria-label="Admin navigation"
        className="flex-1 space-y-4 overflow-y-auto scrollbar-thin px-3 py-2"
      >
        {/* Favorites */}
        {!collapsed && !filter && favoriteItems.length > 0 && (
          <div className="space-y-0.5">
            <p className="flex items-center gap-1.5 px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Star className="h-3 w-3" /> Favorites
            </p>
            {favoriteItems.map(renderItem)}
          </div>
        )}

        {/* Recent */}
        {!collapsed && !filter && recentItems.length > 0 && (
          <div className="space-y-0.5">
            <p className="flex items-center gap-1.5 px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <History className="h-3 w-3" /> Recent
            </p>
            {recentItems.map(renderItem)}
          </div>
        )}

        {/* Sections */}
        {sections.map((section) => (
          <div key={section.label} className="space-y-0.5">
            {!collapsed && (
              <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.label}
              </p>
            )}
            {section.items.map(renderItem)}
          </div>
        ))}
      </nav>
    </div>
  );
}
