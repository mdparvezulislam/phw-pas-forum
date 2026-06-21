import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { Users } from "lucide-react";
import { getDatabase, schema } from "@/db";
import { PageHeader, KpiCard } from "@/components/admin";
import { UsersTable, type AdminUserItem } from "./users-table";

export const metadata: Metadata = { title: "Manage Users" };

export default async function AdminUsersPage() {
  const db = getDatabase();

  const [users, roles] = await Promise.all([
    db.query.users.findMany({
      with: { role: true },
      orderBy: [desc(schema.users.createdAt)],
      limit: 100,
    }),
    db.query.roles.findMany({
      orderBy: (roles, { asc }) => [asc(roles.name)],
    }),
  ]);

  const items: AdminUserItem[] = users.map((u) => ({
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    email: u.email,
    image: u.image,
    isBanned: u.isBanned,
    createdAt: u.createdAt.toISOString(),
    role: u.role ? { id: u.role.id, name: u.role.name } : null,
  }));

  const bannedCount = items.filter((u) => u.isBanned).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage members, roles and access across the platform."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          title="Total Users"
          value={items.length.toLocaleString()}
          icon={Users}
          accent="primary"
          description="Most recent 100 shown"
        />
        <KpiCard
          title="Roles"
          value={roles.length.toLocaleString()}
          accent="info"
        />
        <KpiCard
          title="Banned"
          value={bannedCount.toLocaleString()}
          accent={bannedCount > 0 ? "danger" : "default"}
        />
      </div>

      <UsersTable
        users={items}
        roles={roles.map((r) => ({ id: r.id, name: r.name }))}
      />
    </div>
  );
}
