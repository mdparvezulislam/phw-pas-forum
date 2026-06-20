import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";

const listings = [
  {
    title: "Complete SEO Audit & Strategy",
    seller: "Alex Chen",
    price: "$149",
    rating: 4.9,
    reviews: 234,
    category: "SEO",
  },
  {
    title: "Custom WordPress Development",
    seller: "Sarah Mitchell",
    price: "$299",
    rating: 4.8,
    reviews: 189,
    category: "Development",
  },
  {
    title: "Social Media Growth Package",
    seller: "Marcus Johnson",
    price: "$79",
    rating: 4.9,
    reviews: 312,
    category: "Marketing",
  },
  {
    title: "AI Automation Workflow Setup",
    seller: "Priya Sharma",
    price: "$199",
    rating: 4.7,
    reviews: 156,
    category: "AI",
  },
  {
    title: "YouTube Channel Optimization",
    seller: "David Kim",
    price: "$99",
    rating: 4.8,
    reviews: 267,
    category: "YouTube",
  },
  {
    title: "Full-Stack Web Application",
    seller: "Emily Rodriguez",
    price: "$499",
    rating: 4.9,
    reviews: 89,
    category: "Development",
  },
];

export function MarketplaceShowcase() {
  return (
    <section className="border-t border-border py-20">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">Top Services</h2>
            <p className="mt-3 text-muted-foreground">
              Featured listings from our top-rated sellers
            </p>
          </div>
          <Link
            href="/marketplace"
            className="hidden items-center gap-1 text-sm font-medium text-premium transition-colors hover:text-premium/80 sm:flex"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <div
              key={listing.title}
              className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-marketplace/20 hover:shadow-lg"
            >
              <div className="mb-2">
                <span className="rounded-full bg-marketplace/10 px-2.5 py-0.5 text-[10px] font-medium text-marketplace">
                  {listing.category}
                </span>
              </div>
              <h3 className="font-semibold">{listing.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                by {listing.seller}
              </p>
              <div className="mt-3 flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span className="text-sm font-medium">{listing.rating}</span>
                <span className="text-xs text-muted-foreground">
                  ({listing.reviews})
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="text-lg font-bold">{listing.price}</span>
                <button className="rounded-full bg-marketplace px-4 py-1.5 text-xs font-medium text-marketplace-foreground transition-all hover:bg-marketplace/90">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1 text-sm font-medium text-premium"
          >
            View All Services
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
