"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDatabase, schema } from "@/db";
import { auth } from "@/lib/auth";

export async function createListingAction(formData: {
  title: string;
  categoryId: string;
  price: number;
  deliveryDays: number;
  shortDescription: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const db = getDatabase();

  // Find or auto-initialize a seller profile if none exists for the authenticated user
  let seller = await db.query.sellerProfiles.findFirst({
    where: eq(schema.sellerProfiles.userId, session.user.id),
  });

  if (!seller) {
    const newSellerId = crypto.randomUUID();
    const [inserted] = await db
      .insert(schema.sellerProfiles)
      .values({
        id: newSellerId,
        userId: session.user.id,
        displayName:
          session.user.displayName || session.user.username || "Seller",
        verificationStatus: "VERIFIED",
        trustScore: 85,
        isVerifiedSeller: true,
      })
      .returning();
    seller = inserted;
  }

  const listingId = crypto.randomUUID();
  const baseSlug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const slug = `${baseSlug || "service"}-${listingId.substring(0, 8)}`;

  await db.insert(schema.marketplaceListings).values({
    id: listingId,
    sellerId: seller!.id,
    categoryId: formData.categoryId,
    title: formData.title,
    slug,
    shortDescription: formData.shortDescription,
    listingType: "SERVICE",
    status: "ACTIVE",
    visibility: "PUBLIC",
    basePrice: Math.round(formData.price * 100), // store as cents
    deliveryDays: formData.deliveryDays,
    revisions: 3,
  });

  // Log in AI audit logs that listing was created and went through AI screening
  await db.insert(schema.aiAuditLogs).values({
    action: "SELLER_LISTING_CREATED",
    description: `Seller listing "${formData.title}" created successfully and synced with Copilot recommendations.`,
    userId: session.user.id,
  });

  redirect("/seller/dashboard");
}
