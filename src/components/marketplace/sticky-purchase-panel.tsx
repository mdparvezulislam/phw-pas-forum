"use client";

import { useState } from "react";
import { ShoppingCart, Heart, Share2, Clock, RotateCcw, MessageSquare } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface StickyPurchasePanelProps {
  listing: {
    id: string;
    title: string;
    basePrice: number;
    deliveryDays: number;
    revisions: number;
  };
  packages: {
    id: string;
    name: string;
    price: number;
    deliveryDays: number;
    revisions: number;
  }[];
  onOrder?: (packageId: string) => void;
  className?: string;
}

export function StickyPurchasePanel({
  listing,
  packages,
  onOrder,
  className,
}: StickyPurchasePanelProps) {
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);

  const activePackage = packages.find((p) => p.id === selectedPkg) ?? packages[0];

  return (
    <>
      {/* Desktop: Sticky sidebar */}
      <div className={cn("hidden lg:block", className)}>
        <div className="sticky top-24 space-y-4">
          <div className="overflow-hidden rounded-xl border bg-card shadow-lg">
            <div className="border-b p-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {formatCurrency(activePackage?.price ?? listing.basePrice)}
                </span>
                <span className="text-sm text-muted-foreground">starting at</span>
              </div>
            </div>

            {/* Package selector */}
            {packages.length > 1 && (
              <div className="border-b p-4">
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  Package
                </p>
                <div className="space-y-2">
                  {packages.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPkg(pkg.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition-all",
                        (selectedPkg ?? packages[0]?.id) === pkg.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "hover:border-primary/20",
                      )}
                    >
                      <span className="font-medium">{pkg.name}</span>
                      <span className="font-semibold">
                        {formatCurrency(pkg.price)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Details */}
            <div className="space-y-3 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {activePackage?.deliveryDays ?? listing.deliveryDays} day
                {(activePackage?.deliveryDays ?? listing.deliveryDays) !== 1
                  ? "s"
                  : ""}{" "}
                delivery
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
                {activePackage?.revisions ?? listing.revisions} revision
                {(activePackage?.revisions ?? listing.revisions) !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 p-4 pt-0">
              <button
                onClick={() => onOrder?.(selectedPkg ?? packages[0]?.id)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <ShoppingCart className="h-4 w-4" />
                Continue
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2.5 text-sm font-medium transition-colors",
                    isFavorited
                      ? "border-red-500/20 bg-red-500/5 text-red-600"
                      : "hover:bg-accent",
                  )}
                >
                  <Heart
                    className={cn("h-4 w-4", isFavorited && "fill-current")}
                  />
                  {isFavorited ? "Saved" : "Save"}
                </button>
                <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2.5 text-sm font-medium transition-colors hover:bg-accent">
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 px-4 py-3 backdrop-blur-lg lg:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border"
          >
            <Heart
              className={cn(
                "h-5 w-5",
                isFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground",
              )}
            />
          </button>
          <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border">
            <Share2 className="h-5 w-5 text-muted-foreground" />
          </button>
          <button
            onClick={() => onOrder?.(selectedPkg ?? packages[0]?.id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground"
          >
            <ShoppingCart className="h-4 w-4" />
            {formatCurrency(activePackage?.price ?? listing.basePrice)}
          </button>
        </div>
      </div>
    </>
  );
}
