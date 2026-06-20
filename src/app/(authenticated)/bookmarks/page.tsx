import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getBookmarkedThreads } from "@/services/user-dashboard";
import { UserEmptyState } from "@/components/user";
import { Bookmark, MessageSquare, Eye, ChevronRight } from "lucide-react";
import { formatDateRelative } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "Your saved threads and listings",
};

export default async function BookmarksPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const bookmarks = await getBookmarkedThreads(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bookmarks</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {bookmarks.length} saved thread{bookmarks.length !== 1 ? "s" : ""}
        </p>
      </div>

      {bookmarks.length > 0 ? (
        <div className="space-y-2">
          {bookmarks.map((bm) => (
            <Link
              key={bm.id}
              href={`/forums/${bm.category.slug}/${bm.forum.slug}/${bm.slug}`}
              className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/10">
                <Bookmark className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold group-hover:text-primary transition-colors">
                  {bm.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {bm.category.title} &middot; {bm.forum.title}
                  <span className="mx-2">&middot;</span>
                  Bookmarked {formatDateRelative(bm.bookmarkedAt)}
                </p>
              </div>
              <div className="hidden items-center gap-3 text-xs text-muted-foreground sm:flex">
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {bm.replyCount}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {bm.viewCount}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      ) : (
        <UserEmptyState type="no-bookmarks" />
      )}
    </div>
  );
}
