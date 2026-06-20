import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getWatchedThreads } from "@/services/user-dashboard";
import { UserEmptyState } from "@/components/user";
import { Eye, MessageSquare, Activity, ChevronRight, User } from "lucide-react";
import { formatDateRelative } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Watched Threads",
  description: "Threads you're watching",
};

export default async function WatchedPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const watched = await getWatchedThreads(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Watched Threads</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {watched.length} watched thread{watched.length !== 1 ? "s" : ""}
        </p>
      </div>

      {watched.length > 0 ? (
        <div className="space-y-2">
          {watched.map((wt) => (
            <Link
              key={wt.id}
              href={`/forums/${wt.category.slug}/${wt.forum.slug}/${wt.slug}`}
              className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                <Eye className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold group-hover:text-primary transition-colors">
                  {wt.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {wt.category.title} &middot; {wt.forum.title}
                  <span className="mx-2">&middot;</span>
                  {wt.author.displayName ?? wt.author.username ?? "Unknown"}
                </p>
              </div>
              <div className="hidden items-center gap-3 text-xs text-muted-foreground sm:flex">
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {wt.replyCount}
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  {wt.lastActivityAt ? formatDateRelative(wt.lastActivityAt) : "N/A"}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      ) : (
        <UserEmptyState type="no-watched" />
      )}
    </div>
  );
}
