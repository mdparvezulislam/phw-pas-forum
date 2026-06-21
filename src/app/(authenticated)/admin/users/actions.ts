"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDatabase, schema } from "@/db";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";
import { auth } from "@/lib/auth";
import { adminStaffService } from "@/services/admin-staff";
import { auditService } from "@/services/audit";

export async function updateUserRoleAction(userId: string, roleId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const db = getDatabase();

  const [user, newRole] = await Promise.all([
    db.query.users.findFirst({
      where: eq(schema.users.id, userId),
      with: { role: true },
    }),
    db.query.roles.findFirst({
      where: eq(schema.roles.id, roleId),
    }),
  ]);

  if (!user) throw new Error("User not found");
  if (!newRole) throw new Error("Role not found");

  const oldRoleName = user.role?.name ?? "NONE";

  await db
    .update(schema.users)
    .set({ roleId })
    .where(eq(schema.users.id, userId));

  await auditService.log(session.user.id, AUDIT_ACTIONS.STAFF_ROLE_ASSIGNED, {
    resource: "user",
    resourceId: userId,
    metadata: { oldRole: oldRoleName, newRole: newRole.name },
  });

  revalidatePath("/admin/users");
}
