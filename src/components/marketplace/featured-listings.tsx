import { Crown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ListingCard } from "./listing-card";

interface FeaturedListingsProps {
  listings: any[];
}

export function FeaturedListings({ listings }: FeaturedListingsProps) {
  if (listings.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
            <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-lg font-semibold">Featured Services</h2>
        </div>
        <Link
          href="/marketplace?featured=true"
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.slice(0, 6).map((listing) => (
          <ListingCard key={listing.id} listing={listing} featured />
        ))}
      </div>
    </section>
  );
}
