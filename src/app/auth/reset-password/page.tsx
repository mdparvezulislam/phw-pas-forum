import type { Metadata } from "next";
import { ResetPasswordForm } from "@/modules/auth/components";

export const metadata: Metadata = {
  title: "Reset password",
};

export default async function ResetPasswordPage(props: {
  searchParams: Promise<{ token?: string }>;
}) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Invalid reset link</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This password reset link is invalid or has expired.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your new password below
        </p>
      </div>
      <ResetPasswordForm token={token} />
    </div>
  );
}
