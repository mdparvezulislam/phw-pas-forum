"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketplaceHeroProps {
  stats?: {
    totalListings?: number;
    totalOrders?: number;
    totalSellers?: number;
    verifiedSellers?: number;
  };
}

export function MarketplaceHero({ stats }: MarketplaceHeroProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 via-card to-premium/5">
      {/* Background decoration */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-premium/5 blur-3xl" />

      <div className="relative px-6 py-10 sm:px-10 sm:py-14">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            Community Marketplace
          </div>

          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
            Find Premium{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Services
            </span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            Discover trusted sellers, verified services, and premium digital products from the community.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="mt-6">
            <div className="relative mx-auto max-w-xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search services, products, sellers..."
                className="w-full rounded-xl border bg-card py-3.5 pl-12 pr-32 text-sm shadow-sm transition-shadow placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick tags */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground">Popular:</span>
            {["SEO Services", "Link Building", "AI Tools", "Web Design"].map(
              (tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setQuery(tag);
                    router.push(
                      `/marketplace?search=${encodeURIComponent(tag)}`,
                    );
                  }}
                  className="rounded-full border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {tag}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              {
                label: "Active Services",
                value: stats.totalListings ?? 0,
              },
              { label: "Completed Orders", value: stats.totalOrders ?? 0 },
              { label: "Verified Sellers", value: stats.verifiedSellers ?? 0 },
              { label: "Total Sellers", value: stats.totalSellers ?? 0 },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border bg-card/50 px-4 py-3 text-center backdrop-blur-sm"
              >
                <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
