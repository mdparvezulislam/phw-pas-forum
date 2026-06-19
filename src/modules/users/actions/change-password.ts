"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDatabase, schema } from "@/db";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";
import { auth } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/modules/auth/helpers";
import { auditService } from "@/services/audit";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function changePassword(
  prevState: ChangePasswordState | undefined,
  formData: FormData,
): Promise<ChangePasswordState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Authentication required" };
  }

  const data = {
    currentPassword: formData.get("currentPassword") as string,
    newPassword: formData.get("newPassword") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = changePasswordSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: "Invalid form data",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const db = getDatabase();
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, session.user.id),
  });

  if (!user || !user.passwordHash) {
    return { error: "User not found" };
  }

  const isValid = await verifyPassword(
    parsed.data.currentPassword,
    user.passwordHash,
  );

  if (!isValid) {
    return { error: "Current password is incorrect" };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);

  await db
    .update(schema.users)
    .set({ passwordHash })
    .where(eq(schema.users.id, session.user.id));

  await auditService.log(session.user.id, AUDIT_ACTIONS.CHANGE_PASSWORD);

  return { success: true };
}
