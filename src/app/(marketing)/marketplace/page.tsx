import {
  ArrowRight,
  ArrowUpRight,
  Shield,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  FeaturedListings,
  ListingGrid,
  MarketplaceCategoryCard,
  MarketplaceEmptyState,
  MarketplaceHero,
  MarketplaceLeaderboard,
  TrendingListings,
} from "@/components/marketplace";
import { getMarketplaceHomepageData } from "@/services/marketplace";

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "Discover trusted sellers, premium services, and digital products from the community.",
  openGraph: {
    title: "Marketplace | BHW PAS",
    description:
      "Discover trusted sellers, premium services, and digital products.",
  },
};

export default async function MarketplacePage() {
  const data = await getMarketplaceHomepageData();

  return (
    <div className="pt-4">
      {/* Hero */}
      <MarketplaceHero stats={data.stats} />

      {/* Categories */}
      {data.categories.length > 0 && (
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Browse Categories</h2>
            <Link
              href="/marketplace/categories"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              All categories
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.categories.map((category) => (
              <MarketplaceCategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      <section className="mt-10">
        <FeaturedListings listings={data.featuredListings} />
      </section>

      {/* Trending */}
      <section className="mt-10">
        <TrendingListings listings={data.trendingListings} />
      </section>

      {/* Leaderboard + New Arrivals */}
      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_340px]">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">New Arrivals</h2>
            <Link
              href="/marketplace?sort=newest"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ListingGrid listings={data.newestListings} columns={2} />
        </section>

        <aside>
          <MarketplaceLeaderboard
            sellers={data.topSellers}
            title="Top Sellers"
            type="sellers"
          />
        </aside>
      </div>

      {/* CTA */}
      <section className="mt-12 overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 via-card to-premium/5">
        <div className="px-6 py-10 text-center sm:px-10">
          <h2 className="text-2xl font-bold">Ready to Start Selling?</h2>
          <p className="mt-2 text-muted-foreground">
            Join thousands of sellers offering premium services to the
            community.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/seller/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Open Seller Dashboard
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
            >
              Browse Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
