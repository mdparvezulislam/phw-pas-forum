import {
  ArrowDown,
  ArrowUp,
  Medal,
  Minus,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Trophy,
} from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UserEmptyState } from "@/components/user";
import { auth } from "@/lib/auth";
import { cn, formatDateRelative } from "@/lib/utils";
import { reputationEngine } from "@/services/reputation-engine";
import { getUserReputationHistory } from "@/services/user-dashboard";

export const metadata: Metadata = {
  title: "Reputation",
  description: "Your reputation history and community impact",
};

const typeIcons: Record<string, typeof TrendingUp> = {
  THREAD_CREATED: Sparkles,
  POST_CREATED: TrendingUp,
  REACTION_RECEIVED: ThumbsUp,
  MARKETPLACE_REVIEW: Trophy,
  ORDER_COMPLETED: Medal,
  ITRADER_POSITIVE: ThumbsUp,
  ITRADER_NEGATIVE: ThumbsDown,
  SYSTEM_REWARD: Sparkles,
};

const typeColors: Record<string, string> = {
  THREAD_CREATED: "text-blue-600 dark:text-blue-400",
  POST_CREATED: "text-primary",
  REACTION_RECEIVED: "text-amber-600 dark:text-amber-400",
  MARKETPLACE_REVIEW: "text-emerald-600 dark:text-emerald-400",
  ORDER_COMPLETED: "text-purple-600 dark:text-purple-400",
  ITRADER_POSITIVE: "text-emerald-600 dark:text-emerald-400",
  ITRADER_NEGATIVE: "text-red-600 dark:text-red-400",
  SYSTEM_REWARD: "text-orange-600 dark:text-orange-400",
};

export default async function ReputationPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const [history, reputation] = await Promise.all([
    getUserReputationHistory(session.user.id),
    reputationEngine.getUserReputation(session.user.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reputation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your community reputation and impact
        </p>
      </div>

      {/* Reputation Overview */}
      {reputation && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <OverviewCard
            label="Total Reputation"
            value={reputation.reputationPoints.toLocaleString()}
            icon={Medal}
            color="text-primary"
            bg="bg-primary/10"
          />
          <OverviewCard
            label="Positive Feedback"
            value={reputation.positiveFeedbackCount.toLocaleString()}
            icon={ThumbsUp}
            color="text-emerald-600 dark:text-emerald-400"
            bg="bg-emerald-500/10"
          />
          <OverviewCard
            label="Negative Feedback"
            value={reputation.negativeFeedbackCount.toLocaleString()}
            icon={ThumbsDown}
            color="text-red-600 dark:text-red-400"
            bg="bg-red-500/10"
          />
          <OverviewCard
            label="Helpful"
            value={reputation.helpfulCount.toLocaleString()}
            icon={TrendingUp}
            color="text-amber-600 dark:text-amber-400"
            bg="bg-amber-500/10"
          />
        </div>
      )}

      {/* History */}
      <div className="rounded-xl border bg-card">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Transaction History</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Last 100 transactions
          </p>
        </div>
        {history.length > 0 ? (
          <div className="divide-y">
            {history.map((tx: any) => {
              const Icon = typeIcons[tx.type] ?? TrendingUp;
              const color = typeColors[tx.type] ?? "text-muted-foreground";
              const isPositive = tx.points >= 0;
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-4 px-5 py-3.5"
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${color.replace("text-", "bg-")}/10`}
                  >
                    <Icon className={`h-4.5 w-4.5 ${color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium capitalize">
                      {tx.type.replace(/_/g, " ").toLowerCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateRelative(tx.createdAt)}
                      {tx.sourceUser?.username && (
                        <>
                          {" "}
                          &middot; by{" "}
                          {tx.sourceUser.displayName ?? tx.sourceUser.username}
                        </>
                      )}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "flex items-center gap-1 text-sm font-bold",
                      isPositive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400",
                    )}
                  >
                    {isPositive ? "+" : ""}
                    {tx.points}
                    {isPositive ? (
                      <ArrowUp className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDown className="h-3.5 w-3.5" />
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-5">
            <UserEmptyState type="no-reputation" />
          </div>
        )}
      </div>
    </div>
  );
}

function OverviewCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string | number;
  icon: any;
  color: string;
  bg: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}
        >
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
