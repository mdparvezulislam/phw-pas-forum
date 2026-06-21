"use client";

import { useState, useTransition } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  type AdminColumn,
  type RowAction,
} from "@/components/admin";
import { formatDateRelative } from "@/lib/utils";
import { updateUserRoleAction } from "./actions";

export interface AdminUserItem {
  id: string;
  username: string | null;
  displayName: string | null;
  email: string | null;
  image: string | null;
  isBanned: boolean;
  createdAt: string;
  role: { id: string; name: string } | null;
}

interface UsersTableProps {
  users: AdminUserItem[];
  roles: { id: string; name: string }[];
}

function RoleSelect({
  user,
  roles,
}: {
  user: AdminUserItem;
  roles: { id: string; name: string }[];
}) {
  const [selected, setSelected] = useState(user.role?.id ?? "");
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const roleId = e.target.value;
    setSelected(roleId);
    setError(false);
    startTransition(async () => {
      try {
        await updateUserRoleAction(user.id, roleId);
      } catch {
        setSelected(user.role?.id ?? "");
        setError(true);
      }
    });
  }

  return (
    <select
      value={selected}
      onChange={onChange}
      disabled={pending}
      onClick={(e) => e.stopPropagation()}
      className={`h-8 rounded-lg border bg-background px-2 text-xs font-medium outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 ${
        error ? "border-danger" : ""
      }`}
    >
      {roles.map((role) => (
        <option key={role.id} value={role.id}>
          {role.name.replace(/_/g, " ")}
        </option>
      ))}
    </select>
  );
}

export function UsersTable({ users, roles }: UsersTableProps) {
  const columns: AdminColumn<AdminUserItem>[] = [
    {
      key: "user",
      header: "User",
      sortable: true,
      sortValue: (u) => u.displayName ?? u.username ?? "",
      searchValue: (u) =>
        `${u.displayName ?? ""} ${u.username ?? ""} ${u.email ?? ""}`,
      cell: (u) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={u.image}
            alt={u.displayName ?? u.username ?? "?"}
            size="sm"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {u.displayName ?? u.username ?? "Unknown"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {u.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortValue: (u) => u.role?.name ?? "",
      exportValue: (u) => u.role?.name ?? "",
      cell: (u) => <RoleSelect user={u} roles={roles} />,
    },
    {
      key: "status",
      header: "Status",
      sortValue: (u) => (u.isBanned ? 1 : 0),
      exportValue: (u) => (u.isBanned ? "Banned" : "Active"),
      cell: (u) =>
        u.isBanned ? (
          <Badge variant="destructive" size="sm">
            Banned
          </Badge>
        ) : (
          <Badge variant="success" size="sm">
            Active
          </Badge>
        ),
    },
    {
      key: "joined",
      header: "Joined",
      align: "right",
      sortable: true,
      sortValue: (u) => new Date(u.createdAt),
      exportValue: (u) => new Date(u.createdAt).toISOString(),
      cell: (u) => (
        <span className="text-xs text-muted-foreground">
          {formatDateRelative(u.createdAt)}
        </span>
      ),
    },
  ];

  const rowActions = (u: AdminUserItem): RowAction<AdminUserItem>[] => [
    ...(u.username
      ? [
          {
            label: "View profile",
            href: () => `/profile/${u.username}`,
          } as RowAction<AdminUserItem>,
        ]
      : []),
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      getRowId={(u) => u.id}
      searchPlaceholder="Search users by name or email…"
      exportFileName="users"
      pageSize={15}
      rowActions={rowActions}
      empty="No users found."
    />
  );
}
