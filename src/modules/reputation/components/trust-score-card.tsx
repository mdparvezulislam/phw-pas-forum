import { cn } from "@/lib/utils";

interface TrustScoreCardProps {
  trustScore: number;
  size?: "sm" | "md" | "lg";
}

export function TrustScoreCard({
  trustScore,
  size = "sm",
}: TrustScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-amber-500";
    if (score >= 20) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Trusted";
    if (score >= 50) return "Reliable";
    if (score >= 20) return "Developing";
    return "New";
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border p-3",
        size === "sm" && "p-2",
        size === "lg" && "p-4",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full font-bold",
          getScoreColor(trustScore),
          size === "sm" && "h-8 w-8 text-sm",
          size === "lg" && "h-12 w-12 text-lg",
          "bg-muted/50",
        )}
      >
        {trustScore}
      </div>
      <div>
        <div
          className={cn(
            "text-sm font-semibold",
            getScoreColor(trustScore),
          )}
        >
          {getScoreLabel(trustScore)}
        </div>
        <div className="text-xs text-muted-foreground">Trust Score</div>
      </div>
    </div>
  );
}
