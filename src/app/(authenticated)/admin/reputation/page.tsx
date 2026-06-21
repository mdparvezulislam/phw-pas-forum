import { desc } from "drizzle-orm";
import type { Metadata } from "next";
import { Award, Sparkles, Trophy } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/admin";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const users =
    userIds.length > 0
      ? await db.query.users.findMany({
          where: (u, { inArray }) => inArray(u.id, userIds),
          columns: { id: true, username: true, displayName: true },
        })
      : [];
  const userMap = new Map(users.map((u) => [u.id, u]));

  const topUsers = repEntries.map((r) => ({
    ...r,
    user: userMap.get(r.userId) ?? {
      id: r.userId,
      username: null,
      displayName: null,
    },
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reputation"
        description="Manage reputation points and view top contributors"
        icon={<Sparkles className="h-5 w-5" />}
      />

      <SectionCard
        title="Award Reputation"
        icon={<Sparkles className="h-4 w-4" />}
        description="Award reputation points to a user"
      >
        <form
          action="/admin/reputation/award"
          method="POST"
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                name="userId"
                placeholder="Enter user ID"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                name="points"
                type="number"
                min="1"
                max="10000"
                placeholder="1-10000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Input
                id="reason"
                name="reason"
                placeholder="Reason for awarding"
              />
            </div>
          </div>
          <Button type="submit" className="gap-2">
            <Award className="h-4 w-4" />
            Award Reputation
          </Button>
        </form>
      </SectionCard>

      <SectionCard
        title="Top Contributors"
        description={`${topUsers.length} users`}
        icon={<Trophy className="h-4 w-4" />}
        actions={
          <Badge variant="secondary">
            {topUsers.length} total
          </Badge>
        }
      >
        <div className="divide-y">
          {topUsers.map((entry, index) => {
            const rank = index + 1;
            const displayName = entry.user?.displayName ?? entry.user?.username ?? "Unknown";
            const username = entry.user?.username ?? "unknown";

            return (
              <div
                key={entry.userId}
                className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    rank === 1
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : rank === 2
                        ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        : rank === 3
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                          : "bg-muted text-muted-foreground"
                  }`}
                >
                  {rank}
                </span>

                <Avatar className="h-9 w-9">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {username.charAt(0).toUpperCase()}
                  </div>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">@{username}</p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums">
                    {entry.reputationPoints.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </div>
            );
          })}

          {topUsers.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No reputation entries yet.
            </p>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
