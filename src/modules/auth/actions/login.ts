"use server";

import { AuthError } from "next-auth";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";
import { signIn } from "@/lib/auth";
import { userRepository } from "@/repositories";
import { auditService } from "@/services/audit";
import { rateLimiter } from "@/services/rate-limit";

export type LoginState = {
  error?: string;
  success?: boolean;
};

export async function login(
  prevState: LoginState | undefined,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const ip = "unknown";
  const rateCheck = await rateLimiter.check("LOGIN", `${ip}:${email}`);
  if (!rateCheck.allowed) {
    return {
      error: "Too many login attempts. Please try again later.",
    };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    const user = await userRepository.findByEmail(email);
    if (user) {
      await userRepository.updateLastLogin(user.id);
      await auditService.log(user.id, AUDIT_ACTIONS.LOGIN);
      await rateLimiter.reset("LOGIN", `${ip}:${email}`);
    }

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { error: "Invalid email or password" };
      }
      return { error: "Authentication failed" };
    }
    throw error;
  }
}
