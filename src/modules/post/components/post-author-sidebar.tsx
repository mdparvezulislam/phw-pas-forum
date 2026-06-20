import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { LevelBadge } from "@/modules/reputation/components";
import type { UserReputation } from "@/db/schema/user-reputation";
import type { UserLevel } from "@/db/schema/user-levels";
import type { Badge } from "@/db/schema/badges";

interface PostAuthorSidebarProps {
  author: {
    id: string;
    username: string | null;
    displayName: string | null;
    image: string | null;
    createdAt: Date;
    reputation?: UserReputation | null;
    level?: UserLevel | null;
    badges?: Badge[];
  };
}

export function PostAuthorSidebar({ author }: PostAuthorSidebarProps) {
  return (
    <div className="w-full shrink-0 border-b bg-muted/30 p-4 md:w-48 md:border-b-0 md:border-r">
      <div className="flex items-center gap-3 md:flex-col md:items-start">
        <Link
          href={`/profile/${author.username ?? author.id}`}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl text-primary"
        >
          {author.image ? (
            <Image
              src={author.image}
              alt=""
              width={48}
              height={48}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            (author.displayName ?? author.username ?? "U")
              .charAt(0)
              .toUpperCase()
          )}
        </Link>
        <div className="min-w-0">
          <Link
            href={`/profile/${author.username ?? author.id}`}
            className="font-semibold truncate hover:text-primary block"
          >
            {author.displayName ?? author.username}
          </Link>
          <div className="text-xs text-muted-foreground">
            @{author.username}
          </div>
          {author.level && (
            <div className="mt-1">
              <LevelBadge level={author.level} size="sm" />
            </div>
          )}
          {author.reputation && (
            <div className="mt-1 text-xs text-muted-foreground">
              {author.reputation.reputationPoints} rep
            </div>
          )}
          {author.badges && author.badges.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-0.5">
              {author.badges.slice(0, 3).map((badge) => (
                <span
                  key={badge.id}
                  className="text-xs"
                  title={badge.name}
                >
                  {badge.icon}
                </span>
              ))}
              {author.badges.length > 3 && (
                <span className="text-[10px] text-muted-foreground">
                  +{author.badges.length - 3}
                </span>
              )}
            </div>
          )}
          <div className="mt-2 text-xs text-muted-foreground">
            Joined {formatDate(author.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}
