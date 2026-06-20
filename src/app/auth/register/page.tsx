import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth";
import { RegisterForm } from "@/modules/auth/components";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <AuthLayout title="Create an account" subtitle="Join our community">
      <RegisterForm />
    </AuthLayout>
  );
}
