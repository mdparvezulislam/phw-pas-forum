"use server";

import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";
import { auth, signOut } from "@/lib/auth";
import { auditService } from "@/services/audit";

export async function logout() {
  const session = await auth();
  if (session?.user?.id) {
    await auditService.log(session.user.id, AUDIT_ACTIONS.LOGOUT);
  }

  await signOut({ redirect: false });
}
