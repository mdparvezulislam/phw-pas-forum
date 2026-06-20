import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { getDatabase, schema } from "@/db";

export const metadata: Metadata = {
  title: "Manage Reputation",
};

export default async function AdminReputationPage() {

  const db = getDatabase();

  const repEntries = await db.query.userReputation.findMany({
    orderBy: (r, { desc }) => [desc(r.reputationPoints)],
    limit: 50,
  });

  const userIds = repEntries.map((r) => r.userId);
  const users = userIds.length > 0
    ? await db.query.users.findMany({
        where: (u, { inArray }) => inArray(u.id, userIds),
        columns: { id: true, username: true, displayName: true },
      })
    : [];
  const userMap = new Map(users.map((u) => [u.id, u]));

  const topUsers = repEntries.map((r) => ({
    ...r,
    user: userMap.get(r.userId) ?? { id: r.userId, username: null, displayName: null },
  }));

  return (
    <div className="space-y-8">
      <div className="rounded-lg border p-4">
        <h2 className="mb-4 font-semibold">Award Reputation</h2>
        <form action="/admin/reputation/award" method="POST" className="space-y-3">
          <div>
            <label htmlFor="userId" className="mb-1 block text-sm font-medium">
              User ID
            </label>
            <input
              id="userId"
              name="userId"
              required
              className="w-full rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="points" className="mb-1 block text-sm font-medium">
              Points
            </label>
            <input
              id="points"
              name="points"
              type="number"
              min="1"
              max="10000"
              required
              className="w-full rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="reason" className="mb-1 block text-sm font-medium">
              Reason (optional)
            </label>
            <input
              id="reason"
              name="reason"
              className="w-full rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Award Reputation
          </button>
        </form>
      </div>

      <div>
        <h2 className="mb-4 font-semibold">Top Users by Reputation</h2>
        <div className="rounded-lg border">
          <div className="divide-y">
            {topUsers.map((u, i) => (
              <div
                key={u.userId}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-muted-foreground">
                    #{i + 1}
                  </span>
                  <div>
                    <div className="text-sm font-medium">
                      {u.user?.displayName ?? u.user?.username}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      @{u.user?.username}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {u.reputationPoints.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">points</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
