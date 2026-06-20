import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";
import { getDatabase, schema } from "@/db";
import type {
  NewReputationTransaction,
  ReputationTransactionType,
} from "@/db/schema/reputation-transactions";
import { auditService } from "./audit";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";

export const REPUTATION_RULES = {
  LIKE_RECEIVED: 1,
  LOVE_RECEIVED: 1,
  THANKS_RECEIVED: 2,
  HELPFUL_RECEIVED: 3,
  INSIGHTFUL_RECEIVED: 3,
  FIRE_RECEIVED: 2,
  TROPHY_UNLOCK: 10,
  ADMIN_AWARD: 50,
  MARKETPLACE_REVIEW: 10,
  ORDER_COMPLETED: 10,
  ITRADER_POSITIVE: 5,
  SYSTEM_REWARD: 5,
} as const;

export function getReputationPointsForReaction(
  reactionType: string,
): number {
  const map: Record<string, number> = {
    LIKE: REPUTATION_RULES.LIKE_RECEIVED,
    LOVE: REPUTATION_RULES.LOVE_RECEIVED,
    THANKS: REPUTATION_RULES.THANKS_RECEIVED,
    HELPFUL: REPUTATION_RULES.HELPFUL_RECEIVED,
    INSIGHTFUL: REPUTATION_RULES.INSIGHTFUL_RECEIVED,
    FIRE: REPUTATION_RULES.FIRE_RECEIVED,
  };
  return map[reactionType] ?? 0;
}

export class ReputationEngine {
  async addTransaction(input: NewReputationTransaction): Promise<void> {
    const db = getDatabase();

    await db.insert(schema.reputationTransactions).values(input);

    await db
      .insert(schema.userReputation)
      .values({
        userId: input.userId,
        reputationPoints: input.points,
        trustScore: input.points > 0 ? input.points : 0,
        helpfulCount: input.type === "POST_REACTION" ? 1 : 0,
        positiveFeedbackCount: input.points > 0 ? 1 : 0,
        negativeFeedbackCount: input.points < 0 ? 1 : 0,
        trophiesEarned: 0,
        badgesEarned: 0,
        lastCalculatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.userReputation.userId,
        set: {
          reputationPoints: sql`${schema.userReputation.reputationPoints} + ${input.points}`,
          trustScore: sql`${schema.userReputation.trustScore} + ${input.points > 0 ? input.points : 0}`,
          helpfulCount: sql`${schema.userReputation.helpfulCount} + ${input.type === "POST_REACTION" ? 1 : 0}`,
          positiveFeedbackCount: sql`${schema.userReputation.positiveFeedbackCount} + ${input.points > 0 ? 1 : 0}`,
          negativeFeedbackCount: sql`${schema.userReputation.negativeFeedbackCount} + ${input.points < 0 ? 1 : 0}`,
          lastCalculatedAt: new Date(),
        },
      });

    await auditService.log(input.sourceUserId ?? null, AUDIT_ACTIONS.REPUTATION_CHANGED, {
      resource: "reputation",
      resourceId: input.userId,
      metadata: {
        points: input.points,
        type: input.type,
        entityId: input.entityId,
        entityType: input.entityType,
      } as Record<string, unknown>,
    });
  }

  async getUserReputation(userId: string) {
    const db = getDatabase();

    let rep = await db.query.userReputation.findFirst({
      where: (r, { eq }) => eq(r.userId, userId),
    });

    if (!rep) {
      const [created] = await db
        .insert(schema.userReputation)
        .values({
          userId,
          reputationPoints: 0,
          trustScore: 0,
          helpfulCount: 0,
          positiveFeedbackCount: 0,
          negativeFeedbackCount: 0,
          trophiesEarned: 0,
          badgesEarned: 0,
          lastCalculatedAt: new Date(),
        })
        .returning();
      rep = created;
    }

    return rep;
  }

  async getReputationHistory(
    userId: string,
    limit = 50,
    offset = 0,
  ) {
    const db = getDatabase();
    return db.query.reputationTransactions.findMany({
      where: (tx, { eq }) => eq(tx.userId, userId),
      orderBy: (tx, { desc }) => [desc(tx.createdAt)],
      limit,
      offset,
    });
  }

  async getUserLevel(userId: string) {
    const db = getDatabase();
    const rep = await this.getUserReputation(userId);
    const levels = await db.query.userLevels.findMany({
      orderBy: (l, { desc }) => [desc(l.minPoints)],
    });

    let currentLevel: { id: string; name: string; minPoints: number } | null =
      null;
    for (const level of levels) {
      if (rep.reputationPoints >= level.minPoints) {
        currentLevel = level;
        break;
      }
    }

    if (!currentLevel && levels.length > 0) {
      currentLevel = levels[levels.length - 1];
    }

    const nextLevel = currentLevel
      ? levels.find((l) => l.minPoints > currentLevel.minPoints) ?? null
      : null;

    return {
      level: currentLevel,
      nextLevel,
      points: rep.reputationPoints,
      progress: nextLevel
        ? Math.min(
            Math.round(
              ((rep.reputationPoints - (currentLevel?.minPoints ?? 0)) /
                (nextLevel.minPoints - (currentLevel?.minPoints ?? 0))) *
                100,
            ),
            100,
          )
        : 100,
    };
  }

  async awardReputation(
    userId: string,
    sourceUserId: string | null,
    type: ReputationTransactionType,
    points: number,
    entityId: string | null = null,
    entityType: string | null = null,
  ): Promise<void> {
    await this.addTransaction({
      userId,
      sourceUserId: sourceUserId ?? null,
      type,
      points,
      entityId,
      entityType,
      metadata: null as string | null,
    });
  }
}

export const reputationEngine = new ReputationEngine();
