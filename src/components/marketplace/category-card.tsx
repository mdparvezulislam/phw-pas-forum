import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MarketplaceCategoryCardProps {
  category: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    icon?: string | null;
    _count?: {
      listings?: number;
    };
  };
  className?: string;
}

export function MarketplaceCategoryCard({
  category,
  className,
}: MarketplaceCategoryCardProps) {
  const listingCount = category._count?.listings ?? 0;

  return (
    <Link
      href={`/marketplace/category/${category.slug}`}
      className={cn(
        "group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all duration-300",
        "hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl transition-transform group-hover:scale-110">
        {category.icon ?? "📦"}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold group-hover:text-primary transition-colors">
          {category.name}
        </h3>
        {category.description && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
            {category.description}
          </p>
        )}
        {listingCount > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            {listingCount.toLocaleString()} service
            {listingCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  );
}
