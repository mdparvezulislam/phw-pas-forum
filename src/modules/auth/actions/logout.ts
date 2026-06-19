"use server";

import { signOut, auth } from "@/lib/auth";
import { auditService } from "@/services/audit";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";

export async function logout() {
  const session = await auth();
  if (session?.user?.id) {
    await auditService.log(session.user.id, AUDIT_ACTIONS.LOGOUT);
  }

  await signOut({ redirect: false });
}
