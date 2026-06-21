import type { Metadata } from "next";
import Link from "next/link";
import { LeaderboardTable } from "@/modules/reputation/components";
import { leaderboardService } from "@/services/leaderboard";

export const metadata: Metadata = {
  title: "Leaderboard",
};

interface LeaderboardPageProps {
  searchParams: Promise<{
    category?: string;
    timeframe?: string;
  }>;
}

export default async function LeaderboardPage(props: LeaderboardPageProps) {
  const searchParams = await props.searchParams;
  const category = searchParams.category ?? "reputation";
  const timeframe = (searchParams.timeframe ?? "all-time") as
    | "weekly"
    | "monthly"
    | "all-time";

  const validCategories = [
    "reputation",
    "posts",
    "trophies",
    "badges",
  ] as const;
  const currentCategory = validCategories.includes(category as any)
    ? (category as (typeof validCategories)[number])
    : "reputation";

  const validTimeframes = ["weekly", "monthly", "all-time"] as const;
  const currentTimeframe = validTimeframes.includes(timeframe as any)
    ? (timeframe as (typeof validTimeframes)[number])
    : "all-time";

  let entries = [];
  switch (currentCategory) {
    case "posts":
      entries = await leaderboardService.getPostLeaderboard(currentTimeframe);
      break;
    case "trophies":
      entries = await leaderboardService.getTrophyLeaderboard();
      break;
    case "badges":
      entries = await leaderboardService.getBadgeLeaderboard();
      break;
    default:
      entries =
        await leaderboardService.getReputationLeaderboard(currentTimeframe);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="text-sm text-muted-foreground">Top community members</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {validCategories.map((cat) => (
          <Link
            key={cat}
            href={`/members/leaderboard?category=${cat}&timeframe=${currentTimeframe}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              currentCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Link>
        ))}
      </div>

      {currentCategory !== "trophies" && currentCategory !== "badges" && (
        <div className="flex flex-wrap gap-2">
          {validTimeframes.map((tf) => (
            <Link
              key={tf}
              href={`/members/leaderboard?category=${currentCategory}&timeframe=${tf}`}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                currentTimeframe === tf
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tf === "weekly"
                ? "This Week"
                : tf === "monthly"
                  ? "This Month"
                  : "All Time"}
            </Link>
          ))}
        </div>
      )}

      <LeaderboardTable entries={entries} category={currentCategory} />
    </div>
  );
}
