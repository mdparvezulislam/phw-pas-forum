"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
  bg: string;
} {
  if (!password) return { score: 0, label: "", color: "", bg: "" };

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score: 1, label: "Weak", color: "text-red-500", bg: "bg-red-500" };
  if (score <= 2) return { score: 2, label: "Fair", color: "text-orange-500", bg: "bg-orange-500" };
  if (score <= 3) return { score: 3, label: "Good", color: "text-yellow-500", bg: "bg-yellow-500" };
  if (score <= 4) return { score: 4, label: "Strong", color: "text-emerald-500", bg: "bg-emerald-500" };
  return { score: 5, label: "Very Strong", color: "text-emerald-600", bg: "bg-emerald-600" };
}

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  if (!password) return null;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              level <= strength.score ? strength.bg : "bg-muted",
            )}
          />
        ))}
      </div>
      <p className={cn("text-xs font-medium", strength.color)}>
        {strength.label}
      </p>
    </div>
  );
}
