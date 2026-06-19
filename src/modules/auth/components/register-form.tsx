"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button, Input, Label } from "@/components/ui";
import { register } from "@/modules/auth/actions";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          type="text"
          placeholder="johndoe"
          required
          autoComplete="username"
          minLength={3}
          maxLength={30}
        />
        {state?.fieldErrors?.username && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.username[0]}
          </p>
        )}
      </div>

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
        {state?.fieldErrors?.email && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Create a strong password"
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
          placeholder="Confirm your password"
          required
          autoComplete="new-password"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          required
          className="h-4 w-4 accent-primary"
        />
        <Label htmlFor="terms" className="text-xs text-muted-foreground">
          I accept the{" "}
          <a href="/terms" className="text-foreground hover:underline">
            terms and conditions
          </a>
        </Label>
      </div>

      {state?.error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
