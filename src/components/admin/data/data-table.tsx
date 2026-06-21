"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Download,
  MoreHorizontal,
  Search,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { dropdown } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface AdminColumn<T> {
  key: string;
  header: string;
  cell: (item: T) => ReactNode;
  /** Value used for sorting (and CSV export if exportValue is absent). */
  sortValue?: (item: T) => string | number | Date | null | undefined;
  /** Plain text used for the global search filter. */
  searchValue?: (item: T) => string;
  /** Plain value used for CSV export. */
  exportValue?: (item: T) => string | number;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  className?: string;
  headerClassName?: string;
}

export interface BulkAction<T> {
  label: string;
  icon?: LucideIcon;
  onClick: (selected: T[]) => void;
  destructive?: boolean;
}

export interface RowAction<T> {
  label: string;
  icon?: LucideIcon;
  onClick?: (item: T) => void;
  href?: (item: T) => string;
  destructive?: boolean;
}

interface DataTableProps<T> {
  columns: AdminColumn<T>[];
  data: T[];
  getRowId: (item: T) => string;
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
  selectable?: boolean;
  bulkActions?: BulkAction<T>[];
  rowActions?: (item: T) => RowAction<T>[];
  exportFileName?: string;
  /** Extra filter controls rendered in the toolbar. */
  toolbar?: ReactNode;
  empty?: ReactNode;
  onRowClick?: (item: T) => void;
  initialSort?: { key: string; dir: "asc" | "desc" };
  className?: string;
}

type SortState = { key: string; dir: "asc" | "desc" } | null;

const alignClass = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const;

export function DataTable<T>({
  columns,
  data,
  getRowId,
  searchable = true,
  searchPlaceholder = "Search…",
  pageSize = 10,
  selectable = false,
  bulkActions = [],
  rowActions,
  exportFileName,
  toolbar,
  empty,
  onRowClick,
  initialSort,
  className,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState>(initialSort ?? null);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // ── Filter ──
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((item) =>
      columns.some((col) => {
        const v = col.searchValue
          ? col.searchValue(item)
          : col.sortValue
            ? String(col.sortValue(item) ?? "")
            : "";
        return v.toLowerCase().includes(q);
      }),
    );
  }, [data, query, columns]);

  // ── Sort ──
  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return filtered;
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = col.sortValue?.(a);
      const bv = col.sortValue?.(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av instanceof Date && bv instanceof Date)
        return (av.getTime() - bv.getTime()) * factor;
      if (typeof av === "number" && typeof bv === "number")
        return (av - bv) * factor;
      return String(av).localeCompare(String(bv)) * factor;
    });
  }, [filtered, sort, columns]);

  // ── Paginate ──
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const pageIds = pageRows.map(getRowId);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const somePageSelected = pageIds.some((id) => selected.has(id));

  function toggleAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        for (const id of pageIds) next.delete(id);
      } else {
        for (const id of pageIds) next.add(id);
      }
      return next;
    });
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const selectedItems = useMemo(
    () => data.filter((d) => selected.has(getRowId(d))),
    [data, selected, getRowId],
  );

  function handleSort(col: AdminColumn<T>) {
    if (!col.sortable || !col.sortValue) return;
    setSort((prev) => {
      if (prev?.key !== col.key) return { key: col.key, dir: "asc" };
      if (prev.dir === "asc") return { key: col.key, dir: "desc" };
      return null;
    });
  }

  function exportCsv() {
    const header = columns.map((c) => csvCell(c.header));
    const rows = sorted.map((item) =>
      columns
        .map((c) => {
          const v = c.exportValue
            ? c.exportValue(item)
            : c.sortValue
              ? c.sortValue(item)
              : c.searchValue
                ? c.searchValue(item)
                : "";
          return csvCell(v == null ? "" : String(v));
        })
        .join(","),
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportFileName ?? "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const colSpan = columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Toolbar */}
      {(searchable || toolbar || exportFileName) && (
        <div className="flex flex-wrap items-center gap-2">
          {searchable && (
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(0);
                }}
                placeholder={searchPlaceholder}
                className="h-9 w-full rounded-lg border bg-background pl-8 pr-8 text-sm outline-none focus:ring-1 focus:ring-ring"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          {toolbar}
          {exportFileName && (
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border bg-background px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Download className="h-4 w-4" /> Export
            </button>
          )}
        </div>
      )}

      {/* Bulk action bar */}
      <AnimatePresence>
        {selectable && selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex flex-wrap items-center gap-2 rounded-lg border bg-accent/40 px-3 py-2"
          >
            <span className="text-sm font-medium">
              {selected.size} selected
            </span>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              Clear
            </button>
            <div className="flex-1" />
            {bulkActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => action.onClick(selectedItems)}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold",
                  action.destructive
                    ? "bg-danger/10 text-danger hover:bg-danger/20"
                    : "bg-background hover:bg-accent",
                )}
              >
                {action.icon && <action.icon className="h-3.5 w-3.5" />}
                {action.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-raised">
            <tr className="border-b bg-muted/50 backdrop-blur">
              {selectable && (
                <th className="w-10 px-3 py-2.5">
                  <Checkbox
                    checked={allPageSelected}
                    indeterminate={!allPageSelected && somePageSelected}
                    onCheckedChange={toggleAllOnPage}
                    aria-label="Select all on page"
                  />
                </th>
              )}
              {columns.map((col) => {
                const active = sort?.key === col.key;
                return (
                  <th
                    key={col.key}
                    className={cn(
                      "px-4 py-2.5 font-medium text-muted-foreground",
                      alignClass[col.align ?? "left"],
                      col.sortable && "cursor-pointer select-none hover:text-foreground",
                      col.headerClassName,
                    )}
                    onClick={() => handleSort(col)}
                  >
                    <span
                      className={cn(
                        "inline-flex items-center gap-1",
                        col.align === "right" && "flex-row-reverse",
                      )}
                    >
                      {col.header}
                      {col.sortable &&
                        (active ? (
                          sort?.dir === "asc" ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        ))}
                    </span>
                  </th>
                );
              })}
              {rowActions && <th className="w-10 px-3 py-2.5" />}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="px-4 py-10">
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    {empty ?? "No results found."}
                  </div>
                </td>
              </tr>
            ) : (
              pageRows.map((item) => {
                const id = getRowId(item);
                const isSelected = selected.has(id);
                return (
                  <tr
                    key={id}
                    onClick={onRowClick ? () => onRowClick(item) : undefined}
                    className={cn(
                      "border-b transition-colors last:border-0",
                      isSelected ? "bg-primary/5" : "hover:bg-muted/40",
                      onRowClick && "cursor-pointer",
                    )}
                  >
                    {selectable && (
                      <td
                        className="px-3 py-2.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleRow(id)}
                          aria-label="Select row"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "px-4 py-2.5 align-middle",
                          alignClass[col.align ?? "left"],
                          col.className,
                        )}
                      >
                        {col.cell(item)}
                      </td>
                    ))}
                    {rowActions && (
                      <td
                        className="px-3 py-2.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <RowActionMenu actions={rowActions(item)} item={item} />
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {sorted.length > pageSize && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            {safePage * pageSize + 1}–
            {Math.min((safePage + 1) * pageSize, sorted.length)} of{" "}
            {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous page"
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-background hover:bg-accent disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-xs text-muted-foreground">
              Page {safePage + 1} of {pageCount}
            </span>
            <button
              type="button"
              aria-label="Next page"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-background hover:bg-accent disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function RowActionMenu<T>({
  actions,
  item,
}: {
  actions: RowAction<T>[];
  item: T;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  if (actions.length === 0) return null;

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        type="button"
        aria-label="Row actions"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        onBlur={() => requestAnimationFrame(() => setOpen(false))}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            variants={dropdown}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 top-9 z-dropdown w-44 overflow-hidden rounded-lg border bg-card p-1 shadow-lg"
          >
            {actions.map((action) => {
              const className = cn(
                "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm",
                action.destructive
                  ? "text-danger hover:bg-danger/10"
                  : "text-foreground/80 hover:bg-accent hover:text-foreground",
              );
              if (action.href) {
                return (
                  <Link
                    key={action.label}
                    href={action.href(item)}
                    className={className}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {action.icon && <action.icon className="h-4 w-4" />}
                    {action.label}
                  </Link>
                );
              }
              return (
                <button
                  key={action.label}
                  type="button"
                  className={className}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    action.onClick?.(item);
                    setOpen(false);
                  }}
                >
                  {action.icon && <action.icon className="h-4 w-4" />}
                  {action.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}
