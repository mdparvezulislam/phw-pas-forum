import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth";
import { LoginForm } from "@/modules/auth/components";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account">
      <LoginForm />
    </AuthLayout>
  );
}
