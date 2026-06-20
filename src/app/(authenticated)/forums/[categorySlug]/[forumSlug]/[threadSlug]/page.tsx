import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasPermission } from "@/config/rbac";
import { auth } from "@/lib/auth";
import { ContentRenderer } from "@/modules/editor/components";
import { ThreadSidebar } from "@/components/forum";
import { PostCard, PostPagination, ReplyForm } from "@/modules/post/components";
import { ThreadActions } from "@/modules/thread/components";
import { ThreadHeader } from "@/components/forum";
import {
  getCategoryBySlug,
  getForumBySlugAndCategory,
} from "@/services/forum-stats";
import {
  getNextPostNumber,
  getPostsWithReputation,
} from "@/services/post";
import { getThreadWithUserState, incrementThreadView } from "@/services/thread";
import { Permission } from "@/types/rbac";

interface ThreadPageProps {
  params: Promise<{
    categorySlug: string;
    forumSlug: string;
    threadSlug: string;
  }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata(
  props: ThreadPageProps,
): Promise<Metadata> {
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
      authors: [
        thread.author.displayName ?? thread.author.username ?? "Unknown",
      ],
    },
  };
}

export default async function ThreadPage(props: ThreadPageProps) {
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

  const thread = await getThreadWithUserState(
    params.threadSlug,
    session?.user?.id ?? null,
  );
  if (!thread) notFound();

  await incrementThreadView(thread.id);

  const isOwner = session?.user?.id === thread.authorId;
  const isModerator = session?.user
    ? hasPermission(session.user, Permission.POST_MODERATE)
    : false;

  const page = Number(searchParams.page) || 1;
  const perPage = 50;

  const postResult = await getPostsWithReputation({
    threadId: thread.id,
    page,
    perPage,
    sort: "asc",
  });

  const nextPostNumber = await getNextPostNumber(thread.id);
  const baseUrl = `/forums/${params.categorySlug}/${params.forumSlug}/${params.threadSlug}`;

  return (
    <div className="pt-4">
      {/* Thread Header (new design with breadcrumbs + meta + actions) */}
      <ThreadHeader
        thread={thread}
        categorySlug={category.slug}
        categoryTitle={category.title}
        forumSlug={forum.slug}
        forumTitle={forum.title}
      />

      {/* Thread Actions */}
      <div className="mt-4">
        <ThreadActions
          thread={thread}
          categorySlug={category.slug}
          forumSlug={forum.slug}
        />
      </div>

      {/* Thread Content */}
      <div className="mt-4 overflow-hidden rounded-xl border bg-card p-5 sm:p-6">
        <ContentRenderer content={thread.contentJson ?? thread.content} />
      </div>

      {/* Replies */}
      <div className="mt-6 space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          Replies
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium text-muted-foreground">
            {thread.replyCount}
          </span>
        </h2>

        <div className="space-y-4">
          {postResult.items.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isOwner={session?.user?.id === post.authorId}
              isModerator={isModerator}
              baseUrl={baseUrl}
            />
          ))}
        </div>

        {postResult.items.length === 0 && (
          <div className="rounded-xl border bg-card p-12 text-center">
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

      {/* Reply Form */}
      {session && (
        <div className="mt-6">
          <ReplyForm
            threadId={thread.id}
            isLocked={thread.isLocked}
            nextPostNumber={nextPostNumber}
          />
        </div>
      )}
    </div>
  );
}
