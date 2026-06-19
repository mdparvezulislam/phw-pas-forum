"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDatabase, schema } from "@/db";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";
import { auditService } from "@/services/audit";

const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export type VerifyEmailState = {
  error?: string;
  success?: boolean;
};

export async function verifyEmail(
  prevState: VerifyEmailState | undefined,
  formData: FormData,
): Promise<VerifyEmailState> {
  const token = formData.get("token") as string;
  const parsed = verifyEmailSchema.safeParse({ token });

  if (!parsed.success) {
    return { error: "Invalid verification token" };
  }

  const db = getDatabase();

  const verificationToken = await db.query.verificationTokens.findFirst({
    where: (tokens, { eq, gt }) => eq(tokens.token, parsed.data.token),
  });

  if (!verificationToken) {
    return { error: "Invalid or expired verification token" };
  }

  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, verificationToken.identifier),
  });

  if (!user) {
    return { error: "User not found" };
  }

  await db
    .update(schema.users)
    .set({ emailVerified: new Date(), isVerified: true })
    .where(eq(schema.users.id, user.id));

  await db
    .update(schema.profiles)
    .set({ status: "ACTIVE" })
    .where(eq(schema.profiles.userId, user.id));

  await db
    .delete(schema.verificationTokens)
    .where(
      eq(schema.verificationTokens.identifier, verificationToken.identifier),
    );

  await auditService.log(user.id, AUDIT_ACTIONS.VERIFY_EMAIL);

  return { success: true };
}
