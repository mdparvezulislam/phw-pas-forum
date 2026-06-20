import React from "react";
import { getDatabase } from "@/db";
import { requireAuth } from "@/modules/auth/guards";
import DashboardClient from "./DashboardClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Membership Dashboard",
  description: "View and manage your active membership status and subscription renewals.",
};

export default async function MembershipDashboardPage() {
  const user = await requireAuth();
  const db = getDatabase();

  // 1. Fetch active membership
  const activeMembership = await db.query.userMemberships.findFirst({
    where: (m, { and, eq }) =>
      and(eq(m.userId, user.id), eq(m.status, "ACTIVE")),
    with: {
      plan: true,
    },
  });

  // 2. Fetch active subscription
  let activeSub = null;
  if (activeMembership) {
    const sub = await db.query.subscriptions.findFirst({
      where: (s, { and, eq }) =>
        and(
          eq(s.membershipId, activeMembership.id),
          eq(s.status, "active")
        ),
    });
    if (sub) {
      activeSub = {
        id: sub.id,
        status: sub.status,
        billingCycle: sub.billingCycle,
        nextBillingDate: sub.nextBillingDate,
        createdAt: sub.createdAt,
      };
    }
  }

  // Map to clean types for serialized components
  const cleanedMembership = activeMembership
    ? {
        id: activeMembership.id,
        status: activeMembership.status,
        startedAt: activeMembership.startedAt,
        expiresAt: activeMembership.expiresAt,
        autoRenew: activeMembership.autoRenew,
        plan: {
          name: activeMembership.plan.name,
          slug: activeMembership.plan.slug,
          description: activeMembership.plan.description,
          badgeName: activeMembership.plan.badgeName,
        },
      }
    : null;

  return (
    <div className="mx-auto max-w-7xl">
      <DashboardClient membership={cleanedMembership} subscription={activeSub} />
    </div>
  );
}
