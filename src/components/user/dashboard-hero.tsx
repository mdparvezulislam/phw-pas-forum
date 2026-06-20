import Link from "next/link";
import {
  Bell,
  MessageSquare,
  Settings,
  Edit3,
  ShoppingBag,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { cn, formatDateRelative } from "@/lib/utils";
import { LevelBadge } from "@/modules/reputation/components";

interface DashboardHeroProps {
  user: {
    username: string | null;
    displayName: string | null;
    createdAt: Date;
  };
  profile?: {
    avatarUrl?: string | null;
    displayName?: string | null;
  } | null;
  stats: {
    reputationPoints: number;
    threadCount: number;
    postCount: number;
    badgeCount: number;
    trophyCount: number;
  };
  levelInfo?: {
    level?: { name: string; minPoints: number } | null;
    progress: number;
    points: number;
  } | null;
  unreadCount: number;
  unreadMessages: number;
  className?: string;
}

export function DashboardHero({
  user,
  profile,
  stats,
  levelInfo,
  unreadCount,
  unreadMessages,
  className,
}: DashboardHeroProps) {
  const name = profile?.displayName ?? user.displayName ?? user.username ?? "User";

  return (
    <div className={cn("overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 via-card to-premium/5", className)}>
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-2xl font-bold shadow-sm">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={name}
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                name[0]?.toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold sm:text-2xl">
                  Welcome back, {name.split(" ")[0]}
                </h1>
                {levelInfo?.level && (
                  <LevelBadge level={levelInfo.level} size="sm" />
                )}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                @{user.username}
                <span className="mx-2">&middot;</span>
                {stats.reputationPoints.toLocaleString()} reputation
                <span className="mx-2">&middot;</span>
                Joined {formatDateRelative(user.createdAt)}
              </p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            <Link
              href="/notifications"
              className="relative inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              <Bell className="h-4 w-4" />
              Notifications
              {unreadCount > 0 && (
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/conversations"
              className="relative inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              <MessageSquare className="h-4 w-4" />
              Messages
              {unreadMessages > 0 && (
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {unreadMessages}
                </span>
              )}
            </Link>
            <Link
              href="/settings/profile"
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>
        </div>

        {/* Stats preview */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatPreview label="Threads" value={stats.threadCount} link="/profile" />
          <StatPreview label="Posts" value={stats.postCount} link="/profile" />
          <StatPreview label="Badges" value={stats.badgeCount} link="/achievements" />
          <StatPreview label="Trophies" value={stats.trophyCount} link="/achievements" />
        </div>
      </div>
    </div>
  );
}

function StatPreview({
  label,
  value,
  link,
}: {
  label: string;
  value: number;
  link?: string;
}) {
  const content = (
    <div className="rounded-xl border bg-card/50 px-4 py-3 text-center backdrop-blur-sm transition-colors hover:bg-accent/30">
      <p className="text-xl font-bold">{value.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );

  if (link) {
    return <Link href={link}>{content}</Link>;
  }
  return content;
}
