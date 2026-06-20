"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { cn } from "@/lib/utils";
import { register } from "@/modules/auth/actions";
import { PasswordStrength } from "@/components/auth";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      {/* Username */}
      <div className="space-y-1.5">
        <label htmlFor="username" className="text-xs font-medium text-muted-foreground">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          placeholder="Choose a username"
          required
          autoComplete="username"
          autoFocus
          className={cn(
            "w-full rounded-xl border bg-card px-4 py-2.5 text-sm shadow-sm transition-all",
            "placeholder:text-muted-foreground/50",
            "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
          )}
        />
        {state?.fieldErrors?.username && (
          <p className="text-xs text-destructive">{state.fieldErrors.username[0]}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
          className={cn(
            "w-full rounded-xl border bg-card px-4 py-2.5 text-sm shadow-sm transition-all",
            "placeholder:text-muted-foreground/50",
            "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
          )}
        />
        {state?.fieldErrors?.email && (
          <p className="text-xs text-destructive">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            required
            autoComplete="new-password"
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
        <PasswordStrength password={password} />
        {state?.fieldErrors?.password && (
          <p className="text-xs text-destructive">{state.fieldErrors.password[0]}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="text-xs font-medium text-muted-foreground">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-enter your password"
            required
            autoComplete="new-password"
            className={cn(
              "w-full rounded-xl border bg-card px-4 py-2.5 pr-11 text-sm shadow-sm transition-all",
              "placeholder:text-muted-foreground/50",
              "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
            )}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {state?.fieldErrors?.confirmPassword && (
          <p className="text-xs text-destructive">{state.fieldErrors.confirmPassword[0]}</p>
        )}
      </div>

      {/* Success */}
      {state?.success && (
        <div className="flex items-start gap-2.5 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Account created! Check your email to verify.</span>
        </div>
      )}

      {/* Error */}
      {state?.error && (
        <div className="flex items-start gap-2.5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Terms Checkbox */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="terms"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-muted-foreground/30 text-primary focus:ring-primary/20"
        />
        <span className="text-xs text-muted-foreground leading-relaxed">
          I agree to the{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </span>
      </label>
      {state?.fieldErrors?.terms && (
        <p className="text-xs text-destructive">{state.fieldErrors.terms[0]}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={pending || !agreed}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold shadow-sm transition-all",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </button>

      {/* Login link */}
      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
