"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { DataTable, type AdminColumn } from "@/components/admin";
import { formatDateRelative } from "@/lib/utils";

export interface StaffItem {
  id: string;
  name: string;
  username: string | null;
  email: string | null;
  image: string | null;
  role: string;
  createdAt: string;
}

function roleVariant(role: string): BadgeProps["variant"] {
  if (role === "ADMIN" || role === "SUPER_ADMIN") return "admin";
  if (role.includes("MODERATOR")) return "moderator";
  if (role === "ANALYST" || role === "CONTENT_MANAGER") return "info";
  return "secondary";
}

export function StaffTable({ staff }: { staff: StaffItem[] }) {
  const columns: AdminColumn<StaffItem>[] = [
    {
      key: "member",
      header: "Member",
      sortable: true,
      sortValue: (s) => s.name,
      searchValue: (s) => `${s.name} ${s.username ?? ""} ${s.email ?? ""}`,
      cell: (s) => (
        <div className="flex items-center gap-3">
          <Avatar src={s.image} alt={s.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{s.name}</p>
            <p className="truncate text-xs text-muted-foreground">{s.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      sortValue: (s) => s.role,
      exportValue: (s) => s.role,
      cell: (s) => (
        <Badge variant={roleVariant(s.role)} size="sm">
          {s.role.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      align: "right",
      sortable: true,
      sortValue: (s) => new Date(s.createdAt),
      exportValue: (s) => new Date(s.createdAt).toISOString(),
      cell: (s) => (
        <span className="text-xs text-muted-foreground">
          {formatDateRelative(s.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={staff}
      getRowId={(s) => s.id}
      searchPlaceholder="Search staff…"
      exportFileName="staff"
      empty="No staff members."
    />
  );
}
