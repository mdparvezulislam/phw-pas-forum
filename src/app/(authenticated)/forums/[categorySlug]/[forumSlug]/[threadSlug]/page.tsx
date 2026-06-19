import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getForumBySlugAndCategory } from "@/services/forum-stats";
import { getThreadWithUserState, incrementThreadView } from "@/services/thread";
import { getPosts, getNextPostNumber, getPostCount, getPostHistory } from "@/services/post";
import { ThreadBreadcrumbs, ThreadHeader, ThreadActions, ThreadAuthorCard } from "@/modules/thread/components";
import { PostCard, PostPagination, ReplyForm } from "@/modules/post/components";
import { ForumSidebar } from "@/modules/forum/components";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/config/rbac";
import { Permission } from "@/types/rbac";

interface ThreadPageProps {
  params: Promise<{ categorySlug: string; forumSlug: string; threadSlug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata(props: ThreadPageProps): Promise<Metadata> {
  const params = await props.params;
  const thread = await getThreadWithUserState(params.threadSlug, null);
  if (!thread) return { title: "Not found" };

  return {
    title: thread.title,
    description: thread.excerpt ?? undefined,
    openGraph: {
      title: `${thread.title} | BHW PAS`,
      description: thread.excerpt ?? undefined,
      type: "article",
      authors: [thread.author.displayName ?? thread.author.username ?? "Unknown"],
    },
  };
}

export default async function ThreadPage(props: ThreadPageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const session = await auth();

  const category = await getCategoryBySlug(params.categorySlug);
  if (!category) notFound();

  const forum = await getForumBySlugAndCategory(params.categorySlug, params.forumSlug);
  if (!forum) notFound();

  const thread = await getThreadWithUserState(params.threadSlug, session?.user?.id ?? null);
  if (!thread) notFound();

  await incrementThreadView(thread.id);

  const isOwner = session?.user?.id === thread.authorId;
  const isModerator = session?.user ? hasPermission(session.user, Permission.POST_MODERATE) : false;

  const page = Number(searchParams.page) || 1;
  const perPage = 50;

  const postResult = await getPosts({
    threadId: thread.id,
    page,
    perPage,
    sort: "asc",
  });

  const nextPostNumber = await getNextPostNumber(thread.id);
  const baseUrl = `/forums/${params.categorySlug}/${params.forumSlug}/${params.threadSlug}`;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        <ThreadBreadcrumbs
          items={[
            { label: "Forums", href: "/forums" },
            { label: category.title, href: `/forums/${category.slug}` },
            { label: forum.title, href: `/forums/${category.slug}/${forum.slug}` },
            { label: thread.title },
          ]}
        />

        <ThreadHeader thread={thread} categorySlug={category.slug} forumSlug={forum.slug} isOwner={isOwner} />

        <ThreadActions thread={thread} categorySlug={category.slug} forumSlug={forum.slug} />

        <div className="rounded-lg border bg-card p-6">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {thread.content}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Replies ({thread.replyCount})
            </h2>
          </div>

          <div className="space-y-4">
            {postResult.items.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                threadId={thread.id}
                isOwner={session?.user?.id === post.authorId}
                isModerator={isModerator}
                baseUrl={baseUrl}
              />
            ))}
          </div>

          {postResult.items.length === 0 && (
            <div className="rounded-lg border bg-muted/30 p-8 text-center">
              <p className="text-muted-foreground">
                No replies yet. Be the first to reply!
              </p>
            </div>
          )}

          <PostPagination
            currentPage={postResult.page}
            totalPages={postResult.totalPages}
            baseUrl={baseUrl}
            postNumber={page === 1 ? 1 : (page - 1) * perPage + 1}
          />
        </div>

        {session && (
          <ReplyForm
            threadId={thread.id}
            isLocked={thread.isLocked}
            nextPostNumber={nextPostNumber}
          />
        )}
      </div>

      <aside className="hidden space-y-4 lg:block">
        <ThreadAuthorCard thread={thread} />
        <ForumSidebar />
      </aside>
    </div>
  );
}
