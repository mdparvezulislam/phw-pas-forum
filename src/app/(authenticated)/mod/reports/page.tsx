import type { Metadata } from "next";
import { getOpenReports, getReportCount } from "@/services/post";
import { requireRole } from "@/modules/auth/guards";
import { RoleName } from "@/types/rbac";
import { formatDateRelative } from "@/lib/utils";
import { ReportActions } from "./report-actions";

export const metadata: Metadata = {
  title: "Moderator - Post Reports",
};

export default async function ModReportsPage() {
  await requireRole(RoleName.MODERATOR);

  const reports = await getOpenReports(100);
  const reportCount = await getReportCount();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Post Reports</h1>
        <p className="text-sm text-muted-foreground">
          {reportCount} open report{reportCount !== 1 ? "s" : ""} awaiting review.
        </p>
      </div>

      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="rounded-lg border bg-muted/30 p-8 text-center">
            <p className="text-muted-foreground">
              No open reports. Great job moderating!
            </p>
          </div>
        ) : (
          reports.map((report: any) => (
            <div
              key={report.id}
              className="rounded-lg border bg-card"
            >
              <div className="flex items-center justify-between border-b bg-muted/20 px-4 py-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                    {report.reason}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    reported by {report.reporter.displayName ?? report.reporter.username}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDateRelative(report.createdAt)}
                </span>
              </div>

              <div className="p-4">
                <div className="mb-3">
                  <div className="text-xs text-muted-foreground">
                    Post #{report.post.postNumber} by {report.post.author.displayName ?? report.post.author.username}
                    {" "}in {report.post.thread.title}
                  </div>
                  <div className="mt-1 rounded border bg-muted/30 p-3">
                    <p className="whitespace-pre-wrap text-sm">{report.post.content}</p>
                  </div>
                </div>

                {report.description && (
                  <div className="mb-3">
                    <div className="text-xs font-medium text-muted-foreground">
                      Reporter's description:
                    </div>
                    <p className="mt-1 text-sm">{report.description}</p>
                  </div>
                )}

                <ReportActions reportId={report.id} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
