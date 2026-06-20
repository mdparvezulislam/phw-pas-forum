"use client";

import React, { useState } from "react";
import { MembershipCard, PricingTable } from "@/modules/premium/components";
import { selectPlanAction } from "@/modules/premium/actions/premium";
import { AlertCircle, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface Benefit {
  planId: string;
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

interface MembershipClientProps {
  plans: MembershipPlan[];
  benefits: Benefit[];
}

export default function MembershipClient({ plans, benefits }: MembershipClientProps) {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSelectPlan = async (planId: string, cycle: "MONTHLY" | "YEARLY" | "LIFETIME") => {
    setLoadingPlanId(planId);
    setError(null);

    const res = await selectPlanAction(planId, cycle);
    if (res.success && res.data?.checkoutUrl) {
      // In a real application, we redirect to Stripe or Paddle.
      // In our mock provider, we redirect to /membership/checkout-success?session_id=...
      router.push(res.data.checkoutUrl);
    } else {
      setError(res.error || "Failed to initiate purchase flow. Please try again.");
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-400">
          <Sparkles className="h-4 w-4 text-indigo-400" /> Premium Monetezation Engine Active
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Upgrade Your Community Experience
        </h1>
        <p className="text-base text-zinc-400 md:text-lg">
          Join our premium plans to unlock private forums, premium guides, advanced tools, elevated limits, and special badges.
        </p>
      </div>

      {error && (
        <div className="mx-auto max-w-md flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const planBenefits = benefits
            .filter((b) => b.planId === plan.id)
            .map((b) => ({ key: b.key, value: b.value }));

          return (
            <MembershipCard
              key={plan.id}
              plan={plan}
              benefits={planBenefits}
              onSelectPlan={handleSelectPlan}
              isLoading={loadingPlanId === plan.id}
            />
          );
        })}
      </div>

      {/* Feature Gating Comparison */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Compare Premium Features
          </h2>
          <p className="text-sm text-zinc-400">
            Compare plans side-by-side to find the right level for your community operations.
          </p>
        </div>

        <PricingTable />
      </div>
    </div>
  );
}
