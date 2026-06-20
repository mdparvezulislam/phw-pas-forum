import Link from "next/link";
import {
  MapPin,
  Globe,
  Calendar,
  Mail,
  MessageSquare,
  UserPlus,
  Shield,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { LevelBadge } from "@/modules/reputation/components";

interface ProfileHeaderProps {
  user: {
    id: string;
    username: string | null;
    displayName: string | null;
    email?: string;
    createdAt: Date;
    [key: string]: unknown;
  };
  profile?: {
    displayName?: string | null;
    biography?: string | null;
    avatarUrl?: string | null;
    coverUrl?: string | null;
    location?: string | null;
    website?: string | null;
  } | null;
  levelInfo?: {
    level?: { name: string; minPoints: number } | null;
    points: number;
    progress: number;
  } | null;
  reputation?: {
    reputationPoints: number;
    badgesEarned: number;
    trophiesEarned: number;
  } | null;
  isOwnProfile?: boolean;
  className?: string;
}

export function ProfileHeader({
  user,
  profile,
  levelInfo,
  reputation,
  isOwnProfile,
  className,
}: ProfileHeaderProps) {
  const name = profile?.displayName ?? user.displayName ?? user.username ?? "Unknown";

  return (
    <div className={cn("overflow-hidden rounded-2xl border bg-card", className)}>
      {/* Cover */}
      <div className="relative h-40 bg-gradient-to-br from-primary/10 via-muted to-premium/10 sm:h-52">
        {profile?.coverUrl && (
          <img
            src={profile.coverUrl}
            alt="Cover"
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {/* Profile info */}
      <div className="relative px-4 pb-5 sm:px-6">
        {/* Avatar */}
        <div className="-mt-16 flex items-end gap-4 sm:-mt-20">
          <div className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28">
            <div className="h-full w-full overflow-hidden rounded-2xl border-4 border-card bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/10 text-3xl font-bold text-primary">
                  {name[0]?.toUpperCase()}
                </div>
              )}
            </div>
            {/* Online indicator */}
            <span className="absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-card bg-emerald-500" />
          </div>

          <div className="flex-1 pb-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold sm:text-2xl">{name}</h1>
              {levelInfo?.level && (
                <LevelBadge level={levelInfo.level} size="md" />
              )}
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <span>@{user.username}</span>
              {reputation && (
                <>
                  <span aria-hidden="true">&middot;</span>
                  <span className="text-foreground font-medium">
                    {reputation.reputationPoints.toLocaleString()} rep
                  </span>
                  <span aria-hidden="true">&middot;</span>
                  <span>{reputation.badgesEarned} badges</span>
                  <span aria-hidden="true">&middot;</span>
                  <span>{reputation.trophiesEarned} trophies</span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pb-1">
            {isOwnProfile ? (
              <Link
                href="/settings/profile"
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
              >
                Edit Profile
              </Link>
            ) : (
              <>
                <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                  <MessageSquare className="h-4 w-4" />
                  Message
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent">
                  <UserPlus className="h-4 w-4" />
                  Follow
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile?.biography && (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {profile.biography}
          </p>
        )}

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {profile?.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {profile.location}
            </span>
          )}
          {profile?.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <Globe className="h-3.5 w-3.5" />
              {profile.website.replace(/^https?:\/\//, "")}
            </a>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Joined {formatDate(user.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
