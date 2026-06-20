import Image from "next/image";
import Link from "next/link";
import type { UserReputation } from "@/db/schema/user-reputation";
import type { UserLevel } from "@/db/schema/user-levels";

interface UserRankCardProps {
  user: {
    id: string;
    username: string | null;
    displayName: string | null;
    image: string | null;
  };
  reputation: UserReputation | null;
  level: {
    level: UserLevel | null;
    progress: number;
  };
}

export function UserRankCard({ user, reputation, level }: UserRankCardProps) {
  return (
    <Link
      href={`/profile/${user.username ?? user.id}`}
      className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base text-primary">
        {user.image ? (
          <Image
            src={user.image}
            alt=""
            width={40}
            height={40}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          (user.displayName ?? user.username ?? "U").charAt(0).toUpperCase()
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">
          {user.displayName ?? user.username}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {level.level && <span>{level.level.name}</span>}
          {reputation && (
            <>
              <span>·</span>
              <span>{reputation.reputationPoints} rep</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
