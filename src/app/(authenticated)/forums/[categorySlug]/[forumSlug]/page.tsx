import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryBySlug, getForumBySlugAndCategory, getSubForums } from "@/services/forum-stats";
import { getThreads, getPinnedThreads } from "@/services/thread";
import { ForumHeader, ForumBreadcrumbs, ForumSidebar, EmptyForumState } from "@/modules/forum/components";
import { SubForumList } from "@/modules/forum/components/subforum-list";
import { ThreadCard, ThreadPagination } from "@/modules/thread/components";
import { auth } from "@/lib/auth";

interface ForumPageProps {
  params: Promise<{ categorySlug: string; forumSlug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata(
  props: ForumPageProps,
): Promise<Metadata> {
  const params = await props.params;
  const category = await getCategoryBySlug(params.categorySlug);
  if (!category) return { title: "Not found" };

  const forum = await getForumBySlugAndCategory(params.categorySlug, params.forumSlug);
  if (!forum) return { title: "Not found" };

  return {
    title: forum.title,
    description: forum.description ?? `Browse ${forum.title}`,
    openGraph: {
      title: `${forum.title} | BHW PAS`,
      description: forum.description ?? undefined,
    },
  };
}

export default async function ForumPage(props: ForumPageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const session = await auth();

  const category = await getCategoryBySlug(params.categorySlug);
  if (!category) notFound();

  const forum = await getForumBySlugAndCategory(params.categorySlug, params.forumSlug);
  if (!forum) notFound();

  const subForums = await getSubForums(forum.id);
  const page = Number(searchParams.page) || 1;

  const [pinnedThreads, threadResult] = await Promise.all([
    getPinnedThreads(forum.id),
    getThreads({ forumId: forum.id, page, perPage: 20, sort: "latest" }),
  ]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        <ForumBreadcrumbs
          items={[
            { label: category.title, href: `/forums/${category.slug}` },
            { label: forum.title, href: `/forums/${category.slug}/${forum.slug}` },
          ]}
        />

        <ForumHeader
          title={forum.title}
          description={forum.description}
          icon={forum.icon}
        />

        {forum.isLocked && (
          <div className="rounded-md bg-amber-500/10 px-4 py-2 text-sm text-amber-600 dark:text-amber-400">
            This forum is locked. No new posts can be created.
          </div>
        )}

        {forum.isPremiumOnly && (
          <div className="rounded-md bg-purple-500/10 px-4 py-2 text-sm text-purple-600 dark:text-purple-400">
            This is a premium forum. Upgrade to access.
          </div>
        )}

        {subForums.length > 0 && (
          <div className="rounded-lg border p-4">
            <h2 className="mb-3 font-semibold">Sub-forums</h2>
            <SubForumList
              forums={subForums}
              categorySlug={category.slug}
            />
          </div>
        )}

        <div className="rounded-lg border">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="font-semibold">Threads</h2>
            {session && !forum.isLocked && (
              <Link
                href={`/forums/${category.slug}/${forum.slug}/new`}
                className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                New Thread
              </Link>
            )}
          </div>

          {!forum.isLocked && (
            <div className="border-b bg-muted/30 px-4 py-2">
              <Link
                href={`/forums/${category.slug}/${forum.slug}/new`}
                className="text-sm font-medium text-primary hover:underline"
              >
                + Post New Thread
              </Link>
            </div>
          )}

          <div className="divide-y">
            {pinnedThreads.length > 0 && (
              <>
                <div className="bg-muted/20 px-4 py-2 text-xs font-semibold uppercase text-muted-foreground">
                  Pinned Threads
                </div>
                {pinnedThreads.map((thread) => (
                  <ThreadCard
                    key={thread.id}
                    thread={thread}
                    categorySlug={category.slug}
                    forumSlug={forum.slug}
                  />
                ))}
                <div className="border-t border-dashed" />
              </>
            )}

            {threadResult.items.length > 0 ? (
              threadResult.items.map((thread) => (
                <ThreadCard
                  key={thread.id}
                  thread={thread}
                  categorySlug={category.slug}
                  forumSlug={forum.slug}
                />
              ))
            ) : (
              <EmptyForumState
                title="No threads yet"
                description="Be the first to start a discussion in this forum."
              />
            )}
          </div>

          <ThreadPagination
            currentPage={threadResult.page}
            totalPages={threadResult.totalPages}
            baseUrl={`/forums/${category.slug}/${forum.slug}`}
          />
        </div>
      </div>

      <aside className="hidden lg:block">
        <ForumSidebar />
      </aside>
    </div>
  );
}
