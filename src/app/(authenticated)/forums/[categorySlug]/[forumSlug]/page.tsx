import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  ForumFilters,
  EmptyThreadState,
  ThreadCard,
} from "@/components/forum";
import { SubForumList } from "@/modules/forum/components/subforum-list";
import { ThreadPagination } from "@/modules/thread/components";
import {
  getCategoryBySlug,
  getForumBySlugAndCategory,
  getSubForums,
} from "@/services/forum-stats";
import { getPinnedThreads, getThreads } from "@/services/thread";

interface ForumPageProps {
  params: Promise<{ categorySlug: string; forumSlug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}

export async function generateMetadata(
  props: ForumPageProps,
): Promise<Metadata> {
  const params = await props.params;
  const category = await getCategoryBySlug(params.categorySlug);
  if (!category) return { title: "Not found" };

  const forum = await getForumBySlugAndCategory(
    params.categorySlug,
    params.forumSlug,
  );
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

  const forum = await getForumBySlugAndCategory(
    params.categorySlug,
    params.forumSlug,
  );
  if (!forum) notFound();

  const subForums = await getSubForums(forum.id);
  const page = Number(searchParams.page) || 1;
  const sort = searchParams.sort ?? "latest";

  const [pinnedThreads, threadResult] = await Promise.all([
    getPinnedThreads(forum.id),
    getThreads({ forumId: forum.id, page, perPage: 20, sort: sort as "latest" }),
  ]);

  return (
    <div className="pt-4">
      {/* Forum Header */}
      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-xl">
              {forum.icon ?? "💬"}
            </div>
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">{forum.title}</h1>
              {forum.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {forum.description}
                </p>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span>{forum.threadCount.toLocaleString()} threads</span>
            <span>{forum.postCount.toLocaleString()} posts</span>
          </div>
        </div>

        {forum.isLocked && (
          <div className="border-t bg-amber-500/5 px-5 py-2.5 text-sm text-amber-600 dark:text-amber-400">
            This forum is locked. No new posts can be created.
          </div>
        )}
        {forum.isPremiumOnly && (
          <div className="border-t bg-purple-500/5 px-5 py-2.5 text-sm text-purple-600 dark:text-purple-400">
            This is a premium forum. Upgrade to access.
          </div>
        )}
      </div>

      {/* Sub-forums */}
      {subForums.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-xl border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Sub-forums
          </h2>
          <SubForumList forums={subForums} categorySlug={category.slug} />
        </div>
      )}

      {/* Threads */}
      <div className="mt-6 overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-col gap-4 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Threads</h2>
            <ForumFilters />
          </div>
          {session && !forum.isLocked && (
            <Link
              href={`/forums/${category.slug}/${forum.slug}/new`}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              New Thread
            </Link>
          )}
        </div>

        <div className="divide-y">
          {pinnedThreads.length > 0 && (
            <>
              <div className="bg-muted/20 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pinned
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
            <EmptyThreadState />
          )}
        </div>

        <ThreadPagination
          currentPage={threadResult.page}
          totalPages={threadResult.totalPages}
          baseUrl={`/forums/${category.slug}/${forum.slug}`}
        />
      </div>
    </div>
  );
}
