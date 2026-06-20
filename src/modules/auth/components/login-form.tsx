"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { login } from "@/modules/auth/actions";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(login, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (state?.success) {
      router.push("/");
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-5">
      {/* Email / Username */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
          Email or Username
        </label>
        <div className="relative">
          <input
            id="email"
            name="email"
            type="text"
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
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
            Password
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-xs font-medium text-primary hover:underline"
          >
            Forgot?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
            className={cn(
              "w-full rounded-xl border bg-card px-4 py-2.5 pr-11 text-sm shadow-sm transition-all",
              "placeholder:text-muted-foreground/50",
              "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
              password && "border-primary/30",
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Error */}
      {state?.error && (
        <div className="flex items-start gap-2.5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={pending || !email || !password}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold shadow-sm transition-all",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">New here?</span>
        </div>
      </div>

      {/* Register link */}
      <Link
        href="/auth/register"
        className="flex w-full items-center justify-center rounded-xl border py-2.5 text-sm font-medium transition-colors hover:bg-accent"
      >
        Create an account
      </Link>
    </form>
  );
}
