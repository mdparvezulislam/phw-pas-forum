"use server";

import { z } from "zod";
import { getDatabase, schema } from "@/db";
import { eq } from "drizzle-orm";
import { rateLimiter } from "@/services/rate-limit";
import { auditService } from "@/services/audit";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";
import { sendEmail, createPasswordResetEmail } from "@/services/email";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type ForgotPasswordState = {
  error?: string;
  success?: boolean;
};

export async function forgotPassword(
  prevState: ForgotPasswordState | undefined,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = formData.get("email") as string;
  const parsed = forgotPasswordSchema.safeParse({ email });

  if (!parsed.success) {
    return { error: "Invalid email address" };
  }

  const ip = "unknown";
  const rateCheck = await rateLimiter.check("LOGIN", `${ip}:forgot:${email}`);
  if (!rateCheck.allowed) {
    return {
      error: "Too many requests. Please try again later.",
    };
  }

  const db = getDatabase();
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, parsed.data.email),
  });

  if (!user) {
    return { success: true };
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db.insert(schema.passwordResetTokens).values({
    userId: user.id,
    token,
    expiresAt,
  });

  await auditService.log(user.id, AUDIT_ACTIONS.FORGOT_PASSWORD);

  // const { subject, html } = createPasswordResetEmail(
  //   user.displayName ?? user.username ?? "User",
  //   token,
  // );
  // await sendEmail({ to: email, subject, html });

  return { success: true };
}
