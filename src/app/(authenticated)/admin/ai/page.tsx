import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AIAnalyticsDashboard } from "@/modules/ai/components/AIAnalyticsDashboard";
import { RoleName } from "@/types/rbac";

export const metadata: Metadata = {
  title: "AI Management Center | Admin",
  description: "Prompt configurations, cost limits, and audit logs dashboard.",
};

export default async function AdminAIPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  // Enforce ADMIN role protection
  const userRole = session.user.role;
  if (userRole !== RoleName.ADMIN && userRole !== RoleName.SUPER_ADMIN) {
    redirect("/forbidden");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          AI Analytics & Controls
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage system-wide prompt libraries, cost caps, and view audit
          history.
        </p>
      </div>
      <AIAnalyticsDashboard />
    </div>
  );
}
