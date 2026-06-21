"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDatabase, schema } from "@/db";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";
import { requireAuth, requireRole } from "@/modules/auth/guards";
import { auditService } from "@/services/audit";
import { reputationEngine } from "@/services/reputation-engine";
import { RoleName } from "@/types/rbac";
import { adminReputationAwardSchema } from "@/validations/reputation";

export async function awardReputation(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireAuth();
  await requireRole(RoleName.ADMIN);

  const parsed = adminReputationAwardSchema.safeParse({
    userId: formData.get("userId"),
    points: Number(formData.get("points")),
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) return { error: "Invalid award data" };

  await reputationEngine.awardReputation(
    parsed.data.userId,
    user.id,
    "ADMIN_AWARD",
    parsed.data.points,
    "",
    "admin",
  );

  await auditService.log(user.id, AUDIT_ACTIONS.ADMIN_REPUTATION_AWARD, {
    resource: "reputation",
    resourceId: parsed.data.userId,
    metadata: {
      points: parsed.data.points,
      reason: parsed.data.reason,
    },
  });

  revalidatePath("/admin/reputation");
  return { success: true };
}
