"use client";

import { useActionState } from "react";
import Link from "next/link";
import { verifyEmail } from "@/modules/auth/actions";
import { Button } from "@/components/ui";

interface VerifyEmailFormProps {
  token: string;
}

export function VerifyEmailForm({ token }: VerifyEmailFormProps) {
  const [state, formAction, pending] = useActionState(verifyEmail, undefined);

  if (state?.success) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
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
            className="text-primary"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">Email verified</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Your email has been successfully verified.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm text-foreground hover:underline"
        >
          Go to home
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      {state?.error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Verifying..." : "Verify email"}
      </Button>
    </form>
  );
}
