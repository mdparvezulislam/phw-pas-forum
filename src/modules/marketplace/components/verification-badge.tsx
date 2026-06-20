import { CheckCircle, Shield, Award, AlertCircle } from "lucide-react";
import type { SellerVerificationAppStatus } from "@/db/schema/seller-verifications";

export function VerificationBadge({ status }: { status: SellerVerificationAppStatus }) {
  if (status === "UNVERIFIED") return null;

  const config = {
    VERIFIED: {
      label: "Verified Seller",
      className: "from-emerald-500/10 to-teal-500/10 text-emerald-400 border-emerald-500/20",
      icon: CheckCircle,
    },
    TRUSTED: {
      label: "Trusted Vendor",
      className: "from-blue-500/10 to-indigo-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.15)]",
      icon: Shield,
    },
    TOP_SELLER: {
      label: "Top Seller",
      className: "from-amber-500/10 to-orange-500/10 text-amber-400 border-amber-500/20 font-bold shadow-[0_0_12px_rgba(245,158,11,0.15)]",
      icon: Award,
    },
    PENDING: {
      label: "Verification Pending",
      className: "from-yellow-500/5 to-amber-500/5 text-yellow-500 border-yellow-500/15",
      icon: AlertCircle,
    },
    SUSPENDED: {
      label: "Seller Suspended",
      className: "from-red-500/10 to-rose-500/10 text-red-400 border-red-500/20",
      icon: AlertCircle,
    },
  }[status];

  if (!config) return null;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-gradient-to-r ${config.className} transition-all duration-300 hover:scale-105`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}
