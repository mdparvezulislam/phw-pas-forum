"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDatabase, schema } from "@/db";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";
import { requireAuth } from "@/modules/auth/guards";
import { emitEvent, createEventId, type ReactionCreatedEvent, type ReactionRemovedEvent } from "@/lib/event-bus";
import { auditService } from "@/services/audit";
import { achievementEngine } from "@/services/achievement-engine";
import {
  getReputationPointsForReaction,
  reputationEngine,
} from "@/services/reputation-engine";
import { toggleReactionSchema } from "@/validations/reputation";

export interface ReactionState {
  error?: string;
  success?: boolean;
  reaction?: {
    id: string;
    type: string;
    targetId: string;
    targetType: string;
  } | null;
}

export async function toggleReaction(
  prevState: ReactionState | undefined,
  formData: FormData,
): Promise<ReactionState> {
  const user = await requireAuth();

  const parsed = toggleReactionSchema.safeParse({
    targetId: formData.get("targetId"),
    targetType: formData.get("targetType"),
    reactionType: formData.get("reactionType"),
  });

  if (!parsed.success) {
    return { error: "Invalid reaction data" };
  }

  const db = getDatabase();
  const { targetId, targetType, reactionType } = parsed.data;

  const existing = await db.query.reactions.findFirst({
    where: (r, { and: andFn, eq: eqFn }) =>
      andFn(eqFn(r.userId, user.id), eqFn(r.targetId, targetId), eqFn(r.targetType, targetType)),
  });

  if (existing) {
    if (existing.reactionType === reactionType) {
      await db
        .delete(schema.reactions)
        .where(eq(schema.reactions.id, existing.id));

      await db
        .update(schema.threads)
        .set({
          reactionCount: sql`GREATEST(${schema.threads.reactionCount} - 1, 0)`,
        })
        .where(eq(schema.threads.id, targetId));

      await auditService.log(user.id, AUDIT_ACTIONS.REACTION_REMOVED, {
        resource: "reaction",
        resourceId: existing.id,
        metadata: { targetId, targetType, reactionType },
      });

      const ownerId = await getTargetOwner(targetId, targetType);
      if (ownerId && ownerId !== user.id) {
        const points = getReputationPointsForReaction(reactionType);
        await reputationEngine.awardReputation(
          ownerId,
          user.id,
          "POST_REACTION",
          -points,
          targetId,
          targetType.toLowerCase(),
        );
      }

      revalidatePath(`/forums`);
      return { success: true, reaction: null };
    }

    await db
      .update(schema.reactions)
      .set({ reactionType })
      .where(eq(schema.reactions.id, existing.id));

    const oldPoints = getReputationPointsForReaction(existing.reactionType);
    const newPoints = getReputationPointsForReaction(reactionType);
    const diff = newPoints - oldPoints;

    const ownerId = await getTargetOwner(targetId, targetType);
    if (ownerId && ownerId !== user.id && diff !== 0) {
      await reputationEngine.awardReputation(
        ownerId,
        user.id,
        "POST_REACTION",
        diff,
        targetId,
        targetType.toLowerCase(),
      );
    }

    revalidatePath(`/forums`);
    return {
      success: true,
      reaction: {
        id: existing.id,
        type: reactionType,
        targetId,
        targetType,
      },
    };
  }

  const [reaction] = await db
    .insert(schema.reactions)
    .values({
      userId: user.id,
      targetId,
      targetType,
      reactionType,
    })
    .returning();

  await db
    .update(schema.threads)
    .set({
      reactionCount: sql`${schema.threads.reactionCount} + 1`,
    })
    .where(eq(schema.threads.id, targetId));

  await auditService.log(user.id, AUDIT_ACTIONS.REACTION_CREATED, {
    resource: "reaction",
    resourceId: reaction.id,
    metadata: { targetId, targetType, reactionType },
  });

  const ownerId = await getTargetOwner(targetId, targetType);
  if (ownerId && ownerId !== user.id) {
    const points = getReputationPointsForReaction(reactionType);
    await reputationEngine.awardReputation(
      ownerId,
      user.id,
      targetType === "POST" ? "POST_REACTION" : "THREAD_REACTION",
      points,
      targetId,
      targetType.toLowerCase(),
    );

    await achievementEngine.checkAndAwardBadges(ownerId);
    await achievementEngine.checkAndAwardTrophies(ownerId);

    // Emit reaction event for notifications
    await emitEvent({
      id: createEventId(),
      type: "REACTION_CREATED",
      timestamp: new Date(),
      actorId: user.id,
      reactionId: reaction.id,
      targetId,
      targetType: targetType as "POST" | "THREAD",
      reactionType,
      targetAuthorId: ownerId!,
    } as ReactionCreatedEvent);
  }

  revalidatePath(`/forums`);
  return {
    success: true,
    reaction: {
      id: reaction.id,
      type: reactionType,
      targetId,
      targetType,
    },
  };
}

async function getTargetOwner(
  targetId: string,
  targetType: string,
): Promise<string | null> {
  const db = getDatabase();

  if (targetType === "THREAD") {
    const thread = await db.query.threads.findFirst({
      where: (t, { eq }) => eq(t.id, targetId),
      columns: { authorId: true },
    });
    return thread?.authorId ?? null;
  }

  const post = await db.query.posts.findFirst({
    where: (p, { eq }) => eq(p.id, targetId),
    columns: { authorId: true },
  });
  return post?.authorId ?? null;
}
