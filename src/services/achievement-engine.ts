import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { getDatabase, schema } from "@/db";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";
import { auditService } from "./audit";
import { reputationEngine } from "./reputation-engine";

export class AchievementEngine {
  async checkAndAwardBadges(userId: string): Promise<string[]> {
    const db = getDatabase();
    const awarded: string[] = [];

    const systemBadges = await db.query.badges.findMany({
      where: (b, { eq }) => eq(b.isSystem, true),
    });

    const userBadgeIds = await db
      .select({ badgeId: schema.userBadges.badgeId })
      .from(schema.userBadges)
      .where(eq(schema.userBadges.userId, userId))
      .then((r) => r.map((b) => b.badgeId));

    const rep = await reputationEngine.getUserReputation(userId);

    const postCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.posts)
      .where(
        and(
          eq(schema.posts.authorId, userId),
          sql`${schema.posts.status} = 'PUBLISHED'`,
        ),
      )
      .then((r) => Number(r[0].count));

    const threadCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.threads)
      .where(
        and(
          eq(schema.threads.authorId, userId),
          sql`${schema.threads.status} = 'PUBLISHED'`,
        ),
      )
      .then((r) => Number(r[0].count));

    const reactionCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.reactions)
      .where(
        and(
          eq(schema.reactions.targetId, userId),
          eq(schema.reactions.targetType, "POST"),
        ),
      )
      .then((r) => Number(r[0].count));

    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, userId),
    });

    const joinDurationDays = user
      ? Math.floor(
          (new Date().getTime() - new Date(user.createdAt).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

    for (const badge of systemBadges) {
      if (userBadgeIds.includes(badge.id)) continue;

      let shouldAward = false;

      if (badge.slug === "first-post") shouldAward = postCount >= 1;
      else if (badge.slug === "10-posts") shouldAward = postCount >= 10;
      else if (badge.slug === "100-posts") shouldAward = postCount >= 100;
      else if (badge.slug === "1000-posts") shouldAward = postCount >= 1000;
      else if (badge.slug === "first-thread") shouldAward = threadCount >= 1;
      else if (badge.slug === "10-threads") shouldAward = threadCount >= 10;
      else if (badge.slug === "first-like") shouldAward = reactionCount >= 1;
      else if (badge.slug === "100-likes") shouldAward = reactionCount >= 100;
      else if (badge.slug === "helpful-contributor")
        shouldAward = rep.helpfulCount >= 10;
      else if (badge.slug === "elite-contributor")
        shouldAward = rep.helpfulCount >= 50;
      else if (badge.slug === "veteran") shouldAward = joinDurationDays >= 365;
      else if (badge.slug === "community-legend")
        shouldAward = rep.reputationPoints >= 10000;
      else if (badge.slug === "rising-star")
        shouldAward = rep.reputationPoints >= 100;
      else if (badge.slug === "established")
        shouldAward = rep.reputationPoints >= 500;

      if (shouldAward) {
        await db.insert(schema.userBadges).values({
          userId,
          badgeId: badge.id,
        });
        awarded.push(badge.slug);

        await auditService.log(null, AUDIT_ACTIONS.BADGE_EARNED, {
          resource: "badge",
          resourceId: badge.id,
          metadata: { userId, badgeSlug: badge.slug, badgeName: badge.name },
        });
      }
    }

    return awarded;
  }

  async checkAndAwardTrophies(userId: string): Promise<string[]> {
    const db = getDatabase();
    const awarded: string[] = [];

    const allTrophies = await db.query.trophies.findMany();

    const userTrophyIds = await db
      .select({ trophyId: schema.userTrophies.trophyId })
      .from(schema.userTrophies)
      .where(eq(schema.userTrophies.userId, userId))
      .then((r) => r.map((t) => t.trophyId));

    const rep = await reputationEngine.getUserReputation(userId);

    const postCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.posts)
      .where(
        and(
          eq(schema.posts.authorId, userId),
          sql`${schema.posts.status} = 'PUBLISHED'`,
        ),
      )
      .then((r) => Number(r[0].count));

    const threadCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.threads)
      .where(
        and(
          eq(schema.threads.authorId, userId),
          sql`${schema.threads.status} = 'PUBLISHED'`,
        ),
      )
      .then((r) => Number(r[0].count));

    const reactionCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.reactions)
      .where(
        and(
          eq(schema.reactions.userId, userId),
          eq(schema.reactions.targetType, "POST"),
        ),
      )
      .then((r) => Number(r[0].count));

    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, userId),
    });

    const joinDurationDays = user
      ? Math.floor(
          (new Date().getTime() - new Date(user.createdAt).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

    for (const trophy of allTrophies) {
      if (userTrophyIds.includes(trophy.id)) continue;

      let earned = false;
      const value = trophy.conditionValue;

      switch (trophy.conditionType) {
        case "POST_COUNT":
          earned = postCount >= value;
          break;
        case "THREAD_COUNT":
          earned = threadCount >= value;
          break;
        case "REACTION_COUNT":
          earned = reactionCount >= value;
          break;
        case "REPUTATION_COUNT":
          earned = rep.reputationPoints >= value;
          break;
        case "JOIN_DURATION_DAYS":
          earned = joinDurationDays >= value;
          break;
        case "HELPFUL_COUNT":
          earned = rep.helpfulCount >= value;
          break;
      }

      if (earned) {
        await db.insert(schema.userTrophies).values({
          userId,
          trophyId: trophy.id,
        });

        if (trophy.reputationReward > 0) {
          await reputationEngine.awardReputation(
            userId,
            null,
            "TROPHY_REWARD",
            trophy.reputationReward,
            trophy.id,
            "trophy",
          );
        }

        await db
          .update(schema.userReputation)
          .set({
            trophiesEarned: sql`${schema.userReputation.trophiesEarned} + 1`,
          })
          .where(eq(schema.userReputation.userId, userId));

        awarded.push(trophy.title);

        await auditService.log(null, AUDIT_ACTIONS.TROPHY_UNLOCKED, {
          resource: "trophy",
          resourceId: trophy.id,
          metadata: { userId, trophyTitle: trophy.title },
        });
      }
    }

    return awarded;
  }

  async checkLevelUp(userId: string) {
    const db = getDatabase();
    const levelInfo = await reputationEngine.getUserLevel(userId);

    if (levelInfo.level) {
      await auditService.log(null, AUDIT_ACTIONS.LEVEL_UP, {
        resource: "level",
        resourceId: levelInfo.level.id,
        metadata: {
          userId,
          levelName: levelInfo.level.name,
          points: levelInfo.points,
        },
      });
    }

    return levelInfo;
  }

  async processAllAchievements(userId: string) {
    const badges = await this.checkAndAwardBadges(userId);
    const trophies = await this.checkAndAwardTrophies(userId);
    const level = await this.checkLevelUp(userId);

    return { badges, trophies, level };
  }
}

export const achievementEngine = new AchievementEngine();
