import { Ban, AlertTriangle, Lock, Shield, ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader, KpiCard } from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { getSecurityMetricsAction } from "@/modules/infrastructure/actions/ops";
import { IncidentTimeline } from "@/components/admin/security/security-dashboard-components";

export const metadata: Metadata = {
  title: "Security Center",
};

export const dynamic = "force-dynamic";

export default async function AdminSecurityPage() {
  const securityRes = await getSecurityMetricsAction();

  const stats =
    securityRes.success && securityRes.data
      ? securityRes.data
      : {
          activeBans: 0,
          failedLogins24h: 0,
          suspiciousLogins24h: 0,
          failedJobs24h: 0,
          securityEvents: [],
        };

  const threatLevel =
    stats.suspiciousLogins24h > 10
      ? "High"
      : stats.suspiciousLogins24h > 2
        ? "Medium"
        : "Low";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Center"
        description="Monitor threats, manage bans, and review security events"
        icon={<ShieldAlert className="h-5 w-5" />}
        actions={
          <Badge
            variant={
              threatLevel === "High"
                ? "destructive"
                : threatLevel === "Medium"
                  ? "warning"
                  : "success"
            }
            size="lg"
          >
            Threat Level: {threatLevel}
          </Badge>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Active Bans"
          value={stats.activeBans}
          icon={Ban}
          description="Currently restricted accounts"
          accent={stats.activeBans > 0 ? "danger" : "default"}
        />
        <KpiCard
          title="Suspicious Logins"
          value={stats.suspiciousLogins24h}
          icon={AlertTriangle}
          description="Last 24 hours"
          accent={stats.suspiciousLogins24h > 0 ? "warning" : "success"}
        />
        <KpiCard
          title="Failed Logins (24h)"
          value={stats.failedLogins24h}
          icon={Lock}
          description="Recent brute force risk"
          accent={stats.failedLogins24h > 10 ? "danger" : "info"}
        />
        <KpiCard
          title="Background Job Failures"
          value={stats.failedJobs24h}
          icon={Shield}
          description="DLQ alerts last 24h"
          accent={stats.failedJobs24h > 0 ? "danger" : "success"}
        />
      </div>

      <div className="grid gap-6">
        <IncidentTimeline events={stats.securityEvents as any} />
      </div>
    </div>
  );
}
