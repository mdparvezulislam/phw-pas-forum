import type { Metadata } from "next";
import { requirePermission, requireRole } from "@/modules/auth/guards";
import { Permission, RoleName } from "@/types/rbac";
import { Shield, AlertTriangle, Ban, Lock } from "lucide-react";
import { StatsCard } from "@/components/admin/stats-card";

export const metadata: Metadata = {
  title: "Security Center",
};

export default async function AdminSecurityPage() {
  await requireRole(RoleName.ADMIN);
  await requirePermission(Permission.ADMIN_SETTINGS);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Security Center</h1>
        <p className="text-sm text-muted-foreground">Monitor security events and manage bans</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Active Bans" value={0} icon={Ban} description="Currently banned users" />
        <StatsCard title="Security Alerts" value={0} icon={AlertTriangle} description="Active alerts" />
        <StatsCard title="Failed Logins (24h)" value={0} icon={Lock} description="Recent attempts" />
        <StatsCard title="Flagged Content" value={0} icon={Shield} description="Awaiting review" />
      </div>

      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-lg font-semibold">Recent Security Events</h2>
        <div className="flex min-h-[200px] items-center justify-center">
          <p className="text-sm text-muted-foreground">No recent security events</p>
        </div>
      </div>
    </div>
  );
}
