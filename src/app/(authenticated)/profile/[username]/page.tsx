import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDatabase, schema } from "@/db";
import { formatDate } from "@/lib/utils";
import {
  LevelBadge,
  BadgeGrid,
  TrophyGrid,
  ReputationCard,
} from "@/modules/reputation/components";
import { reputationEngine } from "@/services/reputation-engine";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata(
  props: ProfilePageProps,
): Promise<Metadata> {
  const params = await props.params;
  return {
    title: params.username,
  };
}

export default async function ProfilePage(props: ProfilePageProps) {
  const params = await props.params;
  const db = getDatabase();

  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.username, params.username),
    with: {
      role: true,
    },
  });

  if (!user) {
    notFound();
  }

  const profile = await db.query.profiles.findFirst({
    where: (profiles, { eq }) => eq(profiles.userId, user.id),
  });

  const [reputation, levelInfo, userBadgeRows, userTrophyRows] =
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
    ]);

  const badges = (userBadgeRows as any[]).map((ub: any) => ({
    ...ub.badge,
    earnedAt: ub.earnedAt,
  }));
  const trophies = (userTrophyRows as any[]).map((ut: any) => ({
    ...ut.trophy,
    earnedAt: ut.earnedAt,
  }));

  return (
    <div className="mx-auto max-w-4xl">
      <div className="relative h-48 w-full overflow-hidden rounded-lg bg-muted sm:h-64">
        {profile?.coverUrl && (
          <img
            src={profile.coverUrl}
            alt="Cover"
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="relative -mt-16 flex items-end gap-4 px-4">
        <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-background bg-muted">
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={user.displayName ?? user.username ?? "Avatar"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-3xl font-bold text-primary">
              {(user.displayName ?? user.username ?? "U")[0].toUpperCase()}
            </div>
          )}
        </div>
        <div className="pb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              {profile?.displayName ?? user.displayName ?? user.username}
            </h1>
            {levelInfo.level && <LevelBadge level={levelInfo.level} size="md" />}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>@{user.username}</span>
            {reputation && (
              <>
                <span aria-hidden="true">·</span>
                <span>{reputation.reputationPoints} reputation</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>{badges.length} badges</span>
            <span aria-hidden="true">·</span>
            <span>{trophies.length} trophies</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <div className="rounded-lg border p-4">
            <h2 className="font-semibold">About</h2>
            {profile?.biography ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {profile.biography}
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                No biography yet.
              </p>
            )}
          </div>

          {badges.length > 0 && (
            <div className="rounded-lg border p-4">
              <h2 className="mb-4 font-semibold">
                Badges ({badges.length})
              </h2>
              <BadgeGrid badges={badges} />
            </div>
          )}

          {trophies.length > 0 && (
            <div className="rounded-lg border p-4">
              <h2 className="mb-4 font-semibold">
                Trophies ({trophies.length})
              </h2>
              <TrophyGrid trophies={trophies} />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <ReputationCard reputation={reputation} />

          {levelInfo.level && (
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Level Progress
              </h3>
              <div className="text-center">
                <div className="text-lg font-bold">{levelInfo.level.name}</div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${levelInfo.progress}%` }}
                  />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {levelInfo.points.toLocaleString()} points
                  {levelInfo.nextLevel &&
                    ` / ${levelInfo.nextLevel.minPoints.toLocaleString()}`}
                </div>
              </div>
            </div>
          )}

          <div className="rounded-lg border p-4">
            <h2 className="font-semibold">Details</h2>
            <dl className="mt-2 space-y-2 text-sm">
              {profile?.location && (
                <div>
                  <dt className="text-muted-foreground">Location</dt>
                  <dd>{profile.location}</dd>
                </div>
              )}
              {profile?.website && (
                <div>
                  <dt className="text-muted-foreground">Website</dt>
                  <dd>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {profile.website}
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground">Role</dt>
                <dd className="capitalize">
                  {(user.role as { name?: string } | null)?.name?.toLowerCase() ?? "member"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Joined</dt>
                <dd>{formatDate(user.createdAt)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
