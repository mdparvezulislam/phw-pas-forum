import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing",
};

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Get started with basic access to the community.",
    features: ["Forum read access", "Limited posts per day", "Standard PM limit", "Community support"],
  },
  {
    name: "Member",
    price: "$5",
    period: "/mo",
    description: "Full access to community features and basic marketplace.",
    features: ["Unlimited forum access", "Unlimited posts", "Increased PM limit", "Marketplace access", "Profile customization"],
  },
  {
    name: "VIP",
    price: "$19",
    period: "/mo",
    popular: true,
    description: "Premium access with VIP perks and marketplace boosts.",
    features: ["All Member features", "VIP-only forums", "Premium resources", "Listing boosts", "VIP badge", "Priority support"],
  },
  {
    name: "Lifetime",
    price: "$499",
    period: " once",
    description: "One-time payment for lifetime VIP+ access.",
    features: ["All VIP+ features", "Lifetime access", "No recurring fees", "Early adopter perks", "Founder badge", "Beta access"],
  },
];

export default function PricingPage() {
  return (
    <div className="pt-24">
      <div className="mx-auto max-w-screen-2xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">Simple, Transparent Pricing</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-xl border p-6 ${
                tier.popular
                  ? "border-premium/30 bg-premium/5 shadow-lg shadow-premium/10"
                  : "border-border bg-card"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-premium px-3 py-0.5 text-[10px] font-semibold text-premium-foreground">
                  Popular
                </div>
              )}
              <h3 className="text-lg font-bold">{tier.name}</h3>
              <div className="mt-3">
                <span className="text-3xl font-bold">{tier.price}</span>
                {tier.period && <span className="text-sm text-muted-foreground">{tier.period}</span>}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{tier.description}</p>
              <ul className="mt-6 space-y-2.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-premium" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className={`mt-6 flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-center text-sm font-semibold transition-all ${
                  tier.popular
                    ? "bg-premium text-premium-foreground shadow-lg shadow-premium/20 hover:bg-premium/90"
                    : "border border-border hover:bg-accent"
                }`}
              >
                Get Started
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
