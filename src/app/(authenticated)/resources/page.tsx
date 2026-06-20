import React from "react";
import { getDatabase, schema } from "@/db";
import { requireAuth } from "@/modules/auth/guards";
import ResourcesClient from "./ResourcesClient";
import { RoleName } from "@/types/rbac";
import { isAtLeast } from "@/config/rbac";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium Resource Center",
  description: "Browse and download exclusive SEO scripts, software, guides, and tools.",
};

export default async function ResourcesPage() {
  const user = await requireAuth();
  const db = getDatabase();

  // 1. Fetch user's active membership plan to check sortOrder
  const activeMembership = await db.query.userMemberships.findFirst({
    where: (m, { and, eq }) =>
      and(eq(m.userId, user.id), eq(m.status, "ACTIVE")),
    with: {
      plan: true,
    },
  });

  const userActivePlanSortOrder = activeMembership?.plan?.sortOrder ?? 0;

  // 2. Fetch plans map
  const plans = await db.query.membershipPlans.findMany();
  const plansMap: Record<string, number> = {};
  for (const p of plans) {
    plansMap[p.slug.toUpperCase()] = p.sortOrder;
  }

  // 3. Fetch premium resources
  let resources = await db.query.premiumResources.findMany({
    with: {
      attachment: true,
    },
    orderBy: (pr, { desc }) => [desc(pr.createdAt)],
  });

  // 4. Auto-seed mock resources if empty
  if (resources.length === 0) {
    console.log("Auto-seeding default premium resources...");

    // Insert mock attachment records
    const mockAttachments = [
      {
        uploaderId: user.id,
        fileName: "seo_cheatsheet_2026.pdf",
        originalName: "SEO Blueprint 2026.pdf",
        mimeType: "application/pdf",
        fileSize: 4500000, // 4.5 MB
        storageKey: "resources/seo_cheatsheet_2026.pdf",
        url: "https://file-examples.com/wp-content/uploads/2017/10/file-example_PDF_500_kB.pdf", // Mock URL
        status: "ACTIVE" as const,
      },
      {
        uploaderId: user.id,
        fileName: "ctr_booster_script.zip",
        originalName: "CTR Booster Tool.zip",
        mimeType: "application/zip",
        fileSize: 15400000, // 15.4 MB
        storageKey: "resources/ctr_booster_script.zip",
        url: "https://file-examples.com/wp-content/uploads/2017/02/zip_2MB.zip",
        status: "ACTIVE" as const,
      },
      {
        uploaderId: user.id,
        fileName: "niche_research_insights.xlsx",
        originalName: "High Margin Niches Database.xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        fileSize: 1200000, // 1.2 MB
        storageKey: "resources/niche_research_insights.xlsx",
        url: "https://file-examples.com/wp-content/uploads/2017/02/file_example_XLSX_10.xlsx",
        status: "ACTIVE" as const,
      },
    ];

    for (const mockAtt of mockAttachments) {
      const attResult = await db.insert(schema.attachments).values(mockAtt).returning();
      const att = attResult[0];

      let requiredPlan = "VIP";
      let title = "";
      let description = "";

      if (mockAtt.fileName.includes("seo")) {
        requiredPlan = "VIP";
        title = "BlackHatWorld SEO Method Cheat Sheet (2026 Edition)";
        description = "Step-by-step framework to index new websites in under 24 hours and rank on the first page using high quality tier 2 links.";
      } else if (mockAtt.fileName.includes("ctr")) {
        requiredPlan = "VIP_PLUS";
        title = "CTR Automation Click Booster Tool";
        description = "Automates simulated organic traffic clicks from custom residential proxy lists to boost CTR rank scores on major search networks.";
      } else {
        requiredPlan = "ELITE";
        title = "High-Margin E-Commerce Niche Intelligence Sheet";
        description = "Filtered list of 500+ low-competition, high-margin e-commerce product niches compiled using organic search volume tools.";
      }

      await db.insert(schema.premiumResources).values({
        title,
        description,
        attachmentId: att.id,
        requiredPlan,
      });
    }

    // Refetch resources
    resources = await db.query.premiumResources.findMany({
      with: {
        attachment: true,
      },
      orderBy: (pr, { desc }) => [desc(pr.createdAt)],
    });
  }

  // 5. Check if user is Admin or Moderator
  const isAdmin = isAtLeast(user, RoleName.ADMIN);

  // Clean data types for presentation
  const cleanedResources = resources.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    requiredPlan: r.requiredPlan,
    createdAt: r.createdAt,
    attachment: r.attachment
      ? {
          fileName: r.attachment.originalName,
          fileSize: r.attachment.fileSize,
          mimeType: r.attachment.mimeType,
          url: r.attachment.url,
        }
      : undefined,
  }));

  return (
    <div className="mx-auto max-w-7xl">
      <ResourcesClient
        resources={cleanedResources}
        userActivePlanSortOrder={userActivePlanSortOrder}
        isAdmin={isAdmin}
        plansMap={plansMap}
      />
    </div>
  );
}
