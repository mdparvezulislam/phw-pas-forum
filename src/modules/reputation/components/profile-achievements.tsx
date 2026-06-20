import type { Badge } from "@/db/schema/badges";
import type { Trophy } from "@/db/schema/trophies";
import { BadgeGrid } from "./badge-grid";
import { TrophyGrid } from "./trophy-grid";
import { ReputationCard } from "./reputation-card";
import type { UserReputation } from "@/db/schema/user-reputation";

interface ProfileAchievementsProps {
  reputation: UserReputation | null;
  badges: Array<
    Badge & {
      earnedAt?: Date;
    }
  >;
  trophies: Array<
    Trophy & {
      earnedAt?: Date;
    }
  >;
}

export function ProfileAchievements({
  reputation,
  badges,
  trophies,
}: ProfileAchievementsProps) {
  return (
    <div className="space-y-6">
      {reputation && (
        <ReputationCard reputation={reputation} />
      )}

      <div className="rounded-lg border p-4">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Badges ({badges.length})
        </h3>
        <BadgeGrid badges={badges} />
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Trophies ({trophies.length})
        </h3>
        <TrophyGrid trophies={trophies} />
      </div>
    </div>
  );
}
