import {
  AlertCircle,
  Award,
  CheckCircle,
  Crown,
  Gem,
  Shield,
  Star,
} from "lucide-react";
import type { SellerVerificationAppStatus } from "@/db/schema/seller-verifications";
import { cn } from "@/lib/utils";

interface TrustBadgeProps {
  status: SellerVerificationAppStatus | string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
}

const badgeConfig: Record<
  string,
  {
    label: string;
    icon: typeof CheckCircle;
    bg: string;
    text: string;
    border: string;
    glow?: string;
  }
> = {
  TOP_SELLER: {
    label: "Top Seller",
    icon: Crown,
    bg: "bg-gradient-to-r from-amber-500/15 to-orange-500/15",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/25",
    glow: "shadow-[0_0_16px_rgba(245,158,11,0.2)]",
  },
  TRUSTED: {
    label: "Trusted",
    icon: Shield,
    bg: "bg-gradient-to-r from-blue-500/15 to-indigo-500/15",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/25",
    glow: "shadow-[0_0_12px_rgba(59,130,246,0.15)]",
  },
  VERIFIED: {
    label: "Verified",
    icon: CheckCircle,
    bg: "bg-gradient-to-r from-emerald-500/15 to-teal-500/15",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/25",
  },
  PENDING: {
    label: "Pending",
    icon: AlertCircle,
    bg: "bg-gradient-to-r from-yellow-500/10 to-amber-500/10",
    text: "text-yellow-600 dark:text-yellow-500",
    border: "border-yellow-500/20",
  },
  SUSPENDED: {
    label: "Suspended",
    icon: AlertCircle,
    bg: "bg-gradient-to-r from-red-500/10 to-rose-500/10",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-500/20",
  },
  UNVERIFIED: {
    label: "New Seller",
    icon: Star,
    bg: "bg-muted/50",
    text: "text-muted-foreground",
    border: "border-border",
  },
};

const sizeConfig = {
  sm: "px-2 py-0.5 text-[10px] gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
  lg: "px-3 py-1.5 text-sm gap-2",
};

const iconSize = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
};

export function TrustBadge({
  status,
  size = "md",
  className,
  showLabel = true,
}: TrustBadgeProps) {
  const config = badgeConfig[status ?? "UNVERIFIED"] ?? badgeConfig.UNVERIFIED;
  const Icon = config.icon;

  if (!showLabel && (status === "UNVERIFIED" || !status)) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold transition-all",
        config.bg,
        config.text,
        config.border,
        config.glow,
        sizeConfig[size],
        className,
      )}
    >
      <Icon className={iconSize[size]} />
      {showLabel && config.label}
    </span>
  );
}

interface SellerLevelProps {
  trustScore: number;
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function getTrustLevel(score: number) {
  if (score >= 800)
    return {
      label: "Elite",
      icon: Gem,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    };
  if (score >= 600)
    return {
      label: "Top Rated",
      icon: Crown,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    };
  if (score >= 400)
    return {
      label: "Established",
      icon: Shield,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    };
  if (score >= 200)
    return {
      label: "Rising",
      icon: Star,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    };
  return {
    label: "New",
    icon: Star,
    color: "text-muted-foreground",
    bg: "bg-muted/50",
    border: "border-border",
  };
}

export function SellerLevel({
  trustScore,
  showScore = true,
  size = "md",
  className,
}: SellerLevelProps) {
  const level = getTrustLevel(trustScore);
  const Icon = level.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        level.bg,
        level.color,
        level.border,
        sizeConfig[size],
        className,
      )}
    >
      <Icon className={iconSize[size]} />
      {level.label}
      {showScore && (
        <span className="opacity-70">({trustScore.toLocaleString()})</span>
      )}
    </span>
  );
}
