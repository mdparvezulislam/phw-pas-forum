import type { Metadata } from "next";
import { RegisterForm } from "@/modules/auth/components";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Join our community
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
