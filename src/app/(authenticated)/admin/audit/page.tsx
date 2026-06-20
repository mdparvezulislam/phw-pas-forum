import type { Metadata } from "next";
import { formatDateRelative } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Audit Log",
};

export default async function AdminAuditPage() {

  const { getDatabase, schema } = await import("@/db");
  const { desc } = await import("drizzle-orm");
  const db = getDatabase();
  const logs = await db.query.auditLogs.findMany({
    orderBy: [desc(schema.auditLogs.createdAt)],
    limit: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-sm text-muted-foreground">Track all administrative actions</p>
      </div>

      <div className="rounded-lg border">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold">Recent Activity ({logs.length})</h2>
        </div>
        {logs.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">No audit log entries</p>
          </div>
        ) : (
          <div className="divide-y">
            {logs.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{log.action}</p>
                  {log.metadata && (
                    <p className="text-xs text-muted-foreground">
                      {typeof log.metadata === "string"
                        ? log.metadata
                        : JSON.stringify(log.metadata).slice(0, 100)}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDateRelative(log.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
