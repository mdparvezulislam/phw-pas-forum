import Link from "next/link";
import { Check, ArrowRight, Crown } from "lucide-react";

const benefits = [
  "Access to VIP-only forums",
  "Premium resource downloads",
  "Marketplace listing boosts",
  "Priority customer support",
  "Early access to new features",
  "Increased PM limits",
  "Profile badge & recognition",
  "Exclusive community events",
];

export function PremiumSection() {
  return (
    <section className="border-t border-border py-20">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-premium/20 bg-gradient-to-br from-premium/5 via-background to-premium/5">
          <div className="grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-premium/20 bg-premium/10 px-3 py-1 text-xs font-medium text-premium">
                <Crown className="h-3 w-3" />
                Premium Membership
              </div>
              <h2 className="text-3xl font-bold sm:text-4xl">
                Unlock the Full Experience
              </h2>
              <p className="mt-3 text-muted-foreground">
                Upgrade to VIP and get access to premium forums, exclusive resources,
                marketplace boosts, and priority support.
              </p>
              <ul className="mt-6 space-y-3">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2.5 text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-premium/10 text-premium">
                      <Check className="h-3 w-3" />
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
              <Link
                href="/premium"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-premium px-6 py-3 text-sm font-semibold text-premium-foreground shadow-lg shadow-premium/20 transition-all hover:bg-premium/90 hover:shadow-xl hover:shadow-premium/30"
              >
                View Plans
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-premium/5 blur-3xl" />
                <div className="relative rounded-2xl border border-premium/10 bg-premium/5 p-8">
                  <p className="text-center text-5xl font-bold text-premium">VIP</p>
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    Starting from
                  </p>
                  <p className="mt-1 text-center text-4xl font-bold">
                    $19<span className="text-lg font-normal text-muted-foreground">/mo</span>
                  </p>
                  <div className="mt-6 space-y-2 text-center text-sm text-muted-foreground">
                    <p>Cancel anytime &middot; Annual plans available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
