"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type AdminColumn } from "../data/data-table";
import { formatDateRelative } from "@/lib/utils";

export interface AuditRow {
  id: string;
  action: string;
  actorName: string | null;
  resource?: string | null;
  resourceId?: string | null;
  createdAt: Date | string;
}

function moduleOf(action: string): string {
  return action.split(/[:._]/)[0] ?? "system";
}

function severityOf(action: string): {
  label: string;
  variant: "secondary" | "warning" | "destructive";
} {
  const a = action.toLowerCase();
  if (/(ban|delete|remove|purge|revoke|critical|fail)/.test(a))
    return { label: "Critical", variant: "destructive" };
  if (/(update|edit|assign|change|warn|flag|suspend)/.test(a))
    return { label: "Notice", variant: "warning" };
  return { label: "Info", variant: "secondary" };
}

export function AuditViewer({ rows }: { rows: AuditRow[] }) {
  const [moduleFilter, setModuleFilter] = useState("all");

  const modules = useMemo(() => {
    const set = new Set(rows.map((r) => moduleOf(r.action)));
    return ["all", ...[...set].sort()];
  }, [rows]);

  const filtered = useMemo(
    () =>
      moduleFilter === "all"
        ? rows
        : rows.filter((r) => moduleOf(r.action) === moduleFilter),
    [rows, moduleFilter],
  );

  const columns: AdminColumn<AuditRow>[] = [
    {
      key: "action",
      header: "Action",
      sortable: true,
      sortValue: (r) => r.action,
      searchValue: (r) => r.action,
      cell: (r) => (
        <span className="font-mono text-xs font-medium">{r.action}</span>
      ),
    },
    {
      key: "severity",
      header: "Severity",
      cell: (r) => {
        const s = severityOf(r.action);
        return (
          <Badge variant={s.variant} size="sm">
            {s.label}
          </Badge>
        );
      },
    },
    {
      key: "actor",
      header: "Actor",
      sortable: true,
      sortValue: (r) => r.actorName ?? "",
      searchValue: (r) => r.actorName ?? "",
      cell: (r) =>
        r.actorName ?? <span className="text-muted-foreground">System</span>,
    },
    {
      key: "resource",
      header: "Resource",
      searchValue: (r) => `${r.resource ?? ""} ${r.resourceId ?? ""}`,
      cell: (r) =>
        r.resource ? (
          <span className="text-xs">
            {r.resource}
            {r.resourceId && (
              <span className="text-muted-foreground">
                {" "}
                · {r.resourceId.slice(0, 8)}
              </span>
            )}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "createdAt",
      header: "When",
      align: "right",
      sortable: true,
      sortValue: (r) => new Date(r.createdAt),
      exportValue: (r) => new Date(r.createdAt).toISOString(),
      cell: (r) => (
        <span className="text-xs text-muted-foreground">
          {formatDateRelative(r.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={filtered}
      getRowId={(r) => r.id}
      searchPlaceholder="Search actions, actors…"
      exportFileName="audit-log"
      initialSort={{ key: "createdAt", dir: "desc" }}
      pageSize={15}
      toolbar={
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="h-9 rounded-lg border bg-background px-2.5 text-sm outline-none focus:ring-1 focus:ring-ring"
        >
          {modules.map((m) => (
            <option key={m} value={m}>
              {m === "all" ? "All modules" : m}
            </option>
          ))}
        </select>
      }
      empty="No audit entries found."
    />
  );
}
