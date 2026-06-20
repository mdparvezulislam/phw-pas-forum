import { ListingCard } from "./listing-card";
import { cn } from "@/lib/utils";

interface ListingGridProps {
  listings: any[];
  columns?: 2 | 3 | 4;
  featured?: boolean;
  trending?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function ListingGrid({
  listings,
  columns = 3,
  featured,
  trending,
  emptyMessage = "No listings found.",
  className,
}: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        columns === 4 &&
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          featured={featured || listing.featured}
          trending={trending}
        />
      ))}
    </div>
  );
}
