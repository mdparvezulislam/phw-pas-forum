import {
  ArrowUpRight,
  BarChart3,
  Bell,
  Bookmark,
  Eye,
  MessageSquare,
  ShoppingBag,
  Trophy,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ActivityTimeline,
  DashboardHero,
  DashboardSkeleton,
  UserEmptyState,
} from "@/components/user";
import { auth } from "@/lib/auth";
import { AIRecommendationFeed } from "@/modules/ai/components/AIRecommendationFeed";
import { getDashboardData } from "@/services/user-dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your personal command center",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const data = await getDashboardData(session.user.id);
  if (!data.user) redirect("/auth/login");

  const activityItems = data.recentActivity.map((a: any) => ({
    type: "post" as const,
    id: a.id,
    title: a.threadTitle ?? "Posted in a thread",
    description: undefined,
    createdAt: a.createdAt,
    link: `/forums/${a.threadSlug ? `.../${a.threadSlug}` : "#"}`,
  }));

  return (
    <div className="space-y-6">
      {/* Hero */}
      <DashboardHero
        user={data.user}
        profile={data.profile}
        stats={data.stats}
        levelInfo={data.levelInfo}
        unreadCount={data.unreadCount}
        unreadMessages={data.unreadMessages}
      />

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          {
            icon: Bell,
            label: "Notifications",
            count: data.unreadCount,
            href: "/notifications",
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            icon: MessageSquare,
            label: "Messages",
            count: data.unreadMessages,
            href: "/conversations",
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-500/10",
          },
          {
            icon: Eye,
            label: "Watching",
            count: data.stats.threadCount,
            href: "/watched",
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            icon: Bookmark,
            label: "Bookmarks",
            count: data.stats.threadCount,
            href: "/bookmarks",
            color: "text-pink-600 dark:text-pink-400",
            bg: "bg-pink-500/10",
          },
          {
            icon: ShoppingBag,
            label: "Orders",
            count: 0,
            href: "/orders",
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-500/10",
          },
          {
            icon: Trophy,
            label: "Achievements",
            count: data.stats.badgeCount + data.stats.trophyCount,
            href: "/achievements",
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-500/10",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-md"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.bg}`}
              >
                <Icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-xs text-muted-foreground">
                  {item.count} items
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Activity + Profile */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Recent Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Link
              href={`/profile/${data.user.username}`}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View Profile
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {activityItems.length > 0 ? (
            <div className="rounded-xl border bg-card p-5">
              <ActivityTimeline items={activityItems} />
            </div>
          ) : (
            <UserEmptyState type="no-activity" />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <AIRecommendationFeed />

          {/* Recent Badges */}
          {data.recentBadges.length > 0 && (
            <div className="rounded-xl border bg-card p-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recent Badges
              </h3>
              <div className="space-y-3">
                {data.recentBadges.map((badge: any) => (
                  <div key={badge.id} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-lg">
                      {badge.icon ?? "🏅"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{badge.name}</p>
                      {badge.earnedAt && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(badge.earnedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reputation Card */}
          {data.reputation && (
            <div className="rounded-xl border bg-card p-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Reputation
              </h3>
              <p className="text-3xl font-bold">
                {data.stats.reputationPoints.toLocaleString()}
              </p>
              {data.levelInfo?.level && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{data.levelInfo.level.name}</span>
                    <span>{data.levelInfo.progress.toFixed(0)}%</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${data.levelInfo.progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {data.levelInfo.points.toLocaleString()} points
                  </p>
                </div>
              )}
              <Link
                href="/reputation"
                className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View history
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
