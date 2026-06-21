import {
  ChevronDown,
  Clock,
  Eye,
  Heart,
  MessageSquare,
  ShoppingBag,
  Star,
} from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ListingGallery,
  MarketplaceEmptyState,
  PricingPackages,
  RatingBreakdown,
  ReviewCard,
  SellerProfileHeader,
  SellerStats,
  StickyPurchasePanel,
  TrustBadge,
} from "@/components/marketplace";
import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { getListingBySlug } from "@/services/marketplace";

interface ListingPageProps {
  params: Promise<{ listingSlug: string }>;
}

export async function generateMetadata(
  props: ListingPageProps,
): Promise<Metadata> {
  const params = await props.params;
  const listing = await getListingBySlug(params.listingSlug);
  if (!listing) return { title: "Not found" };

  return {
    title: listing.title,
    description: listing.shortDescription ?? undefined,
    openGraph: {
      title: `${listing.title} | Marketplace`,
      description: listing.shortDescription ?? undefined,
      type: "website",
    },
  };
}

export default async function ListingDetailPage(props: ListingPageProps) {
  const params = await props.params;
  const session = await auth();
  const listing = await getListingBySlug(params.listingSlug);

  if (!listing) notFound();

  return (
    <div className="pt-4">
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Gallery */}
          <ListingGallery media={[]} />

          {/* Title + Meta */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {listing.featured && (
                <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  Featured
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                in {listing.category.name}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
              {listing.title}
            </h1>
            {listing.shortDescription && (
              <p className="mt-2 text-muted-foreground">
                {listing.shortDescription}
              </p>
            )}

            {/* Seller info row */}
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-sm font-bold">
                  {(listing.seller.displayName ??
                    listing.seller.username ??
                    "?")[0]?.toUpperCase()}
                </div>
                <div>
                  <span className="text-sm font-medium">
                    {listing.seller.displayName ?? listing.seller.username}
                  </span>
                  {listing.seller.verificationStatus && (
                    <TrustBadge
                      status={listing.seller.verificationStatus}
                      size="sm"
                      className="ml-1.5"
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {listing.rating > 0 ? listing.rating.toFixed(1) : "New"}
                  {listing.reviewCount > 0 && (
                    <span>({listing.reviewCount})</span>
                  )}
                </span>
                <span className="flex items-center gap-1">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  {listing.sales.toLocaleString()} orders
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {listing.views.toLocaleString()} views
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl border bg-card p-5 sm:p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              About This Service
            </h2>
            {listing.descriptionJson ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {JSON.stringify(listing.descriptionJson)}
                </p>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {listing.shortDescription}
              </p>
            )}
          </div>

          {/* Reviews Section */}
          <div className="rounded-xl border bg-card p-5 sm:p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Reviews
            </h2>

            {listing.reviewCount > 0 ? (
              <RatingBreakdown
                averageRating={listing.rating}
                reviewCount={listing.reviewCount}
              />
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No reviews yet. Be the first to review this service.
              </p>
            )}

            {listing.reviews.length > 0 && (
              <div className="mt-4 space-y-3">
                {listing.reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </div>

          {/* FAQ */}
          {listing.faqs.length > 0 && (
            <div className="rounded-xl border bg-card p-5 sm:p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {listing.faqs.map((faq) => (
                  <details key={faq.id} className="group rounded-lg border p-4">
                    <summary className="flex cursor-pointer items-center justify-between text-sm font-medium">
                      {faq.question}
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Pricing + Purchase */}
        <div className="space-y-4">
          <StickyPurchasePanel listing={listing} packages={listing.packages} />

          {/* Seller Info Card */}
          <div className="overflow-hidden rounded-xl border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              About the Seller
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-lg font-bold">
                {(listing.seller.displayName ??
                  listing.seller.username ??
                  "?")[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold">
                  {listing.seller.displayName ?? listing.seller.username}
                </p>
                {listing.seller.verificationStatus && (
                  <TrustBadge
                    status={listing.seller.verificationStatus}
                    size="sm"
                  />
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-lg bg-muted/50 p-2.5">
                <p className="text-lg font-bold">
                  {listing.seller.totalSales ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Sales</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2.5">
                <p className="text-lg font-bold">
                  {(listing.seller.averageRating ?? 0) > 0
                    ? Number(listing.seller.averageRating) > 100
                      ? (Number(listing.seller.averageRating) / 100).toFixed(1)
                      : Number(listing.seller.averageRating).toFixed(1)
                    : "N/A"}
                </p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2.5">
                <p className="text-lg font-bold">
                  {listing.seller.trustScore ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Trust Score</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2.5">
                <p className="text-lg font-bold">
                  {listing.seller.responseTime ?? 0}h
                </p>
                <p className="text-xs text-muted-foreground">Response</p>
              </div>
            </div>

            <a
              href={`/seller/${listing.seller.username ?? listing.seller.userId}`}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors hover:bg-accent"
            >
              View Profile
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
