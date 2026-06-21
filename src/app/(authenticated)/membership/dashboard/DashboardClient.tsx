"use client";

import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cancelSubscriptionAction } from "@/modules/premium/actions/premium";

interface Subscription {
  id: string;
  status: string;
  billingCycle: string;
  nextBillingDate: Date | null;
  createdAt: Date;
}

interface UserMembership {
  id: string;
  status: string;
  startedAt: Date;
  expiresAt: Date | null;
  autoRenew: boolean;
  plan: {
    name: string;
    slug: string;
    description: string | null;
    badgeName: string;
  };
}

interface DashboardClientProps {
  membership: UserMembership | null;
  subscription: Subscription | null;
}

export default function DashboardClient({
  membership,
  subscription,
}: DashboardClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!subscription) return;
    if (
      !confirm(
        "Are you sure you want to cancel your active subscription renewal? You will retain access until the end of your billing cycle.",
      )
    )
      return;

    setLoading(true);
    setError(null);

    const res = await cancelSubscriptionAction(subscription.id);
    if (res.success) {
      // Reload page to reflect changes
      window.location.reload();
    } else {
      setError(res.error || "Failed to cancel subscription.");
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-white">
          Membership Dashboard
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Manage your premium plan status, renewal options, and active benefits.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!membership ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center space-y-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500">
            <XCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">
              No Active Membership
            </h2>
            <p className="text-sm text-zinc-400">
              Upgrade your account to access premium case studies, private
              forums, resources, and custom badges.
            </p>
          </div>
          <Link href="/membership" passHref>
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md">
              View Plans
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Subscription Status Card */}
          <div className="md:col-span-2 rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-6 shadow-xl relative overflow-hidden">
            {/* Glowing decoration */}
            <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-indigo-600/10 blur-[30px]" />

            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
              <div>
                <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                  Active Tier
                </span>
                <h2 className="text-2xl font-black text-white mt-0.5">
                  {membership.plan.name}
                </h2>
              </div>
              <span
                className={cn(
                  "text-xs font-semibold px-3 py-1 rounded-full border",
                  membership.status === "ACTIVE"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : membership.status === "CANCELLED"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700",
                )}
              >
                {membership.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-zinc-500 shrink-0" />
                <div>
                  <div className="text-xs text-zinc-500">Activated On</div>
                  <div className="text-sm font-semibold text-zinc-300">
                    {formatDate(membership.startedAt)}
                  </div>
                </div>
              </div>

              {membership.expiresAt && (
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 text-zinc-500 shrink-0" />
                  <div>
                    <div className="text-xs text-zinc-500">
                      {membership.autoRenew ? "Renews On" : "Expires On"}
                    </div>
                    <div className="text-sm font-semibold text-zinc-300">
                      {formatDate(membership.expiresAt)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-zinc-900 pt-4 flex items-center justify-between">
              <div className="text-xs text-zinc-500">
                {subscription ? (
                  <>
                    Billed via{" "}
                    <span className="font-semibold text-zinc-300">
                      {subscription.billingCycle}
                    </span>{" "}
                    cycle
                  </>
                ) : (
                  "Lifetime Purchase (No recurring bills)"
                )}
              </div>

              {subscription &&
                membership.status === "ACTIVE" &&
                membership.autoRenew && (
                  <Button
                    onClick={handleCancel}
                    disabled={loading}
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold h-8"
                  >
                    {loading ? "Canceling..." : "Cancel Auto-Renew"}
                  </Button>
                )}
            </div>
          </div>

          {/* Benefits summary sidebar */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-6 shadow-xl">
            <h3 className="font-bold text-white text-base border-b border-zinc-900 pb-3 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-400" /> Account Perks
            </h3>
            <ul className="space-y-4">
              <li className="text-xs text-zinc-400 flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <div>
                  <div className="font-semibold text-zinc-200">
                    VIP Gated Forums
                  </div>
                  <div>Full write/read access enabled.</div>
                </div>
              </li>
              <li className="text-xs text-zinc-400 flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <div>
                  <div className="font-semibold text-zinc-200">
                    Elevated PM Limits
                  </div>
                  <div>Upgraded direct messaging capacity active.</div>
                </div>
              </li>
              <li className="text-xs text-zinc-400 flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <div>
                  <div className="font-semibold text-zinc-200">
                    Download Privileges
                  </div>
                  <div>Premium guides and resources center unlocked.</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
