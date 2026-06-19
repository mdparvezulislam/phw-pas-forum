import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDatabase, schema } from "@/db";
import { formatDate } from "@/lib/utils";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata(
  props: ProfilePageProps,
): Promise<Metadata> {
  const params = await props.params;
  return {
    title: params.username,
  };
}

export default async function ProfilePage(props: ProfilePageProps) {
  const params = await props.params;
  const db = getDatabase();

  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.username, params.username),
    with: {
      role: true,
    },
  });

  if (!user) {
    notFound();
  }

  const profile = await db.query.profiles.findFirst({
    where: (profiles, { eq }) => eq(profiles.userId, user.id),
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="relative h-48 w-full overflow-hidden rounded-lg bg-muted sm:h-64">
        {profile?.coverUrl && (
          <img
            src={profile.coverUrl}
            alt="Cover"
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="relative -mt-16 flex items-end gap-4 px-4">
        <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-background bg-muted">
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={user.displayName ?? user.username ?? "Avatar"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-3xl font-bold text-primary">
              {(user.displayName ?? user.username ?? "U")[0].toUpperCase()}
            </div>
          )}
        </div>
        <div className="pb-4">
          <h1 className="text-2xl font-bold">
            {profile?.displayName ?? user.displayName ?? user.username}
          </h1>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          <div className="rounded-lg border p-4">
            <h2 className="font-semibold">About</h2>
            {profile?.biography ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {profile.biography}
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                No biography yet.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h2 className="font-semibold">Details</h2>
            <dl className="mt-2 space-y-2 text-sm">
              {profile?.location && (
                <div>
                  <dt className="text-muted-foreground">Location</dt>
                  <dd>{profile.location}</dd>
                </div>
              )}
              {profile?.website && (
                <div>
                  <dt className="text-muted-foreground">Website</dt>
                  <dd>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {profile.website}
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground">Joined</dt>
                <dd>{formatDate(user.createdAt)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
