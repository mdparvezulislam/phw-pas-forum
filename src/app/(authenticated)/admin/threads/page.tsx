import type { Metadata } from "next";
import { MessageSquare, Pin, Star } from "lucide-react";
import { getDatabase } from "@/db";
import { PageHeader, KpiCard } from "@/components/admin";
import { ThreadsTable, type AdminThreadItem } from "./threads-table";

export const metadata: Metadata = { title: "Manage Threads" };

export default async function AdminThreadsPage() {
  const db = getDatabase();
  const threads = (await db.query.threads.findMany({
    orderBy: (threads, { desc }) => [desc(threads.publishedAt)],
    limit: 100,
    with: {
      author: { columns: { id: true, username: true, displayName: true } },
      forum: { columns: { id: true, title: true, slug: true } },
    },
  })) as Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    isPinned: boolean;
    isLocked: boolean;
    isFeatured: boolean;
    replyCount: number;
    viewCount: number;
    author: { username: string | null; displayName: string | null };
    forum: { title: string };
  }>;

  const items: AdminThreadItem[] = threads.map((t) => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    status: t.status,
    isPinned: t.isPinned,
    isLocked: t.isLocked,
    isFeatured: t.isFeatured,
    replyCount: t.replyCount,
    viewCount: t.viewCount,
    authorName: t.author.displayName ?? t.author.username ?? "Unknown",
    forumTitle: t.forum.title,
  }));

  const pinned = items.filter((t) => t.isPinned).length;
  const featured = items.filter((t) => t.isFeatured).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Threads"
        description="View and moderate threads across the forum."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          title="Threads"
          value={items.length.toLocaleString()}
          icon={MessageSquare}
          accent="info"
          description="Most recent 100 shown"
        />
        <KpiCard title="Pinned" value={pinned} icon={Pin} accent="primary" />
        <KpiCard
          title="Featured"
          value={featured}
          icon={Star}
          accent="premium"
        />
      </div>

      <ThreadsTable threads={items} />
    </div>
  );
}
