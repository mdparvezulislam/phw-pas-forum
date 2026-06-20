import "server-only";
import { and, eq } from "drizzle-orm";
import { getDatabase, schema } from "@/db";
import { auditService } from "@/services/audit";
import { RoleName } from "@/types/rbac";
import { createEventId, emitEvent } from "@/lib/event-bus";

export class MembershipService {
  /**
   * Activate or upgrade a user's membership.
   */
  async activateMembership(
    userId: string,
    planId: string,
    cycle: "MONTHLY" | "YEARLY" | "LIFETIME"
  ): Promise<{ userMembershipId: string; subscriptionId?: string }> {
    const db = getDatabase();

    // 1. Fetch the plan
    const plan = await db.query.membershipPlans.findFirst({
      where: (plans, { eq }) => eq(plans.id, planId),
    });
    if (!plan) {
      throw new Error(`Membership plan with ID ${planId} not found`);
    }

    // Calculate expiration date
    let expiresAt: Date | null = null;
    if (cycle === "MONTHLY") {
      expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else if (cycle === "YEARLY") {
      expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } // LIFETIME stays null (never expires)

    const now = new Date();

    // Check if there is an active membership
    const existingMembership = await db.query.userMemberships.findFirst({
      where: (m, { and, eq }) =>
        and(eq(m.userId, userId), eq(m.status, "ACTIVE")),
      with: {
        plan: true,
      },
    });

    let userMembershipId = "";
    let isUpgrade = false;
    let oldPlanId: string | null = null;

    if (existingMembership) {
      isUpgrade = plan.sortOrder > existingMembership.plan.sortOrder;
      oldPlanId = existingMembership.planId;
      userMembershipId = existingMembership.id;

      // Update existing membership
      await db
        .update(schema.userMemberships)
        .set({
          planId,
          status: "ACTIVE",
          startedAt: now,
          expiresAt,
          updatedAt: now,
        })
        .where(eq(schema.userMemberships.id, userMembershipId));
    } else {
      // Create new user membership
      const newMembership = await db
        .insert(schema.userMemberships)
        .values({
          userId,
          planId,
          status: "ACTIVE",
          startedAt: now,
          expiresAt,
          autoRenew: cycle !== "LIFETIME",
        })
        .returning({ id: schema.userMemberships.id });

      userMembershipId = newMembership[0].id;
    }

    // 2. Create subscription record if cycle is not LIFETIME
    let subscriptionId: string | undefined;
    if (cycle !== "LIFETIME") {
      // Cancel any active subscriptions first
      const activeSubs = await db.query.subscriptions.findMany({
        where: (subs, { and, eq }) =>
          and(eq(subs.userId, userId), eq(subs.status, "active")),
      });
      for (const sub of activeSubs) {
        await db
          .update(schema.subscriptions)
          .set({ status: "cancelled", updatedAt: now })
          .where(eq(schema.subscriptions.id, sub.id));
      }

      const nextBillingDate = expiresAt;
      const newSub = await db
        .insert(schema.subscriptions)
        .values({
          userId,
          membershipId: userMembershipId,
          billingCycle: cycle,
          status: "active",
          nextBillingDate,
        })
        .returning({ id: schema.subscriptions.id });

      subscriptionId = newSub[0].id;
    }

    // 3. Update the user's role.
    // If the plan has a badgeName/slug like "VIP", we assign the corresponding system role.
    let targetRoleName = RoleName.VIP;
    if (plan.slug.includes("ELITE") || plan.slug.includes("VIP")) {
      targetRoleName = RoleName.VIP;
    } else if (plan.slug.includes("SELLER")) {
      targetRoleName = RoleName.SELLER;
    } else if (plan.slug.includes("MEMBER")) {
      targetRoleName = RoleName.MEMBER;
    }

    const role = await db.query.roles.findFirst({
      where: (r, { eq }) => eq(r.name, targetRoleName),
    });

    if (role) {
      await db
        .update(schema.users)
        .set({ roleId: role.id, updatedAt: now })
        .where(eq(schema.users.id, userId));
    }

    // 4. Log audit trails
    const auditAction = isUpgrade
      ? "membership:upgraded"
      : "membership:purchased";

    await auditService.log(userId, auditAction, {
      resource: "membership",
      resourceId: userMembershipId,
      metadata: {
        planId,
        planSlug: plan.slug,
        cycle,
        oldPlanId,
      },
    });

    // 5. Emit Event
    if (isUpgrade) {
      await emitEvent({
        id: createEventId(),
        timestamp: new Date(),
        type: "MEMBERSHIP_UPGRADED",
        actorId: userId,
        userId,
        oldPlanId,
        newPlanId: planId,
        membershipId: userMembershipId,
      });
    } else {
      await emitEvent({
        id: createEventId(),
        timestamp: new Date(),
        type: "MEMBERSHIP_PURCHASED",
        actorId: userId,
        userId,
        planId,
        planSlug: plan.slug,
        membershipId: userMembershipId,
      });
    }

    // Also emit badge assignment if it's a VIP plan
    if (plan.badgeName) {
      await emitEvent({
        id: createEventId(),
        timestamp: new Date(),
        type: "VIP_BADGE_ASSIGNED",
        actorId: userId,
        userId,
        badgeName: plan.badgeName,
      });
    }

    return { userMembershipId, subscriptionId };
  }

  /**
   * Renew a membership subscription.
   */
  async renewMembership(membershipId: string): Promise<void> {
    const db = getDatabase();
    const membership = await db.query.userMemberships.findFirst({
      where: (m, { eq }) => eq(m.id, membershipId),
      with: {
        plan: true,
      },
    });

    if (!membership || membership.status !== "ACTIVE") {
      throw new Error(`Active membership ${membershipId} not found for renewal`);
    }

    const sub = await db.query.subscriptions.findFirst({
      where: (s, { and, eq }) =>
        and(eq(s.membershipId, membershipId), eq(s.status, "active")),
    });

    if (!sub) return;

    let expiresAt = membership.expiresAt || new Date();
    if (sub.billingCycle === "MONTHLY") {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else if (sub.billingCycle === "YEARLY") {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    const now = new Date();
    await db
      .update(schema.userMemberships)
      .set({ expiresAt, updatedAt: now })
      .where(eq(schema.userMemberships.id, membershipId));

    await db
      .update(schema.subscriptions)
      .set({ nextBillingDate: expiresAt, updatedAt: now })
      .where(eq(schema.subscriptions.id, sub.id));

    await auditService.log(membership.userId, "membership:renewed", {
      resource: "membership",
      resourceId: membershipId,
      metadata: { planId: membership.planId, expiresAt },
    });

    await emitEvent({
      id: createEventId(),
      timestamp: new Date(),
      type: "MEMBERSHIP_RENEWED",
      actorId: membership.userId,
      userId: membership.userId,
      planId: membership.planId,
      membershipId,
    });
  }

  /**
   * Expire a membership and revert roles.
   */
  async expireMembership(membershipId: string): Promise<void> {
    const db = getDatabase();
    const membership = await db.query.userMemberships.findFirst({
      where: (m, { eq }) => eq(m.id, membershipId),
    });

    if (!membership || membership.status !== "ACTIVE") return;

    const now = new Date();
    await db
      .update(schema.userMemberships)
      .set({ status: "EXPIRED", updatedAt: now })
      .where(eq(schema.userMemberships.id, membershipId));

    await db
      .update(schema.subscriptions)
      .set({ status: "expired", updatedAt: now })
      .where(eq(schema.subscriptions.membershipId, membershipId));

    // Revert role back to MEMBER
    const memberRole = await db.query.roles.findFirst({
      where: (r, { eq }) => eq(r.name, RoleName.MEMBER),
    });

    if (memberRole) {
      await db
        .update(schema.users)
        .set({ roleId: memberRole.id, updatedAt: now })
        .where(eq(schema.users.id, membership.userId));
    }

    await auditService.log(membership.userId, "membership:expired", {
      resource: "membership",
      resourceId: membershipId,
      metadata: { planId: membership.planId },
    });

    await emitEvent({
      id: createEventId(),
      timestamp: new Date(),
      type: "MEMBERSHIP_EXPIRED",
      actorId: membership.userId,
      userId: membership.userId,
      planId: membership.planId,
      membershipId,
    });
  }

  /**
   * Check if a user has access to a specific premium level.
   */
  async hasPremiumAccess(
    userId: string,
    requiredPlanSlug: string
  ): Promise<boolean> {
    const db = getDatabase();

    // 1. Fetch required plan to get its sortOrder
    const requiredPlan = await db.query.membershipPlans.findFirst({
      where: (p, { eq }) => eq(p.slug, requiredPlanSlug),
    });
    if (!requiredPlan) return false;

    // 2. Fetch user's active membership
    const activeMembership = await db.query.userMemberships.findFirst({
      where: (m, { and, eq }) =>
        and(eq(m.userId, userId), eq(m.status, "ACTIVE")),
      with: {
        plan: true,
      },
    });

    if (!activeMembership) return false;

    // Check expiration if not lifetime (expiresAt is not null)
    if (activeMembership.expiresAt && activeMembership.expiresAt < new Date()) {
      // Auto-expire it
      await this.expireMembership(activeMembership.id);
      return false;
    }

    // Compare sort order
    return activeMembership.plan.sortOrder >= requiredPlan.sortOrder;
  }

  /**
   * Purchase a listing boost.
   */
  async purchaseListingBoost(
    listingId: string,
    type: "FEATURED" | "TOP_POSITION" | "CATEGORY_SPOTLIGHT" | "HOMEPAGE_FEATURED",
    days: number,
    userId: string
  ): Promise<string> {
    const db = getDatabase();
    const startedAt = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    const newBoost = await db
      .insert(schema.listingBoosts)
      .values({
        listingId,
        type,
        startedAt,
        expiresAt,
      })
      .returning({ id: schema.listingBoosts.id });

    // Update listing to featured if type is FEATURED
    if (type === "FEATURED") {
      await db
        .update(schema.marketplaceListings)
        .set({ featured: true })
        .where(eq(schema.marketplaceListings.id, listingId));
    }

    await auditService.log(userId, "listing_boost:purchased", {
      resource: "listing_boost",
      resourceId: newBoost[0].id,
      metadata: { listingId, type, days },
    });

    return newBoost[0].id;
  }
}

export const membershipService = new MembershipService();
