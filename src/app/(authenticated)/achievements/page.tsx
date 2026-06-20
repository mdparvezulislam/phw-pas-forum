import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDatabase, schema } from "@/db";
import { eq, desc } from "drizzle-orm";
import { AchievementGallery, TrophyGallery, UserEmptyState } from "@/components/user";

export const metadata: Metadata = {
  title: "Achievements",
  description: "Your badges, trophies, and accomplishments",
};

export default async function AchievementsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const db = getDatabase();

  const [userBadgeRows, userTrophyRows] = await Promise.all([
    db.query.userBadges.findMany({
      where: (ub, { eq }) => eq(ub.userId, session.user.id),
      with: { badge: true },
      orderBy: (ub, { desc }) => desc(ub.earnedAt),
    }),
    db.query.userTrophies.findMany({
      where: (ut, { eq }) => eq(ut.userId, session.user.id),
      with: { trophy: true },
      orderBy: (ut, { desc }) => desc(ut.earnedAt),
    }),
  ]);

  const badges = userBadgeRows.map((ub: any) => ({ ...ub.badge, earnedAt: ub.earnedAt }));
  const trophies = userTrophyRows.map((ut: any) => ({ ...ut.trophy, earnedAt: ut.earnedAt }));

  // Get all available badges/trophies for locked state display
  const allBadges = await db.select().from(schema.badges);
  const allTrophies = await db.select().from(schema.trophies);
  const earnedBadgeIds = new Set(badges.map((b: any) => b.id));
  const earnedTrophyIds = new Set(trophies.map((t: any) => t.id));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Achievements</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {badges.length} badges &middot; {trophies.length} trophies earned
        </p>
      </div>

      {/* Badges */}
      <section>
        <AchievementGallery
          badges={badges.length > 0 ? badges : allBadges}
          earnedBadgeIds={earnedBadgeIds}
          title={badges.length > 0 ? `Earned Badges (${badges.length})` : "Badges"}
          emptyMessage="No badges earned yet. Participate in the community to earn badges!"
        />
      </section>

      {/* All Badges (locked/unlocked) */}
      {allBadges.length > badges.length && (
        <section>
          <div className="rounded-xl border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              All Available Badges ({badges.length}/{allBadges.length})
            </h3>
            <AchievementGallery
              badges={allBadges}
              earnedBadgeIds={earnedBadgeIds}
              title=""
            />
          </div>
        </section>
      )}

      {/* Trophies */}
      <section>
        <TrophyGallery
          trophies={trophies.length > 0 ? trophies : allTrophies}
          earnedTrophyIds={earnedTrophyIds}
          title={trophies.length > 0 ? `Earned Trophies (${trophies.length})` : "Trophies"}
          emptyMessage="No trophies earned yet. Complete challenges to earn trophies!"
        />
      </section>

      {/* All Trophies */}
      {allTrophies.length > trophies.length && (
        <section>
          <div className="rounded-xl border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              All Available Trophies ({trophies.length}/{allTrophies.length})
            </h3>
            <TrophyGallery
              trophies={allTrophies}
              earnedTrophyIds={earnedTrophyIds}
              title=""
            />
          </div>
        </section>
      )}

      {badges.length === 0 && trophies.length === 0 && (
        <UserEmptyState type="no-achievements" />
      )}
    </div>
  );
}
