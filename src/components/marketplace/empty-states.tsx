import {
  FileText,
  Heart,
  PackageOpen,
  Search,
  ShoppingBag,
  Star,
  UserPlus,
} from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  type:
    | "no-listings"
    | "no-favorites"
    | "no-orders"
    | "no-reviews"
    | "no-sales"
    | "no-search"
    | "seller-onboarding";
  className?: string;
}

const configs = {
  "no-listings": {
    icon: ShoppingBag,
    title: "No listings yet",
    description: "Be the first to list a service in this category.",
    cta: { label: "Browse Marketplace", href: "/marketplace" },
  },
  "no-favorites": {
    icon: Heart,
    title: "No favorites yet",
    description: "Save listings you love to find them quickly later.",
    cta: { label: "Discover Services", href: "/marketplace" },
  },
  "no-orders": {
    icon: PackageOpen,
    title: "No orders yet",
    description: "When you purchase a service, your orders will appear here.",
    cta: { label: "Browse Services", href: "/marketplace" },
  },
  "no-reviews": {
    icon: Star,
    title: "No reviews yet",
    description: "Complete an order to leave a review.",
    cta: { label: "Browse Services", href: "/marketplace" },
  },
  "no-sales": {
    icon: FileText,
    title: "No sales yet",
    description: "Create your first listing to start earning.",
    cta: { label: "Create Listing", href: "/seller/dashboard" },
  },
  "no-search": {
    icon: Search,
    title: "No results found",
    description: "Try a different search term or browse categories.",
    cta: { label: "Browse All", href: "/marketplace" },
  },
  "seller-onboarding": {
    icon: UserPlus,
    title: "Become a Seller",
    description:
      "Join our marketplace and start offering your services to thousands of buyers.",
    cta: { label: "Start Selling", href: "/seller/dashboard" },
  },
};

export function MarketplaceEmptyState({ type, className }: EmptyStateProps) {
  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/50 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{config.title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        {config.description}
      </p>
      <Link
        href={config.cta.href}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {config.cta.label}
      </Link>
    </div>
  );
}
