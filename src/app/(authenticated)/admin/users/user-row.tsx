"use client";

import { useState, useTransition } from "react";
import { updateUserRoleAction } from "./actions";

interface UserRowProps {
  user: {
    id: string;
    username: string | null;
    displayName: string | null;
    email: string | null;
    isBanned: boolean;
    createdAt: Date;
    role: { id: string; name: string } | null;
  };
  roles: { id: string; name: string }[];
}

export function UserRow({ user, roles }: UserRowProps) {
  const [selectedRole, setSelectedRole] = useState(user.role?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const roleId = e.target.value;
    setSelectedRole(roleId);
    setError(null);
    startTransition(async () => {
      try {
        await updateUserRoleAction(user.id, roleId);
      } catch {
        setSelectedRole(user.role?.id ?? "");
        setError("Failed to update role");
      }
    });
  }

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
          {(user.displayName ?? user.username ?? "?")[0]}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {user.displayName ?? user.username ?? "Unknown"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {user.email}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {error && <span className="text-xs text-red-500">{error}</span>}
        {user.isBanned && (
          <span className="text-xs font-medium text-red-500">Banned</span>
        )}
        {pending && (
          <span className="text-xs text-muted-foreground">Saving...</span>
        )}
        <select
          value={selectedRole}
          onChange={handleRoleChange}
          disabled={pending}
          className="rounded-md border bg-background px-2 py-1 text-xs font-medium disabled:opacity-50"
        >
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
