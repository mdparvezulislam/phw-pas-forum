import type { Metadata } from "next";
import Link from "next/link";
import { getDatabase } from "@/db";
import { formatDateRelative } from "@/lib/utils";
import { requireRole } from "@/modules/auth/guards";
import { ThreadStatusBadge } from "@/modules/thread/components";
import { RoleName } from "@/types/rbac";

export const metadata: Metadata = {
  title: "Moderator - Thread Management",
};

export default async function ModThreadsPage() {
  await requireRole(RoleName.MODERATOR);

  const db = getDatabase();
  const threads = (await db.query.threads.findMany({
    orderBy: (threads, { desc }) => [desc(threads.createdAt)],
    limit: 100,
    with: {
      author: {
        columns: { id: true, username: true, displayName: true, image: true },
      },
      forum: {
        columns: { id: true, title: true, slug: true },
        with: {
          category: {
            columns: { slug: true },
          },
        },
      },
    },
  })) as {
    id: string;
    title: string;
    slug: string;
    status: string;
    isPinned: boolean;
    isLocked: boolean;
    isFeatured: boolean;
    replyCount: number;
    viewCount: number;
    createdAt: Date;
    author: {
      id: string;
      username: string | null;
      displayName: string | null;
      image: string | null;
    };
    forum: {
      id: string;
      title: string;
      slug: string;
      category: { slug: string };
    };
  }[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Thread Moderation</h1>
        <p className="text-sm text-muted-foreground">
          Manage and moderate threads across all forums.
        </p>
      </div>

      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Thread</th>
                <th className="px-4 py-3 text-left font-medium">Author</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-center font-medium">Replies</th>
                <th className="px-4 py-3 text-center font-medium">Views</th>
                <th className="px-4 py-3 text-left font-medium">Forum</th>
                <th className="px-4 py-3 text-left font-medium">Created</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {threads.map((thread) => (
                <tr key={thread.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{thread.title}</div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      {thread.isPinned && (
                        <span className="text-primary">Pinned</span>
                      )}
                      {thread.isLocked && (
                        <span className="text-amber-500">Locked</span>
                      )}
                      {thread.isFeatured && (
                        <span className="text-amber-500">Featured</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {thread.author.displayName ?? thread.author.username}
                  </td>
                  <td className="px-4 py-3">
                    <ThreadStatusBadge status={thread.status} />
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {thread.replyCount}
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {thread.viewCount}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {thread.forum.title}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDateRelative(thread.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/forums/${thread.forum.category.slug}/${thread.forum.slug}/${thread.slug}`}
                        className="text-xs text-primary hover:underline"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {threads.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No threads found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
