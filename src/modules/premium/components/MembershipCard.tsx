"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, ShieldAlert, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { selectPlanAction } from "../actions/premium";
import { cn } from "@/lib/utils";

interface Benefit {
  key: string;
  value: string;
}

interface MembershipPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  badgeName: string;
  monthlyPrice: number;
  yearlyPrice: number;
  lifetimePrice: number;
}

interface MembershipCardProps {
  plan: MembershipPlan;
  benefits: Benefit[];
  onSelectPlan: (planId: string, cycle: "MONTHLY" | "YEARLY" | "LIFETIME") => void;
  isLoading?: boolean;
}

export function MembershipCard({ plan, benefits, onSelectPlan, isLoading }: MembershipCardProps) {
  const [cycle, setCycle] = useState<"MONTHLY" | "YEARLY" | "LIFETIME">("MONTHLY");

  // Determine card aesthetics based on plan tier
  const isVip = plan.slug.toUpperCase() === "VIP";
  const isVipPlus = plan.slug.toUpperCase() === "VIP_PLUS" || plan.slug.toUpperCase() === "VIP+";
  const isElite = plan.slug.toUpperCase() === "ELITE";
  const isLifetime = plan.slug.toUpperCase() === "LIFETIME";

  let bgGradient = "from-zinc-950 via-zinc-900 to-zinc-950 border-zinc-800";
  let glowColor = "rgba(255,255,255,0.05)";
  let accentColor = "text-zinc-400";
  let titleGradient = "from-white to-zinc-400";
  let badgeColor = "bg-zinc-800 text-zinc-300 border-zinc-700";

  if (isVip) {
    bgGradient = "from-indigo-950/40 via-zinc-900/90 to-indigo-950/40 border-indigo-500/30";
    glowColor = "rgba(99, 102, 241, 0.15)";
    accentColor = "text-indigo-400";
    titleGradient = "from-indigo-400 to-cyan-400";
    badgeColor = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
  } else if (isVipPlus) {
    bgGradient = "from-violet-950/40 via-zinc-900/90 to-violet-950/40 border-violet-500/30";
    glowColor = "rgba(139, 92, 246, 0.18)";
    accentColor = "text-violet-400";
    titleGradient = "from-violet-400 to-fuchsia-400";
    badgeColor = "bg-violet-500/10 text-violet-400 border-violet-500/20";
  } else if (isElite) {
    bgGradient = "from-amber-950/40 via-zinc-900/90 to-amber-950/40 border-amber-500/35";
    glowColor = "rgba(245, 158, 11, 0.2)";
    accentColor = "text-amber-400";
    titleGradient = "from-amber-400 to-yellow-200";
    badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  } else if (isLifetime) {
    bgGradient = "from-emerald-950/40 via-zinc-900/90 to-emerald-950/40 border-emerald-500/35";
    glowColor = "rgba(16, 185, 129, 0.22)";
    accentColor = "text-emerald-400";
    titleGradient = "from-emerald-400 to-teal-200";
    badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  }

  const getPrice = () => {
    if (cycle === "MONTHLY") return plan.monthlyPrice / 100;
    if (cycle === "YEARLY") return plan.yearlyPrice / 100;
    return plan.lifetimePrice / 100;
  };

  const getPriceLabel = () => {
    if (cycle === "MONTHLY") return "/mo";
    if (cycle === "YEARLY") return "/yr";
    return " one-time";
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-gradient-to-b p-8 shadow-2xl backdrop-blur-md",
        bgGradient
      )}
      style={{
        boxShadow: `0 10px 30px -10px rgba(0,0,0,0.5), 0 0 25px 0 ${glowColor}`,
      }}
    >
      {/* Decorative top glow reflection */}
      <div className="absolute top-0 left-1/4 h-[1px] w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Plan Header */}
      <div>
        <div className="flex items-center justify-between">
          <span className={cn("text-xs font-semibold tracking-wider uppercase border px-2 py-0.5 rounded-full", badgeColor)}>
            {plan.badgeName}
          </span>
          {(isElite || isLifetime) && (
            <span className="flex items-center gap-1 text-xs text-amber-400">
              <Sparkles className="h-3 w-3 animate-pulse" /> Popular
            </span>
          )}
        </div>

        <h3 className={cn("mt-4 text-3xl font-extrabold tracking-tight bg-gradient-to-r bg-clip-text text-transparent", titleGradient)}>
          {plan.name}
        </h3>

        <p className="mt-2 text-sm text-zinc-400 min-h-[40px]">
          {plan.description || "Unlock premium platform benefits, priority support, and special items."}
        </p>

        {/* Pricing Cycle Toggles */}
        <div className="mt-6 flex justify-between bg-zinc-950/60 p-1 rounded-lg border border-zinc-800/80">
          <button
            onClick={() => setCycle("MONTHLY")}
            className={cn(
              "flex-1 text-center py-1.5 text-xs font-semibold rounded-md transition-all duration-200",
              cycle === "MONTHLY" ? "bg-zinc-800 text-white shadow-inner" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setCycle("YEARLY")}
            className={cn(
              "flex-1 text-center py-1.5 text-xs font-semibold rounded-md transition-all duration-200",
              cycle === "YEARLY" ? "bg-zinc-800 text-white shadow-inner" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Yearly
          </button>
          <button
            onClick={() => setCycle("LIFETIME")}
            className={cn(
              "flex-1 text-center py-1.5 text-xs font-semibold rounded-md transition-all duration-200",
              cycle === "LIFETIME" ? "bg-zinc-800 text-white shadow-inner" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Lifetime
          </button>
        </div>

        {/* Pricing tag */}
        <div className="mt-6 flex items-baseline">
          <span className="text-4xl font-extrabold tracking-tight text-white">${getPrice()}</span>
          <span className="ml-1 text-sm font-medium text-zinc-400">{getPriceLabel()}</span>
        </div>

        <div className="mt-6 h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

        {/* Benefits Checklist */}
        <ul className="mt-6 space-y-3.5">
          {benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-emerald-500/10 p-0.5 text-emerald-400 border border-emerald-500/20">
                <Check className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm text-zinc-300 font-medium">
                {benefit.value}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action button */}
      <div className="mt-8">
        <Button
          onClick={() => onSelectPlan(plan.id, cycle)}
          disabled={isLoading}
          className={cn(
            "w-full h-11 text-sm font-semibold transition-all duration-300 transform active:scale-95 shadow-md",
            isVip || isVipPlus
              ? "bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/30"
              : isElite
              ? "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold border border-amber-400/20"
              : isLifetime
              ? "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white border border-emerald-400/20"
              : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
          )}
        >
          {isLoading ? "Processing Checkout..." : `Get ${plan.name}`}
        </Button>
      </div>
    </motion.div>
  );
}
