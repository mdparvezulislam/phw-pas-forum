"use server";

import { z } from "zod";
import { getDatabase, schema } from "@/db";
import { eq, and, gt, isNull } from "drizzle-orm";
import { hashPassword } from "@/modules/auth/helpers";
import { auditService } from "@/services/audit";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";

const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters").max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function resetPassword(
  prevState: ResetPasswordState | undefined,
  formData: FormData,
): Promise<ResetPasswordState> {
  const data = {
    token: formData.get("token") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = resetPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: "Invalid form data",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const db = getDatabase();

  const resetToken = await db.query.passwordResetTokens.findFirst({
    where: (tokens, { eq, and, gt, isNull }) =>
      and(
        eq(tokens.token, parsed.data.token),
        gt(tokens.expiresAt, new Date()),
        isNull(tokens.usedAt),
      ),
  });

  if (!resetToken) {
    return { error: "Invalid or expired reset token" };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await db
    .update(schema.users)
    .set({ passwordHash })
    .where(eq(schema.users.id, resetToken.userId));

  await db
    .update(schema.passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(schema.passwordResetTokens.id, resetToken.id));

  await auditService.log(resetToken.userId, AUDIT_ACTIONS.RESET_PASSWORD);

  return { success: true };
}
