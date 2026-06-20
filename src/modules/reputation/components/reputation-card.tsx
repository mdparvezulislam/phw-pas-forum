import type { UserReputation } from "@/db/schema/user-reputation";

interface ReputationCardProps {
  reputation: UserReputation | null;
}

export function ReputationCard({ reputation }: ReputationCardProps) {
  if (!reputation) {
    return (
      <div className="rounded-lg border p-4">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Reputation
        </h3>
        <div className="text-center py-4">
          <div className="text-3xl font-bold text-muted-foreground">0</div>
          <div className="text-xs text-muted-foreground mt-1">points</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Reputation
      </h3>
      <div className="text-center py-2">
        <div className="text-3xl font-bold">
          {reputation.reputationPoints.toLocaleString()}
        </div>
        <div className="text-xs text-muted-foreground mt-1">points</div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
        <div className="rounded-md bg-muted/50 p-2">
          <div className="font-semibold text-green-600 dark:text-green-400">
            {reputation.positiveFeedbackCount}
          </div>
          <div className="text-muted-foreground">Positive</div>
        </div>
        <div className="rounded-md bg-muted/50 p-2">
          <div className="font-semibold text-red-600 dark:text-red-400">
            {reputation.negativeFeedbackCount}
          </div>
          <div className="text-muted-foreground">Negative</div>
        </div>
      </div>
    </div>
  );
}
