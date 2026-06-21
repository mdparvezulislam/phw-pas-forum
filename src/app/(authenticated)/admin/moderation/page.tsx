import type { Metadata } from "next";
import { ShieldCheck, AlertTriangle, FileText, Gavel } from "lucide-react";
import { formatDateRelative } from "@/lib/utils";
import { adminModerationService } from "@/services/admin-moderation";
import {
  PageHeader,
  KpiCard,
  SectionCard,
  DataTable,
  type AdminColumn,
  type RowAction,
} from "@/components/admin";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Moderation Center",
};

interface QueueRow {
  id: string;
  type: "Report" | "Listing" | "Dispute";
  reason: string;
  status: string;
  createdAt: Date;
}

function normalizeStatus(raw: string) {
  return raw.charAt(0) + raw.slice(1).toLowerCase();
}

const statusVariant: Record<string, "warning" | "success" | "destructive" | "info" | "secondary"> = {
  pending: "warning",
  open: "warning",
  resolved: "success",
  closed: "secondary",
  escalated: "destructive",
  approved: "success",
  rejected: "destructive",
};

const typeBadge: Record<string, "warning" | "info" | "destructive"> = {
  Report: "destructive",
  Listing: "info",
  Dispute: "warning",
};

const columns: AdminColumn<QueueRow>[] = [
  {
    key: "type",
    header: "Type",
    sortable: true,
    sortValue: (r) => r.type,
    searchValue: (r) => r.type,
    cell: (r) => (
      <Badge variant={typeBadge[r.type] ?? "secondary"} size="sm">
        {r.type}
      </Badge>
    ),
  },
  {
    key: "reason",
    header: "Reason / Title",
    searchValue: (r) => r.reason,
    cell: (r) => (
      <span className="line-clamp-1 text-foreground">{r.reason}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    sortValue: (r) => r.status,
    searchValue: (r) => r.status,
    cell: (r) => (
      <Badge variant={statusVariant[r.status.toLowerCase()] ?? "secondary"} size="sm">
        {normalizeStatus(r.status)}
      </Badge>
    ),
  },
  {
    key: "date",
    header: "Date",
    sortable: true,
    sortValue: (r) => r.createdAt,
    cell: (r) => (
      <span className="text-muted-foreground">
        {formatDateRelative(r.createdAt)}
      </span>
    ),
  },
];

export default async function AdminModerationPage() {
  const queue = await adminModerationService.getUnifiedModerationQueue();
  const stats = await adminModerationService.getModerationStats();

  const rows: QueueRow[] = [
    ...queue.reports.map((r) => ({
      id: r.id,
      type: "Report" as const,
      reason: r.reason ?? "Report",
      status: r.status,
      createdAt: r.createdAt,
    })),
    ...queue.pendingSubmissions.map((s) => ({
      id: s.id,
      type: "Listing" as const,
      reason: "New Listing Submission",
      status: s.status,
      createdAt: s.submittedAt,
    })),
    ...queue.pendingDisputes.map((d) => ({
      id: d.id,
      type: "Dispute" as const,
      reason: "Open Dispute",
      status: d.status,
      createdAt: d.createdAt,
    })),
  ];

  const rowActions: RowAction<QueueRow>[] = [
    {
      label: "Review",
      href: (r) =>
        r.type === "Report"
          ? `/admin/moderation/reports/${r.id}`
          : r.type === "Listing"
            ? `/admin/moderation/listings/${r.id}`
            : `/admin/moderation/disputes/${r.id}`,
    },
    {
      label: "Dismiss",
      destructive: true,
      onClick: () => {},
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moderation Center"
        description="Review reports, moderate content, and manage disputes"
        icon={<ShieldCheck className="h-5 w-5" />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Open Reports"
          value={stats.openReports}
          icon={AlertTriangle}
          accent="danger"
        />
        <KpiCard
          title="Pending Listings"
          value={stats.pendingSubmissions}
          icon={FileText}
          accent="warning"
        />
        <KpiCard
          title="Open Disputes"
          value={stats.openDisputes}
          icon={Gavel}
          accent="info"
        />
        <KpiCard
          title="Pending Flags"
          value={stats.pendingFlags}
          icon={AlertTriangle}
          accent="warning"
        />
      </div>

      <SectionCard title="Unified Moderation Queue">
        <DataTable
          columns={columns}
          data={rows}
          getRowId={(r) => r.id}
          rowActions={() => rowActions}
          searchPlaceholder="Search queue…"
          empty={
            <div className="flex flex-col items-center gap-2 py-8">
              <ShieldCheck className="h-8 w-8 text-success" />
              <p className="text-sm font-medium">All clear</p>
              <p className="text-xs text-muted-foreground">
                No items in the moderation queue.
              </p>
            </div>
          }
        />
      </SectionCard>
    </div>
  );
}
