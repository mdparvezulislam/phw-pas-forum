import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthLayout } from "@/components/auth";
import { ResetPasswordForm } from "@/modules/auth/components";

export const metadata: Metadata = {
  title: "Reset password",
};

function ResetFallback() {
  return (
    <div className="py-8 text-center text-sm text-muted-foreground">
      Loading...
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your new password below"
    >
      <Suspense fallback={<ResetFallback />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
