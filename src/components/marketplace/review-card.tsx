import { Star, CheckCircle, ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { cn, formatDateRelative } from "@/lib/utils";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    content?: string | null;
    isVerifiedPurchase?: boolean;
    isRecommended?: boolean;
    createdAt: Date | string;
    buyer: {
      username: string | null;
      displayName: string | null;
    };
  };
  className?: string;
}

export function ReviewCard({ review, className }: ReviewCardProps) {
  const buyerName =
    review.buyer.displayName ?? review.buyer.username ?? "Anonymous";

  return (
    <div className={cn("rounded-xl border bg-card p-4", className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-sm font-bold">
            {buyerName[0]?.toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{buyerName}</span>
              {review.isVerifiedPurchase && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-2.5 w-2.5" />
                  Verified
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDateRelative(review.createdAt)}
            </span>
          </div>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "h-4 w-4",
                star <= review.rating
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30",
              )}
            />
          ))}
        </div>
      </div>

      {review.content && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {review.content}
        </p>
      )}

      {review.isRecommended != null && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          {review.isRecommended ? (
            <>
              <ThumbsUp className="h-3 w-3 text-emerald-500" />
              Recommends this service
            </>
          ) : (
            <>
              <ThumbsDown className="h-3 w-3 text-red-500" />
              Does not recommend
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface RatingBreakdownProps {
  averageRating: number;
  reviewCount: number;
  breakdown?: { 5: number; 4: number; 3: number; 2: number; 1: number };
  className?: string;
}

export function RatingBreakdown({
  averageRating,
  reviewCount,
  breakdown,
  className,
}: RatingBreakdownProps) {
  const defaultBreakdown = breakdown ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const maxCount = Math.max(...Object.values(defaultBreakdown), 1);

  return (
    <div className={cn("rounded-xl border bg-card p-5", className)}>
      <div className="flex items-center gap-6">
        {/* Big number */}
        <div className="text-center">
          <p className="text-4xl font-bold">{averageRating.toFixed(1)}</p>
          <div className="mt-1 flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "h-3.5 w-3.5",
                  star <= Math.round(averageRating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/30",
                )}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {reviewCount.toLocaleString()} review{reviewCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Bars */}
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = defaultBreakdown[star as keyof typeof defaultBreakdown];
            const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-right text-muted-foreground">
                  {star}
                </span>
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <div className="flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-muted-foreground">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
