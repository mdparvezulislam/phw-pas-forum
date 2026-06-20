import type { Metadata } from "next";
import Link from "next/link";
import { Check, Crown, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Premium Membership",
};

const plans = [
  {
    name: "Member",
    price: "Free",
    description: "Access to community forums and basic marketplace features.",
    features: ["Forum access", "Basic marketplace access", "Standard PM limits", "Community support"],
  },
  {
    name: "VIP",
    price: "$19",
    period: "/mo",
    description: "Everything in Member, plus premium forums, resources, and boosts.",
    popular: true,
    features: [
      "All Member features",
      "VIP-only forums",
      "Premium resource downloads",
      "Marketplace listing boosts",
      "Priority support",
      "VIP profile badge",
      "Increased PM limits",
    ],
  },
  {
    name: "VIP+",
    price: "$39",
    period: "/mo",
    description: "Everything in VIP, plus enhanced boosts and exclusive access.",
    features: [
      "All VIP features",
      "Enhanced listing boosts",
      "Exclusive community events",
      "Early access to features",
      "Dedicated support channel",
      "Custom profile styling",
      "Analytics dashboard",
    ],
  },
  {
    name: "Elite",
    price: "$79",
    period: "/mo",
    description: "Maximum platform access with premium perks and priority treatment.",
    features: [
      "All VIP+ features",
      "Maximum listing boosts",
      "Featured seller placement",
      "API access",
      "White-label options",
      "Personal account manager",
      "Enterprise-grade support",
    ],
  },
];

export default function PremiumPage() {
  return (
    <div className="pt-24">
      <div className="mx-auto max-w-screen-2xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-premium/20 bg-premium/5 px-3.5 py-1 text-xs font-medium text-premium">
            <Crown className="h-3 w-3" />
            Premium Membership
          </div>
          <h1 className="text-4xl font-bold sm:text-5xl">Unlock Your Potential</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that fits your needs and take your experience to the next level.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-6 ${
                plan.popular
                  ? "border-premium/30 bg-premium/5 shadow-lg shadow-premium/10"
                  : "border-border bg-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-premium px-3 py-0.5 text-[10px] font-semibold text-premium-foreground">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <div className="mt-3">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{plan.description}</p>
              <ul className="mt-6 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-premium" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.price === "Free" ? "/auth/register" : "/auth/register?plan=" + plan.name.toLowerCase()}
                className={`mt-6 flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-center text-sm font-semibold transition-all ${
                  plan.popular
                    ? "bg-premium text-premium-foreground shadow-lg shadow-premium/20 hover:bg-premium/90"
                    : "border border-border hover:bg-accent"
                }`}
              >
                {plan.price === "Free" ? "Get Started" : "Upgrade"}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
