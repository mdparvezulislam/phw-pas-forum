"use client";

import { Check, Crown, Gem, Zap } from "lucide-react";
import { useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";

interface Package {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  deliveryDays: number;
  revisions: number;
}

interface PricingPackagesProps {
  packages: Package[];
  onSelect?: (packageId: string) => void;
  selectedPackageId?: string;
}

const tierConfig: Record<
  string,
  {
    icon: typeof Crown;
    color: string;
    bg: string;
    border: string;
    glow?: string;
  }
> = {
  basic: {
    icon: Zap,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/5",
    border: "border-blue-500/20",
  },
  standard: {
    icon: Crown,
    color: "text-primary",
    bg: "bg-primary/5",
    border: "border-primary/20",
    glow: "shadow-lg shadow-primary/10",
  },
  premium: {
    icon: Gem,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/5",
    border: "border-purple-500/20",
  },
};

export function PricingPackages({
  packages,
  onSelect,
  selectedPackageId,
}: PricingPackagesProps) {
  const [selected, setSelected] = useState<string | null>(
    selectedPackageId ?? null,
  );

  const handleSelect = (id: string) => {
    setSelected(id);
    onSelect?.(id);
  };

  if (packages.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Choose a Package
      </h3>
      <div className="space-y-3">
        {packages.map((pkg) => {
          const tier = tierConfig[pkg.name.toLowerCase()] ?? tierConfig.basic;
          const Icon = tier.icon;
          const isSelected = selected === pkg.id;

          return (
            <button
              key={pkg.id}
              onClick={() => handleSelect(pkg.id)}
              className={cn(
                "w-full rounded-xl border p-4 text-left transition-all",
                isSelected
                  ? cn(
                      "border-primary bg-primary/5 ring-2 ring-primary/20",
                      tier.glow,
                    )
                  : cn(
                      "hover:border-primary/20 hover:bg-accent/30",
                      tier.bg,
                      tier.border,
                    ),
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", tier.color)} />
                  <span className="font-semibold">{pkg.name}</span>
                </div>
                <span className="text-lg font-bold">
                  {formatCurrency(pkg.price)}
                </span>
              </div>

              {pkg.description && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {pkg.description}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-emerald-500" />
                  {pkg.deliveryDays} day{pkg.deliveryDays !== 1 ? "s" : ""}{" "}
                  delivery
                </span>
                <span className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-emerald-500" />
                  {pkg.revisions} revision{pkg.revisions !== 1 ? "s" : ""}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
