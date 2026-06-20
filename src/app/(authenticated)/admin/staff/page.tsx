import type { Metadata } from "next";
import { requirePermission, requireRole } from "@/modules/auth/guards";
import { Permission, RoleName } from "@/types/rbac";
import { adminStaffService } from "@/services/admin-staff";

export const metadata: Metadata = {
  title: "Staff Management",
};

export default async function AdminStaffPage() {
  await requireRole(RoleName.ADMIN);
  await requirePermission(Permission.STAFF_ACCESS);

  const staff = await adminStaffService.getStaffMembers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <p className="text-sm text-muted-foreground">Manage staff members and their roles</p>
      </div>

      <div className="rounded-lg border">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold">Staff Members ({staff.length})</h2>
        </div>
        {staff.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">No staff members</p>
          </div>
        ) : (
          <div className="divide-y">
            {staff.map((member: any) => (
              <div key={member.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {member.name?.[0] ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.name ?? "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
