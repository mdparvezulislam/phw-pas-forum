import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { ScrollText } from "lucide-react";
import { getDatabase, schema } from "@/db";
import {
  PageHeader,
  KpiCard,
  SectionCard,
  AuditViewer,
  type AuditRow,
} from "@/components/admin";

export const metadata: Metadata = { title: "Audit Log" };

export default async function AdminAuditPage() {
  const db = getDatabase();

  const logs = await db
    .select({
      id: schema.auditLogs.id,
      action: schema.auditLogs.action,
      resource: schema.auditLogs.resource,
      resourceId: schema.auditLogs.resourceId,
      createdAt: schema.auditLogs.createdAt,
      actorName: schema.users.displayName,
      actorUsername: schema.users.username,
    })
    .from(schema.auditLogs)
    .leftJoin(schema.users, eq(schema.auditLogs.userId, schema.users.id))
    .orderBy(desc(schema.auditLogs.createdAt))
    .limit(200);

  const rows: AuditRow[] = logs.map((l) => ({
    id: l.id,
    action: l.action,
    actorName: l.actorName ?? l.actorUsername ?? null,
    resource: l.resource,
    resourceId: l.resourceId,
    createdAt: l.createdAt.toISOString(),
  }));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = logs.filter((l) => l.createdAt >= today).length;
  const actors = new Set(logs.map((l) => l.actorUsername).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="Every administrative and staff action, searchable and exportable."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          title="Entries"
          value={rows.length}
          icon={ScrollText}
          accent="primary"
          description="Most recent 200 shown"
        />
        <KpiCard title="Today" value={todayCount} accent="info" />
        <KpiCard title="Distinct Actors" value={actors} accent="success" />
      </div>

      <SectionCard flush>
        <div className="p-4 sm:p-5">
          <AuditViewer rows={rows} />
        </div>
      </SectionCard>
    </div>
  );
}
