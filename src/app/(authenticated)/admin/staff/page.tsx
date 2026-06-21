import type { Metadata } from "next";
import { UsersRound, Shield, ShieldCheck } from "lucide-react";
import { adminStaffService } from "@/services/admin-staff";
import {
  PageHeader,
  KpiCard,
  SectionCard,
  PermissionMatrix,
} from "@/components/admin";
import { StaffTable, type StaffItem } from "./staff-table";

export const metadata: Metadata = { title: "Staff Management" };

export default async function AdminStaffPage() {
  const staff = (await adminStaffService.getStaffMembers()) as Array<{
    id: string;
    username: string | null;
    displayName: string | null;
    email: string | null;
    image: string | null;
    createdAt: Date;
    role: { name: string } | null;
  }>;

  const items: StaffItem[] = staff.map((s) => ({
    id: s.id,
    name: s.displayName ?? s.username ?? "Unknown",
    username: s.username,
    email: s.email,
    image: s.image,
    role: s.role?.name ?? "STAFF",
    createdAt: s.createdAt.toISOString(),
  }));

  const admins = items.filter((s) => s.role.includes("ADMIN")).length;
  const mods = items.filter((s) => s.role.includes("MODERATOR")).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Management"
        description="Manage staff members, roles and permission coverage."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          title="Staff Members"
          value={items.length}
          icon={UsersRound}
          accent="primary"
        />
        <KpiCard title="Admins" value={admins} icon={Shield} accent="admin" />
        <KpiCard
          title="Moderators"
          value={mods}
          icon={ShieldCheck}
          accent="moderator"
        />
      </div>

      <SectionCard title="Team" description="Everyone with a staff role">
        <StaffTable staff={items} />
      </SectionCard>

      <SectionCard
        title="Permission Matrix"
        description="Coverage of permissions by role across each module"
        flush
      >
        <PermissionMatrix />
      </SectionCard>
    </div>
  );
}
