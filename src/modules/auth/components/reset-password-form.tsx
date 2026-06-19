"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button, Input, Label } from "@/components/ui";
import { resetPassword } from "@/modules/auth/actions";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, formAction, pending] = useActionState(resetPassword, undefined);

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
        <h3 className="text-lg font-semibold">Password reset</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Your password has been successfully reset.
        </p>
        <Link
          href="/auth/login"
          className="mt-4 inline-block text-sm text-foreground hover:underline"
        >
          Sign in with new password
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter new password"
          required
          autoComplete="new-password"
          minLength={8}
        />
        {state?.fieldErrors?.password && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          required
          autoComplete="new-password"
        />
      </div>

      {state?.error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Resetting..." : "Reset password"}
      </Button>
    </form>
  );
}
