import React from "react";
import { getDatabase, schema } from "@/db";
import MembershipClient from "./MembershipClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium Membership Plans",
  description: "Join VIP, VIP+, or Elite plans to unlock exclusive communities, marketplace features, and special reputation benefits.",
};

export default async function MembershipPage() {
  const db = getDatabase();

  // 1. Fetch plans
  let plans = await db.query.membershipPlans.findMany({
    orderBy: (p, { asc }) => asc(p.sortOrder),
  });

  // 2. If no plans exist, auto-seed defaults
  if (plans.length === 0) {
    console.log("Auto-seeding default membership plans and benefits...");

    const seededPlans = [
      {
        name: "VIP",
        slug: "VIP",
        description: "Unlock core VIP forum access and signature privileges.",
        badgeName: "VIP",
        monthlyPrice: 1999, // $19.99
        yearlyPrice: 14999, // $149.99
        lifetimePrice: 29999, // $299.99
        sortOrder: 10,
        isActive: true,
      },
      {
        name: "VIP+",
        slug: "VIP_PLUS",
        description: "Elevated messaging limits, profile covers, and free monthly boosts.",
        badgeName: "VIP+",
        monthlyPrice: 3999, // $39.99
        yearlyPrice: 29999, // $299.99
        lifetimePrice: 49999, // $499.99
        sortOrder: 20,
        isActive: true,
      },
      {
        name: "Elite",
        slug: "ELITE",
        description: "Unlimited conversations, priority support, and high listing boosts.",
        badgeName: "Elite",
        monthlyPrice: 9999, // $99.99
        yearlyPrice: 79999, // $799.99
        lifetimePrice: 119999, // $1199.99
        sortOrder: 30,
        isActive: true,
      },
      {
        name: "Lifetime Member",
        slug: "LIFETIME",
        description: "Maximum Elite tier features for life, with a custom glowing username.",
        badgeName: "Lifetime Member",
        monthlyPrice: 0, // Not available
        yearlyPrice: 0, // Not available
        lifetimePrice: 199999, // $1999.99
        sortOrder: 40,
        isActive: true,
      },
    ];

    for (const planData of seededPlans) {
      const result = await db.insert(schema.membershipPlans).values(planData).returning();
      const plan = result[0];

      // Add default benefits for each plan
      let benefitsData: Array<{ key: string; value: string }> = [];

      if (plan.slug === "VIP") {
        benefitsData = [
          { key: "premiumForums", value: "Access to VIP SEO & Case Studies" },
          { key: "extraPmLimit", value: "200 Private PM Threads limit" },
          { key: "attachmentLimit", value: "25 MB File attachments in PMs" },
          { key: "customSignature", value: "Custom signature links in posts" },
        ];
      } else if (plan.slug === "VIP_PLUS") {
        benefitsData = [
          { key: "premiumForums", value: "Access to All VIP Forums" },
          { key: "extraPmLimit", value: "500 Private PM Threads limit" },
          { key: "attachmentLimit", value: "100 MB File attachments in PMs" },
          { key: "customSignature", value: "HTML & Image signatures allowed" },
          { key: "sellerBoost", value: "3 Promoted Listing Boosts / Month" },
          { key: "customCover", value: "Custom profile themes and covers" },
        ];
      } else if (plan.slug === "ELITE") {
        benefitsData = [
          { key: "premiumForums", value: "Access to All VIP & Elite Forums" },
          { key: "extraPmLimit", value: "Unlimited Private PM Threads" },
          { key: "attachmentLimit", value: "500 MB File attachments in PMs" },
          { key: "customSignature", value: "Custom colored username highlight" },
          { key: "sellerBoost", value: "10 Promoted Listing Boosts / Month" },
          { key: "prioritySupport", value: "Priority support and moderation queue" },
        ];
      } else if (plan.slug === "LIFETIME") {
        benefitsData = [
          { key: "premiumForums", value: "All VIP & Elite Forums Access for Life" },
          { key: "extraPmLimit", value: "Unlimited Private PM Threads" },
          { key: "attachmentLimit", value: "500 MB File attachments in PMs" },
          { key: "customSignature", value: "Custom glowing username style" },
          { key: "sellerBoost", value: "10 Promoted Listing Boosts / Month" },
          { key: "badgeAssigned", value: "Special glowing Lifetime Member badge" },
        ];
      }

      for (const benefit of benefitsData) {
        await db.insert(schema.membershipBenefits).values({
          planId: plan.id,
          key: benefit.key,
          value: benefit.value,
        });
      }
    }

    // Refetch plans after seeding
    plans = await db.query.membershipPlans.findMany({
      orderBy: (p, { asc }) => asc(p.sortOrder),
    });
  }

  // 3. Fetch all plan benefits
  const benefits = await db.query.membershipBenefits.findMany();

  return (
    <div className="mx-auto max-w-7xl">
      <MembershipClient plans={plans} benefits={benefits} />
    </div>
  );
}
