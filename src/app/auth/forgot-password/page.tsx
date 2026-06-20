import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth";
import { ForgotPasswordForm } from "@/modules/auth/components";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your email and we&apos;ll send you reset instructions"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
