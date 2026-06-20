import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  SellerProfileHeader,
  SellerStats,
  ListingGrid,
  RatingBreakdown,
  ReviewCard,
  MarketplaceEmptyState,
} from "@/components/marketplace";
import { getSellerByUsername } from "@/services/marketplace";

interface SellerPageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata(
  props: SellerPageProps,
): Promise<Metadata> {
  const params = await props.params;
  const seller = await getSellerByUsername(params.username);
  if (!seller) return { title: "Seller not found" };

  const name = seller.displayName ?? seller.username ?? "Unknown";
  return {
    title: `${name} - Seller Profile`,
    description: seller.bio ?? `View ${name}'s services and reviews.`,
    openGraph: {
      title: `${name} | Marketplace`,
      description: seller.bio ?? undefined,
    },
  };
}

export default async function SellerProfilePage(props: SellerPageProps) {
  const params = await props.params;
  const seller = await getSellerByUsername(params.username);

  if (!seller) notFound();

  return (
    <div className="pt-4 space-y-6">
      {/* Header */}
      <SellerProfileHeader seller={seller} />

      {/* Stats */}
      <SellerStats
        stats={{
          totalSales: seller.totalSales,
          averageRating: seller.averageRating,
          totalReviews: seller.totalReviews,
          responseRate: seller.responseRate,
          responseTime: seller.responseTime,
          completionRate: seller.completionRate,
          trustScore: seller.trustScore,
        }}
      />

      {/* Listings */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">
          Active Services ({seller.listings.length})
        </h2>
        {seller.listings.length > 0 ? (
          <ListingGrid listings={seller.listings} columns={3} />
        ) : (
          <MarketplaceEmptyState type="no-listings" />
        )}
      </section>

      {/* Reviews */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">
          Reviews ({seller.reviews.length})
        </h2>
        {seller.reviews.length > 0 ? (
          <div className="space-y-3">
            {seller.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <MarketplaceEmptyState type="no-reviews" />
        )}
      </section>
    </div>
  );
}
