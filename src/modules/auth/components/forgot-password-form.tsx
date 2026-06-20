"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { cn } from "@/lib/utils";
import { forgotPassword } from "@/modules/auth/actions";
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPassword, undefined);
  const [email, setEmail] = useState("");

  return (
    <form action={formAction} className="space-y-5">
      {state?.success ? (
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Check your email for reset instructions.</span>
          </div>
          <Link
            href="/auth/login"
            className="flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we&apos;ll send you instructions to reset your password.
          </p>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              autoFocus
              className={cn(
                "w-full rounded-xl border bg-card px-4 py-2.5 text-sm shadow-sm transition-all",
                "placeholder:text-muted-foreground/50",
                "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
                email && "border-primary/30",
              )}
            />
          </div>

          {state?.error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={pending || !email}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold shadow-sm transition-all",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send reset instructions"
            )}
          </button>

          <Link
            href="/auth/login"
            className="flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </>
      )}
    </form>
  );
}
