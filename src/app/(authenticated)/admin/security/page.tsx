import { Ban, AlertTriangle, Lock, Shield, ShieldAlert, Eye } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader, KpiCard, SectionCard } from "@/components/admin";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Security Center",
};

export default async function AdminSecurityPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Center"
        description="Monitor threats, manage bans, and review security events"
        icon={<ShieldAlert className="h-5 w-5" />}
        actions={
          <Badge variant="success" size="lg">
            Threat Level: Low
          </Badge>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Active Bans"
          value={0}
          icon={Ban}
          description="Currently banned users"
          accent="danger"
        />
        <KpiCard
          title="Security Alerts"
          value={0}
          icon={AlertTriangle}
          description="Active alerts"
          accent="warning"
        />
        <KpiCard
          title="Failed Logins (24h)"
          value={0}
          icon={Lock}
          description="Recent attempts"
          accent="info"
        />
        <KpiCard
          title="Blocked IPs"
          value={0}
          icon={Shield}
          description="IPs on blocklist"
          accent="primary"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Recent Security Events"
          description="Latest security activity across the platform"
          icon={<Eye className="h-4 w-4" />}
        >
          <div className="flex min-h-[200px] items-center justify-center">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                No recent security events
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Security events will appear here when detected
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Threat Overview"
          description="Current threat indicators and status"
          icon={<ShieldAlert className="h-4 w-4" />}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Brute Force Attempts</span>
                <Badge variant="success">Low</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                0 failed attempts in the last hour
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Spam Activity</span>
                <Badge variant="success">Low</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                No spam detected recently
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Suspicious IPs</span>
                <Badge variant="success">Low</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                0 IPs flagged for suspicious activity
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Account Takeovers</span>
                <Badge variant="success">Low</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                No attempted takeovers detected
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
