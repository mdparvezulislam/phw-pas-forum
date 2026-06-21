"use server";

import { revalidatePath } from "next/cache";
import type { MarketplaceFlagReason } from "@/db/schema/marketplace-flags";
import type { SellerVerificationAppStatus } from "@/db/schema/seller-verifications";
import { requireAuth, requireRole } from "@/modules/auth/guards";
import { marketplaceModerationService } from "@/services/marketplace-moderation";
import { RoleName } from "@/types/rbac";

export async function submitListingAction(
  threadId: string,
  price: number,
  paymentDetails?: string,
): Promise<{ success: boolean; submissionId?: string; error?: string }> {
  try {
    const user = await requireAuth();
    const submissionId = await marketplaceModerationService.submitListing({
      threadId,
      price,
      paymentDetails,
      sellerId: user.id,
    });
    revalidatePath("/forums");
    return { success: true, submissionId };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function reviewSubmissionAction(
  submissionId: string,
  decision: "APPROVE" | "REJECT" | "REQUEST_CHANGES",
  notes: string,
  rejectionReason?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireRole(RoleName.MODERATOR);
    if (decision === "APPROVE") {
      await marketplaceModerationService.approveSubmission(
        submissionId,
        user.id,
        notes,
      );
    } else if (decision === "REJECT") {
      await marketplaceModerationService.rejectSubmission(
        submissionId,
        user.id,
        rejectionReason || notes,
      );
    } else if (decision === "REQUEST_CHANGES") {
      await marketplaceModerationService.requestChanges(
        submissionId,
        user.id,
        notes,
      );
    } else {
      throw new Error("Invalid review decision");
    }
    revalidatePath("/mod/marketplace");
    revalidatePath("/mod/marketplace/queue");
    revalidatePath("/forums");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function reportListingAction(
  listingId: string,
  reason: MarketplaceFlagReason,
  notes?: string,
): Promise<{ success: boolean; flagId?: string; error?: string }> {
  try {
    const user = await requireAuth();
    const flagId = await marketplaceModerationService.flagListing({
      listingId,
      userId: user.id,
      reason,
      notes,
    });
    revalidatePath("/forums");
    return { success: true, flagId };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function applyForVerificationAction(
  notes?: string,
): Promise<{ success: boolean; verificationId?: string; error?: string }> {
  try {
    const user = await requireAuth();
    const verificationId =
      await marketplaceModerationService.applyForVerification(user.id, notes);
    return { success: true, verificationId };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function verifySellerAction(
  sellerId: string,
  status: SellerVerificationAppStatus,
  verificationLevel: string,
  notes: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireRole(RoleName.MODERATOR);
    await marketplaceModerationService.verifySeller(
      sellerId,
      status,
      verificationLevel,
      notes,
      user.id,
    );
    revalidatePath("/mod/marketplace");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function toggleFeaturedAction(
  threadId: string,
  featuredDays: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireRole(RoleName.MODERATOR);
    await marketplaceModerationService.toggleFeaturedListing(
      threadId,
      featuredDays,
      user.id,
    );
    revalidatePath("/forums");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}
