import { ArrowRight, Shield, ShoppingBag, Star, Trophy } from "lucide-react";
import Link from "next/link";
import { TrustBadge } from "./trust-badge";

interface LeaderboardEntry {
  userId: string;
  username: string | null;
  displayName: string | null;
  avatar?: string | null;
  trustScore?: number;
  verificationStatus?: string | null;
  totalSales?: number;
  averageRating?: number;
}

interface MarketplaceLeaderboardProps {
  sellers: LeaderboardEntry[];
  title?: string;
  type?: "sellers" | "trusted" | "most-ordered";
}

export function MarketplaceLeaderboard({
  sellers,
  title = "Top Sellers",
  type = "sellers",
}: MarketplaceLeaderboardProps) {
  if (sellers.length === 0) return null;

  const icon =
    type === "trusted" ? (
      <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
    ) : type === "most-ordered" ? (
      <ShoppingBag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
    ) : (
      <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
    );

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
            {icon}
          </div>
          <h3 className="font-semibold">{title}</h3>
        </div>
        <Link
          href="/marketplace/leaderboard"
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Full leaderboard
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="divide-y">
        {sellers.slice(0, 5).map((seller, i) => {
          const name = seller.displayName ?? seller.username ?? "Unknown";
          return (
            <Link
              key={seller.userId}
              href={`/seller/${seller.username}`}
              className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-accent/50"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                {i + 1}
              </span>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-sm font-bold">
                {name[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium truncate">{name}</span>
                  {seller.verificationStatus &&
                    seller.verificationStatus !== "UNVERIFIED" && (
                      <TrustBadge
                        status={seller.verificationStatus}
                        size="sm"
                        showLabel={false}
                      />
                    )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {seller.totalSales != null && (
                    <span>{seller.totalSales.toLocaleString()} sales</span>
                  )}
                  {seller.averageRating != null && seller.averageRating > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {seller.averageRating.toFixed(1)}
                    </span>
                  )}
                  {seller.trustScore != null && (
                    <span>Trust: {seller.trustScore}</span>
                  )}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
