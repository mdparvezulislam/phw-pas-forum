import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/modules/auth/components";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Forgot password?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you reset instructions
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
