"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDatabase, schema } from "@/db";
import { requireAuth, requireRole } from "@/modules/auth/guards";
import { auditService } from "@/services/audit";
import { MockBillingProvider } from "@/services/billing-provider";
import { membershipService } from "@/services/membership-service";
import { RoleName } from "@/types/rbac";

export interface ActionResponse<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Initiates the purchase flow by creating a checkout session and returning the URL.
 */
export async function selectPlanAction(
  planId: string,
  cycle: "MONTHLY" | "YEARLY" | "LIFETIME",
): Promise<ActionResponse<{ checkoutUrl: string }>> {
  try {
    const user = await requireAuth();
    const provider = new MockBillingProvider();
    const session = await provider.createCheckoutSession(
      user.id,
      planId,
      cycle,
    );
    return { success: true, data: { checkoutUrl: session.checkoutUrl } };
  } catch (error: any) {
    console.error("[selectPlanAction] failed:", error);
    return {
      success: false,
      error: error.message || "Failed to initiate plan checkout",
    };
  }
}

/**
 * Completes simulated checkout success page loads.
 */
export async function completeCheckoutAction(
  sessionId: string,
  planId: string,
  cycle: "MONTHLY" | "YEARLY" | "LIFETIME",
): Promise<ActionResponse<{ userMembershipId: string }>> {
  try {
    const user = await requireAuth();
    const result = await membershipService.activateMembership(
      user.id,
      planId,
      cycle,
    );
    revalidatePath("/membership");
    revalidatePath("/membership/dashboard");
    return {
      success: true,
      data: { userMembershipId: result.userMembershipId },
    };
  } catch (error: any) {
    console.error("[completeCheckoutAction] failed:", error);
    return {
      success: false,
      error: error.message || "Failed to complete checkout",
    };
  }
}

/**
 * Cancels an active subscription.
 */
export async function cancelSubscriptionAction(
  subscriptionId: string,
): Promise<ActionResponse> {
  try {
    const user = await requireAuth();
    const db = getDatabase();

    const sub = await db.query.subscriptions.findFirst({
      where: (s, { eq }) => eq(s.id, subscriptionId),
    });

    if (!sub) {
      throw new Error("Subscription not found");
    }

    if (sub.userId !== user.id) {
      throw new Error("Unauthorized to cancel this subscription");
    }

    const provider = new MockBillingProvider();
    await provider.cancelSubscription(subscriptionId);

    const now = new Date();
    await db
      .update(schema.userMemberships)
      .set({ autoRenew: false, status: "CANCELLED", updatedAt: now })
      .where(eq(schema.userMemberships.id, sub.membershipId));

    await db
      .update(schema.subscriptions)
      .set({ status: "cancelled", updatedAt: now })
      .where(eq(schema.subscriptions.id, subscriptionId));

    await auditService.log(user.id, "membership:cancelled", {
      resource: "subscription",
      resourceId: subscriptionId,
      metadata: { membershipId: sub.membershipId },
    });

    revalidatePath("/membership/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("[cancelSubscriptionAction] failed:", error);
    return {
      success: false,
      error: error.message || "Failed to cancel subscription",
    };
  }
}

/**
 * Purchases booster placement for a marketplace listing.
 */
export async function boostListingAction(
  listingId: string,
  boostType:
    | "FEATURED"
    | "TOP_POSITION"
    | "CATEGORY_SPOTLIGHT"
    | "HOMEPAGE_FEATURED",
  days: number,
): Promise<ActionResponse<{ boostId: string }>> {
  try {
    const user = await requireAuth();
    const db = getDatabase();

    const listing = await db.query.marketplaceListings.findFirst({
      where: (l, { eq }) => eq(l.id, listingId),
    });

    if (!listing) {
      throw new Error("Listing not found");
    }

    const seller = await db.query.sellerProfiles.findFirst({
      where: (s, { eq }) => eq(s.id, listing.sellerId),
    });

    if (!seller || seller.userId !== user.id) {
      throw new Error("Unauthorized to boost this listing");
    }

    const boostId = await membershipService.purchaseListingBoost(
      listingId,
      boostType,
      days,
      user.id,
    );

    revalidatePath(`/marketplace/listings/${listing.slug}`);
    return { success: true, data: { boostId } };
  } catch (error: any) {
    console.error("[boostListingAction] failed:", error);
    return {
      success: false,
      error: error.message || "Failed to boost listing",
    };
  }
}

/**
 * Creates a membership plan (Admin only).
 */
export async function createPlanAction(params: {
  name: string;
  slug: string;
  description?: string;
  badgeName: string;
  monthlyPrice: number;
  yearlyPrice: number;
  lifetimePrice: number;
  sortOrder: number;
}): Promise<ActionResponse<any>> {
  try {
    await requireRole(RoleName.ADMIN);
    const db = getDatabase();

    const newPlan = await db
      .insert(schema.membershipPlans)
      .values({
        name: params.name,
        slug: params.slug,
        description: params.description,
        badgeName: params.badgeName,
        monthlyPrice: params.monthlyPrice,
        yearlyPrice: params.yearlyPrice,
        lifetimePrice: params.lifetimePrice,
        sortOrder: params.sortOrder,
        isActive: true,
      })
      .returning();

    revalidatePath("/membership");
    revalidatePath("/admin/memberships");
    return { success: true, data: newPlan[0] };
  } catch (error: any) {
    console.error("[createPlanAction] failed:", error);
    return {
      success: false,
      error: error.message || "Failed to create membership plan",
    };
  }
}

/**
 * Creates a premium downloadable resource (Admin only).
 */
export async function createResourceAction(params: {
  title: string;
  description?: string;
  attachmentId?: string;
  requiredPlan: string;
  fileName?: string;
  fileSize?: number;
  url?: string;
}): Promise<ActionResponse<any>> {
  try {
    const user = await requireRole(RoleName.ADMIN);
    const db = getDatabase();

    let attachmentId = params.attachmentId;

    if (!attachmentId && params.fileName && params.url) {
      // Create a mock attachment
      const newAtt = await db
        .insert(schema.attachments)
        .values({
          uploaderId: user.id,
          fileName: params.fileName,
          originalName: params.fileName,
          mimeType: params.fileName.endsWith(".pdf")
            ? "application/pdf"
            : "application/zip",
          fileSize: params.fileSize || 1024 * 1024,
          storageKey: `resources/${params.fileName}`,
          url: params.url,
          status: "ACTIVE",
        })
        .returning({ id: schema.attachments.id });

      attachmentId = newAtt[0].id;
    }

    if (!attachmentId) {
      throw new Error("Attachment ID or file details must be provided");
    }

    const newResource = await db
      .insert(schema.premiumResources)
      .values({
        title: params.title,
        description: params.description,
        attachmentId,
        requiredPlan: params.requiredPlan,
      })
      .returning();

    revalidatePath("/resources");
    revalidatePath("/admin/memberships");
    return { success: true, data: newResource[0] };
  } catch (error: any) {
    console.error("[createResourceAction] failed:", error);
    return {
      success: false,
      error: error.message || "Failed to create resource",
    };
  }
}

/**
 * Deletes a premium resource (Admin only).
 */
export async function deleteResourceAction(
  id: string,
): Promise<ActionResponse> {
  try {
    await requireRole(RoleName.ADMIN);
    const db = getDatabase();

    await db
      .delete(schema.premiumResources)
      .where(eq(schema.premiumResources.id, id));

    revalidatePath("/resources");
    return { success: true };
  } catch (error: any) {
    console.error("[deleteResourceAction] failed:", error);
    return {
      success: false,
      error: error.message || "Failed to delete resource",
    };
  }
}
