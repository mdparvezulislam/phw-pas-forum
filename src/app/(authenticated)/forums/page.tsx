import type { Metadata } from "next";
import { CategoryCard } from "@/components/forum";
import { ForumStats } from "@/components/forum";
import { ActivityFeed } from "@/components/forum";
import { EmptyForumState } from "@/components/forum";
import { getCategoriesWithForums, getStats } from "@/services/forum-stats";

export const metadata: Metadata = {
  title: "Forums",
  description: "Browse our community forums",
  openGraph: {
    title: "Forums | BHW PAS",
    description: "Browse our community forums",
  },
};

export default async function ForumsHomePage() {
  const categories = await getCategoriesWithForums();
  const stats = await getStats();

  const activityItems = categories.slice(0, 5).flatMap((cat) =>
    cat.forums.slice(0, 1).map((f) => ({
      type: "thread" as const,
      title: f.title,
      author: "Community",
      timestamp: f.lastActivityAt ?? new Date(),
      slug: f.slug,
      categorySlug: cat.slug,
      forumSlug: f.slug,
    })),
  );

  return (
    <div className="pt-4">
      {/* Hero Banner */}
      <div className="overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 via-card to-premium/5">
        <div className="px-6 py-8 sm:px-8">
          <h1 className="text-2xl font-bold sm:text-3xl">Community Forums</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Join discussions, share knowledge, and connect with thousands of professionals.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6">
        <ForumStats
          totalForums={stats.totalForums}
          totalCategories={stats.totalCategories}
          totalMembers={stats.totalMembers}
        />
      </div>

      {/* Categories + Activity */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {categories.length > 0 ? (
            categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))
          ) : (
            <EmptyForumState />
          )}
        </div>

        <div className="hidden lg:block">
          <ActivityFeed items={activityItems} />
        </div>
      </div>
    </div>
  );
}
