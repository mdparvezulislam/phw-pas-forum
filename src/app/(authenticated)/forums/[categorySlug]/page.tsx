import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getForumsByCategory } from "@/services/forum-stats";
import { ForumCard } from "@/modules/forum/components";
import { ForumBreadcrumbs } from "@/modules/forum/components/forum-breadcrumbs";
import { ForumSidebar } from "@/modules/forum/components/forum-sidebar";

interface CategoryPageProps {
  params: Promise<{ categorySlug: string }>;
}

export async function generateMetadata(
  props: CategoryPageProps,
): Promise<Metadata> {
  const params = await props.params;
  const category = await getCategoryBySlug(params.categorySlug);

  if (!category) return { title: "Category not found" };

  return {
    title: category.title,
    description: category.description ?? `Browse ${category.title} forums`,
    openGraph: {
      title: `${category.title} | BHW PAS`,
      description: category.description ?? undefined,
    },
  };
}

export default async function CategoryPage(props: CategoryPageProps) {
  const params = await props.params;
  const category = await getCategoryBySlug(params.categorySlug);

  if (!category) notFound();

  const forums = await getForumsByCategory(category.id);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        <ForumBreadcrumbs
          items={[{ label: category.title, href: `/forums/${category.slug}` }]}
        />

        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
            style={{
              backgroundColor: category.color
                ? `${category.color}1a`
                : undefined,
            }}
          >
            {category.icon ?? "📁"}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{category.title}</h1>
            {category.description && (
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {forums.length > 0 ? (
            forums.map((forum) => (
              <ForumCard
                key={forum.id}
                forum={forum}
                categorySlug={category.slug}
              />
            ))
          ) : (
            <div className="rounded-lg border border-dashed py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No forums in this category yet.
              </p>
            </div>
          )}
        </div>
      </div>

      <aside className="hidden lg:block">
        <ForumSidebar />
      </aside>
    </div>
  );
}
