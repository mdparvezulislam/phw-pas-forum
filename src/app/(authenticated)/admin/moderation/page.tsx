import type { Metadata } from "next";
import { requireRole } from "@/modules/auth/guards";
import { RoleName } from "@/types/rbac";
import { adminModerationService } from "@/services/admin-moderation";
import { formatDateRelative } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Moderation Center",
};

export default async function AdminModerationPage() {
  await requireRole(RoleName.ADMIN);

  const queue = await adminModerationService.getUnifiedModerationQueue();
  const stats = await adminModerationService.getModerationStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Moderation Center</h1>
        <p className="text-sm text-muted-foreground">Review reports and moderate content</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Open Reports</p>
          <p className="text-2xl font-bold">{stats.openReports}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Pending Submissions</p>
          <p className="text-2xl font-bold">{stats.pendingSubmissions}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Open Disputes</p>
          <p className="text-2xl font-bold">{stats.openDisputes}</p>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold">Moderation Queue</h2>
        </div>
        {queue.reports.length === 0 && queue.pendingSubmissions.length === 0 && queue.pendingDisputes.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">No items in queue</p>
          </div>
        ) : (
          <div className="divide-y">
            {queue.reports.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.reason ?? "Report"}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateRelative(item.createdAt)} &middot; {item.status}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">Report</span>
              </div>
            ))}
            {queue.pendingSubmissions.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">New Listing Submission</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateRelative(item.submittedAt)}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">Listing</span>
              </div>
            ))}
            {queue.pendingDisputes.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">Open Dispute</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateRelative(item.createdAt)}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">Dispute</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
