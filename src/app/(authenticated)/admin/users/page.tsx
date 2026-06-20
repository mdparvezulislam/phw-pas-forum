import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { getDatabase, schema } from "@/db";
import { UserRow } from "./user-row";

export const metadata: Metadata = {
  title: "Manage Users",
};

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <p className="text-sm text-muted-foreground">
          {users.length} users &middot; {roles.length} roles
        </p>
      </div>

      <div className="rounded-lg border">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold">Users</h2>
        </div>
        {users.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="divide-y">
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={{
                  id: user.id,
                  username: user.username,
                  displayName: user.displayName,
                  email: user.email,
                  isBanned: user.isBanned,
                  createdAt: user.createdAt,
                  role: user.role
                    ? { id: user.role.id, name: user.role.name }
                    : null,
                }}
                roles={roles.map((r) => ({ id: r.id, name: r.name }))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
