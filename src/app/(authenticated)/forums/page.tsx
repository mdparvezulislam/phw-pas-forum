import type { Metadata } from "next";
import { CategoryCard } from "@/modules/forum/components";
import { ForumStats } from "@/modules/forum/components/forum-stats";
import { ForumSidebar } from "@/modules/forum/components/forum-sidebar";
import { MobileForumMenu } from "@/modules/forum/components/mobile-forum-menu";
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

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Forums</h1>
          <p className="mt-1 text-muted-foreground">
            Browse our community categories and forums
          </p>
        </div>

        <ForumStats
          totalForums={stats.totalForums}
          totalCategories={stats.totalCategories}
          totalMembers={stats.totalMembers}
        />

        <div className="lg:hidden">
          <MobileForumMenu />
        </div>

        <div className="space-y-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        {categories.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
            <h3 className="text-lg font-semibold">No forums yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Forums are being set up. Check back later.
            </p>
          </div>
        )}
      </div>

      <aside className="hidden lg:block">
        <ForumSidebar />
      </aside>
    </div>
  );
}
