import Link from "next/link";
import {
  MapPin,
  Calendar,
  Clock,
  MessageSquare,
  UserPlus,
  ExternalLink,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { TrustBadge, SellerLevel } from "./trust-badge";

interface SellerProfileHeaderProps {
  seller: {
    userId: string;
    username: string | null;
    displayName: string | null;
    avatar?: string | null;
    bannerImage?: string | null;
    bio?: string | null;
    website?: string | null;
    joinedMarketplaceAt?: Date | string | null;
    verificationStatus?: string | null;
    trustScore?: number;
    totalSales?: number;
    totalReviews?: number;
    averageRating?: number;
    responseRate?: number;
    responseTime?: number;
    completionRate?: number;
  };
  isOwnProfile?: boolean;
  className?: string;
}

export function SellerProfileHeader({
  seller,
  isOwnProfile,
  className,
}: SellerProfileHeaderProps) {
  const name = seller.displayName ?? seller.username ?? "Unknown";

  return (
    <div className={cn("overflow-hidden rounded-2xl border bg-card", className)}>
      {/* Banner */}
      <div className="relative h-32 sm:h-40 bg-gradient-to-br from-primary/10 via-muted to-premium/10">
        {seller.bannerImage && (
          <img
            src={seller.bannerImage}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {/* Profile */}
      <div className="relative px-5 pb-5 sm:px-8">
        {/* Avatar */}
        <div className="-mt-12 flex items-end gap-4 sm:-mt-14">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-card bg-gradient-to-br from-primary/20 to-primary/5 text-3xl font-bold shadow-lg sm:h-28 sm:w-28">
            {seller.avatar ? (
              <img
                src={seller.avatar}
                alt={name}
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              name[0]?.toUpperCase()
            )}
          </div>
          <div className="min-w-0 pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold sm:text-2xl">{name}</h1>
              {seller.verificationStatus && (
                <TrustBadge status={seller.verificationStatus} size="md" />
              )}
            </div>
            {seller.trustScore != null && (
              <SellerLevel trustScore={seller.trustScore} size="sm" className="mt-1" />
            )}
          </div>
        </div>

        {/* Bio */}
        {seller.bio && (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {seller.bio}
          </p>
        )}

        {/* Meta row */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {seller.joinedMarketplaceAt && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Member since {formatDate(seller.joinedMarketplaceAt)}
            </span>
          )}
          {seller.responseTime != null && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Avg. response: {seller.responseTime}h
            </span>
          )}
          {seller.website && (
            <a
              href={seller.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Website
            </a>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-5 flex gap-3">
          {isOwnProfile ? (
            <Link
              href="/seller/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                <MessageSquare className="h-4 w-4" />
                Contact Seller
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent">
                <UserPlus className="h-4 w-4" />
                Follow
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
