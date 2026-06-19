import type { Metadata } from "next";
import { VerifyEmailForm } from "@/modules/auth/components";

export const metadata: Metadata = {
  title: "Verify email",
};

export default async function VerifyEmailPage(props: {
  searchParams: Promise<{ token?: string }>;
}) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Invalid verification link</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This verification link is invalid or has expired.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Verify your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Click the button below to verify your email address
        </p>
      </div>
      <VerifyEmailForm token={token} />
    </div>
  );
}
