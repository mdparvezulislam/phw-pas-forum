import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ListingGrid,
  ListingGridSkeleton,
  MarketplaceEmptyState,
} from "@/components/marketplace";
import {
  getMarketplaceCategories,
  getMarketplaceListings,
} from "@/services/marketplace";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}

export async function generateMetadata(
  props: CategoryPageProps,
): Promise<Metadata> {
  const params = await props.params;
  const categories = await getMarketplaceCategories();
  const category = categories.find((c) => c.slug === params.slug);
  if (!category) return { title: "Not found" };

  return {
    title: `${category.name} - Marketplace`,
    description: category.description ?? `Browse ${category.name} services.`,
    openGraph: {
      title: `${category.name} | Marketplace`,
      description: category.description ?? undefined,
    },
  };
}

export default async function CategoryPage(props: CategoryPageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const sort = searchParams.sort ?? "newest";

  const categories = await getMarketplaceCategories();
  const category = categories.find((c) => c.slug === params.slug);
  if (!category) notFound();

  const result = await getMarketplaceListings({
    categorySlug: params.slug,
    page,
    sort,
    perPage: 24,
  });

  return (
    <div className="pt-4">
      {/* Breadcrumbs */}
      <div className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/marketplace" className="hover:text-foreground">
          Marketplace
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{category.name}</span>
      </div>

      {/* Category Header */}
      <div className="overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 via-card to-premium/5">
        <div className="px-6 py-8 sm:px-8">
          <div className="flex items-center gap-3">
            {category.icon && <span className="text-3xl">{category.icon}</span>}
            <div>
              <h1 className="text-2xl font-bold">{category.name}</h1>
              {category.description && (
                <p className="mt-1 text-muted-foreground">
                  {category.description}
                </p>
              )}
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {result.total.toLocaleString()} service
            {result.total !== 1 ? "s" : ""} available
          </p>
        </div>
      </div>

      {/* Other Categories */}
      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/marketplace/category/${cat.slug}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              cat.slug === params.slug
                ? "border-primary bg-primary text-primary-foreground"
                : "hover:bg-accent"
            }`}
          >
            {cat.icon && <span className="mr-1">{cat.icon}</span>}
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Listings */}
      <div className="mt-6">
        {result.items.length > 0 ? (
          <ListingGrid listings={result.items} columns={3} />
        ) : (
          <MarketplaceEmptyState type="no-listings" />
        )}
      </div>

      {/* Pagination */}
      {result.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: Math.min(result.totalPages, 10) }).map(
            (_, i) => {
              const p = i + 1;
              return (
                <Link
                  key={p}
                  href={`/marketplace/category/${params.slug}?page=${p}&sort=${sort}`}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                >
                  {p}
                </Link>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}
