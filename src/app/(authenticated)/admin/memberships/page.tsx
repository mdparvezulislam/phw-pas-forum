import React from "react";
import { getDatabase } from "@/db";
import { requireRole } from "@/modules/auth/guards";
import { RoleName } from "@/types/rbac";
import AdminMembershipClient from "./AdminMembershipClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Membership Settings",
  description: "Configure plans, assign tiers, and manage downloads.",
};

export default async function AdminMembershipsPage() {
  // Ensure the user has admin role
  await requireRole(RoleName.ADMIN);

  const db = getDatabase();

  // 1. Fetch plans
  const plans = await db.query.membershipPlans.findMany({
    orderBy: (p, { asc }) => asc(p.sortOrder),
  });

  // 2. Fetch resources with attachments
  const resources = await db.query.premiumResources.findMany({
    with: {
      attachment: true,
    },
    orderBy: (r, { desc }) => [desc(r.createdAt)],
  });

  // 3. Fetch users with roles and active memberships
  const dbUsers = await db.query.users.findMany({
    limit: 50,
    with: {
      role: true,
      memberships: {
        where: (m, { eq }) => eq(m.status, "ACTIVE"),
        with: {
          plan: true,
        },
      },
    },
  });

  // Clean data types for serialization
  const cleanedPlans = plans.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    badgeName: p.badgeName,
    monthlyPrice: p.monthlyPrice,
    yearlyPrice: p.yearlyPrice,
    lifetimePrice: p.lifetimePrice,
    sortOrder: p.sortOrder,
  }));

  const cleanedResources = resources.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    requiredPlan: r.requiredPlan,
    attachmentFileName: r.attachment?.originalName,
  }));

  const cleanedUsers = dbUsers.map((u) => {
    const activeMem = u.memberships?.[0];
    return {
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      email: u.email,
      role: u.role?.name || "MEMBER",
      membershipStatus: activeMem?.status,
      membershipId: activeMem?.id,
      membershipPlanName: activeMem?.plan?.name,
    };
  });

  return (
    <div className="mx-auto max-w-7xl">
      <AdminMembershipClient
        plans={cleanedPlans}
        resources={cleanedResources}
        users={cleanedUsers}
      />
    </div>
  );
}
