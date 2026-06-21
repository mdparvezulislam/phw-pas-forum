import {
  Award,
  Medal,
  MessageSquare,
  Star,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { leaderboardService } from "@/services/leaderboard";

export const metadata: Metadata = {
  title: "Leaderboards",
  description: "Community rankings and top contributors",
};

export default async function LeaderboardsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const [reputation, posts, trophies, badges] = await Promise.all([
    leaderboardService.getReputationLeaderboard("all-time"),
    leaderboardService.getPostLeaderboard(),
    leaderboardService.getTrophyLeaderboard(),
    leaderboardService.getBadgeLeaderboard(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Leaderboards</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Top contributors and community rankings
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Reputation Leaderboard */}
        <LeaderboardSection
          title="Top Reputation"
          icon={TrendingUp}
          color="text-primary"
          bg="bg-primary/10"
          entries={reputation.map((r: any) => ({
            rank: 0,
            username: r.username ?? r.displayName ?? "Unknown",
            displayName: r.displayName,
            value: `${(r.reputationPoints ?? 0).toLocaleString()} rep`,
            href: `/profile/${r.username}`,
          }))}
        />

        {/* Posts Leaderboard */}
        <LeaderboardSection
          title="Most Posts"
          icon={MessageSquare}
          color="text-blue-600 dark:text-blue-400"
          bg="bg-blue-500/10"
          entries={posts.map((r: any) => ({
            rank: 0,
            username: r.username ?? r.displayName ?? "Unknown",
            displayName: r.displayName,
            value: `${(r.postCount ?? 0).toLocaleString()} posts`,
            href: `/profile/${r.username}`,
          }))}
        />

        {/* Trophies Leaderboard */}
        <LeaderboardSection
          title="Most Trophies"
          icon={Trophy}
          color="text-amber-600 dark:text-amber-400"
          bg="bg-amber-500/10"
          entries={trophies.map((r: any) => ({
            rank: 0,
            username: r.username ?? r.displayName ?? "Unknown",
            displayName: r.displayName,
            value: `${(r.trophyCount ?? 0).toLocaleString()} trophies`,
            href: `/profile/${r.username}`,
          }))}
        />

        {/* Badges Leaderboard */}
        <LeaderboardSection
          title="Most Badges"
          icon={Award}
          color="text-purple-600 dark:text-purple-400"
          bg="bg-purple-500/10"
          entries={badges.map((r: any) => ({
            rank: 0,
            username: r.username ?? r.displayName ?? "Unknown",
            displayName: r.displayName,
            value: `${(r.badgeCount ?? 0).toLocaleString()} badges`,
            href: `/profile/${r.username}`,
          }))}
        />
      </div>
    </div>
  );
}

function LeaderboardSection({
  title,
  icon: Icon,
  color,
  bg,
  entries,
}: {
  title: string;
  icon: any;
  color: string;
  bg: string;
  entries: {
    rank: number;
    username: string;
    displayName?: string | null;
    value: string;
    href: string;
  }[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center gap-3 border-b px-5 py-4">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}
        >
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="divide-y">
        {entries.length > 0 ? (
          entries.map((entry, i) => {
            const name = entry.displayName ?? entry.username;
            return (
              <Link
                key={entry.username}
                href={entry.href}
                className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-accent/50"
              >
                {/* Rank */}
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    i === 0 &&
                      "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                    i === 1 && "bg-slate-400/10 text-slate-500",
                    i === 2 &&
                      "bg-orange-500/10 text-orange-600 dark:text-orange-400",
                    i > 2 && "bg-muted text-muted-foreground",
                  )}
                >
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{name}</p>
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {entry.value}
                </span>
              </Link>
            );
          })
        ) : (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            No entries yet
          </div>
        )}
      </div>
    </div>
  );
}
