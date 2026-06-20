import type { Metadata } from "next";
import Link from "next/link";
import { AuthLayout } from "@/components/auth";
import { VerifyEmailForm } from "@/modules/auth/components";

export const metadata: Metadata = {
  title: "Verify email",
};

export default async function VerifyEmailPage(props: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;

  if (!token) {
    return (
      <AuthLayout title="Invalid verification link">
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7 text-destructive"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">
            This verification link is invalid or has expired.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Click the button below to verify your email address"
    >
      <VerifyEmailForm token={token} />
    </AuthLayout>
  );
}
