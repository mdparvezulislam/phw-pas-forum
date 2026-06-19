import { getEnv } from "@/validations/env";

export const authConfig = {
  pages: {
    signIn: "/auth/login",
    signUp: "/auth/register",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
  },
  callbacks: {
    session: {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      updateAge: 24 * 60 * 60, // 24 hours
    },
  },
  providers: {
    credentials: {
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
    },
  },
} as const;

export function getAuthSecret(): string {
  return getEnv().AUTH_SECRET;
}

export function getAuthUrl(): string | undefined {
  return getEnv().AUTH_URL;
}
