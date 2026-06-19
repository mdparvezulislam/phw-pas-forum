"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDatabase, schema } from "@/db";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";
import { hashPassword } from "@/modules/auth/helpers";
import { userRepository } from "@/repositories";
import { auditService } from "@/services/audit";
import { createVerificationEmail, sendEmail } from "@/services/email";
import { rateLimiter } from "@/services/rate-limit";
import { RoleName } from "@/types/rbac";
import { registerSchema } from "@/validations/auth";

export type RegisterState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function register(
  prevState: RegisterState | undefined,
  formData: FormData,
): Promise<RegisterState> {
  const data = {
    username: formData.get("username") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    terms: formData.get("terms") === "on",
  };

  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: "Invalid form data",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { username, email, password } = parsed.data;
  const ip = "unknown";

  const rateCheck = await rateLimiter.check("REGISTER", ip);
  if (!rateCheck.allowed) {
    return { error: "Too many registration attempts. Please try again later." };
  }

  const db = getDatabase();

  const existingUser = await db.query.users.findFirst({
    where: (users, { or }) =>
      or(eq(users.email, email), eq(users.username, username)),
  });

  if (existingUser) {
    if (existingUser.email === email) {
      return { error: "An account with this email already exists" };
    }
    return { error: "This username is already taken" };
  }

  const passwordHash = await hashPassword(password);

  const memberRole = await db.query.roles.findFirst({
    where: (roles, { eq }) => eq(roles.name, RoleName.MEMBER),
  });

  const user = await userRepository.create({
    username,
    email,
    passwordHash,
    displayName: username,
    roleId: memberRole?.id ?? null,
    isVerified: false,
    isBanned: false,
    isTwoFactorEnabled: false,
    emailVerified: null,
  });

  await db.insert(schema.profiles).values({
    userId: user.id,
    displayName: username,
    status: "PENDING_VERIFICATION",
  });

  await auditService.log(user.id, AUDIT_ACTIONS.REGISTER, {
    metadata: { username, email },
  });

  // TODO: Generate and send verification email
  // const verificationToken = crypto.randomUUID();
  // await sendEmail(email, createVerificationEmail(username, verificationToken));

  return { success: true };
}
