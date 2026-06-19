import "server-only";

import { getEnv } from "@/validations/env";

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const env = getEnv();

  if (env.NODE_ENV === "development") {
    console.log("[Email] Dev mode - email not sent:", {
      to: options.to,
      subject: options.subject,
    });
    return;
  }

  // TODO: Integrate with an email service (Resend, SendGrid, SES, etc.)
  // await resend.emails.send({ ... });
  console.log("[Email] Sending email:", {
    to: options.to,
    subject: options.subject,
  });
}

export function createVerificationEmail(
  username: string,
  token: string,
): { subject: string; html: string } {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;

  return {
    subject: "Verify your email address",
    html: `
      <h1>Welcome, ${username}!</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${url}">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `,
  };
}

export function createPasswordResetEmail(
  username: string,
  token: string,
): { subject: string; html: string } {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

  return {
    subject: "Reset your password",
    html: `
      <h1>Password Reset</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${url}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  };
}
