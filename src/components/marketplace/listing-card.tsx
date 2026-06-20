"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Star,
  Clock,
  ShoppingBag,
  Heart,
  TrendingUp,
  Flame,
  Crown,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { TrustBadge } from "./trust-badge";

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    slug: string;
    shortDescription?: string | null;
    basePrice: number;
    deliveryDays: number;
    rating: number;
    reviewCount: number;
    sales: number;
    views: number;
    favorites: number;
    featured?: boolean;
    createdAt: Date | string;
    seller: {
      username: string | null;
      displayName: string | null;
      avatar?: string | null;
      verificationStatus?: string | null;
      isTopSeller?: boolean;
      trustScore?: number;
    };
    category?: {
      name: string;
      slug: string;
    } | null;
    media?: { type: string; attachment: { url: string } }[];
  };
  className?: string;
  featured?: boolean;
  trending?: boolean;
}

export function ListingCard({
  listing,
  className,
  featured,
  trending,
}: ListingCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [favCount, setFavCount] = useState(listing.favorites);
  const sellerName =
    listing.seller.displayName ?? listing.seller.username ?? "Unknown";
  const coverImage = listing.media?.[0]?.attachment?.url;

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    setFavCount((c) => (isFavorited ? c - 1 : c + 1));
  };

  return (
    <Link
      href={`/marketplace/${listing.slug}`}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card transition-all duration-300",
        "hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5",
        featured &&
          "border-amber-500/20 bg-gradient-to-br from-amber-500/[0.03] to-card",
        className,
      )}
    >
      {/* Cover Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {coverImage ? (
          <img
            src={coverImage}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
            <ShoppingBag className="h-10 w-10 text-primary/20" />
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
              <Crown className="h-3 w-3" />
              Featured
            </span>
          )}
          {trending && (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
              <Flame className="h-3 w-3" />
              Trending
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={handleFavorite}
          className={cn(
            "absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full transition-all",
            "backdrop-blur-sm",
            isFavorited
              ? "bg-red-500 text-white shadow-lg"
              : "bg-black/30 text-white/80 hover:bg-black/50 hover:text-white",
          )}
        >
          <Heart
            className={cn("h-4 w-4", isFavorited && "fill-current")}
          />
        </button>

        {/* Price tag */}
        <div className="absolute bottom-3 right-3">
          <div className="rounded-lg bg-black/60 px-3 py-1.5 backdrop-blur-sm">
            <span className="text-xs text-white/70">From</span>
            <span className="ml-1 text-lg font-bold text-white">
              {formatCurrency(listing.basePrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        {listing.category && (
          <span className="text-[11px] font-medium uppercase tracking-wider text-primary/70">
            {listing.category.name}
          </span>
        )}

        {/* Title */}
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-tight group-hover:text-primary transition-colors">
          {listing.title}
        </h3>

        {/* Description */}
        {listing.shortDescription && (
          <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
            {listing.shortDescription}
          </p>
        )}

        {/* Seller */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-[10px] font-bold">
            {sellerName[0]?.toUpperCase()}
          </div>
          <span className="text-xs font-medium truncate">{sellerName}</span>
          {listing.seller.verificationStatus &&
            listing.seller.verificationStatus !== "UNVERIFIED" && (
              <TrustBadge
                status={listing.seller.verificationStatus}
                size="sm"
                showLabel={false}
              />
            )}
        </div>

        {/* Stats row */}
        <div className="mt-3 flex items-center gap-3 border-t pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="font-medium text-foreground">
              {listing.rating > 0 ? listing.rating.toFixed(1) : "New"}
            </span>
            {listing.reviewCount > 0 && <span>({listing.reviewCount})</span>}
          </span>
          <span className="flex items-center gap-1">
            <ShoppingBag className="h-3 w-3" />
            {listing.sales.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {listing.deliveryDays}d
          </span>
        </div>
      </div>
    </Link>
  );
}
