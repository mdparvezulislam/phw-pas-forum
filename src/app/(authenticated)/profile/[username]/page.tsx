import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDatabase, schema } from "@/db";
import { reputationEngine } from "@/services/reputation-engine";
import { ProfileHeader, ActivityTimeline, AchievementGallery, TrophyGallery } from "@/components/user";
import { ReputationCard, LevelBadge } from "@/modules/reputation/components";
import { formatDate } from "@/lib/utils";
import { eq, desc, count, sql } from "drizzle-orm";
import {
  MapPin,
  Globe,
  Calendar,
  Shield,
  MessageSquare,
  FileText,
  Award,
  Star,
  Heart,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata(props: ProfilePageProps): Promise<Metadata> {
  const params = await props.params;
  return { title: params.username };
}

export default async function ProfilePage(props: ProfilePageProps) {
  const params = await props.params;
  const session = await auth();
  const db = getDatabase();

  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.username, params.username),
    with: { role: true },
  });
  if (!user) notFound();

  const profile = await db.query.profiles.findFirst({
    where: (p, { eq }) => eq(p.userId, user.id),
  });

  const [reputation, levelInfo, userBadgeRows, userTrophyRows, threadCount, postCount] =
    await Promise.all([
      reputationEngine.getUserReputation(user.id),
      reputationEngine.getUserLevel(user.id),
      db.query.userBadges.findMany({
        where: (ub, { eq }) => eq(ub.userId, user.id),
        with: { badge: true },
        orderBy: (ub, { desc }) => desc(ub.earnedAt),
      }),
      db.query.userTrophies.findMany({
        where: (ut, { eq }) => eq(ut.userId, user.id),
        with: { trophy: true },
        orderBy: (ut, { desc }) => desc(ut.earnedAt),
      }),
      db.select({ count: count() }).from(schema.threads).where(eq(schema.threads.authorId, user.id)).then(r => r[0]?.count ?? 0),
      db.select({ count: count() }).from(schema.posts).where(eq(schema.posts.authorId, user.id)).then(r => r[0]?.count ?? 0),
    ]);

  const badges = userBadgeRows.map((ub: any) => ({ ...ub.badge, earnedAt: ub.earnedAt }));
  const trophies = userTrophyRows.map((ut: any) => ({ ...ut.trophy, earnedAt: ut.earnedAt }));

  const isOwnProfile = session?.user?.id === user.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <ProfileHeader
        user={user as any}
        profile={profile}
        levelInfo={levelInfo}
        reputation={reputation}
        isOwnProfile={isOwnProfile}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: FileText, label: "Threads", value: threadCount.toLocaleString(), color: "text-primary", bg: "bg-primary/10" },
          { icon: MessageSquare, label: "Posts", value: postCount.toLocaleString(), color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
          { icon: Award, label: "Badges", value: badges.length, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
          { icon: Star, label: "Trophies", value: trophies.length, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                  <Icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="mt-2 text-2xl font-bold">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* About */}
          <div className="rounded-xl border bg-card p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">About</h2>
            {profile?.biography ? (
              <p className="text-sm leading-relaxed text-muted-foreground">{profile.biography}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No biography yet.</p>
            )}
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <AchievementGallery badges={badges} title={`Badges (${badges.length})`} />
          )}

          {/* Trophies */}
          {trophies.length > 0 && (
            <TrophyGallery trophies={trophies} title={`Trophies (${trophies.length})`} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <ReputationCard reputation={reputation} />

          {/* Level Progress */}
          {levelInfo && (
            <div className="rounded-xl border bg-card p-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Level Progress</h3>
              <div className="text-center">
                {levelInfo.level && (
                  <LevelBadge level={levelInfo.level} size="lg" />
                )}
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${levelInfo.progress}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {levelInfo.points.toLocaleString()} points
                  {levelInfo.nextLevel && ` / ${levelInfo.nextLevel.minPoints.toLocaleString()}`}
                </p>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details</h3>
            <dl className="space-y-3 text-sm">
              {profile?.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <dd>{profile.location}</dd>
                </div>
              )}
              {profile?.website && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <dd>
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {profile.website.replace(/^https?:\/\//, "")}
                    </a>
                  </dd>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-4 w-4" />
                <dd className="capitalize">{(user.role as { name?: string } | null)?.name?.toLowerCase() ?? "member"}</dd>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <dd>Joined {formatDate(user.createdAt)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
