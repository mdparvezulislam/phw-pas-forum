"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/modules/auth/actions";
import { Button, Input, Label } from "@/components/ui";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPassword, undefined);

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
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">Check your email</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          If an account with that email exists, we&apos;ve sent password reset
          instructions.
        </p>
        <Link
          href="/auth/login"
          className="mt-4 inline-block text-sm text-foreground hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
      </div>

      {state?.error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending..." : "Send reset instructions"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/auth/login" className="text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
