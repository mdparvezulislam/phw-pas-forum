import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ForumBreadcrumbs } from "@/modules/forum/components";
import { EditThreadForm } from "@/modules/thread/components";
import {
  getCategoryBySlug,
  getForumBySlugAndCategory,
} from "@/services/forum-stats";
import { getThread } from "@/services/thread";

interface EditThreadPageProps {
  params: Promise<{
    categorySlug: string;
    forumSlug: string;
    threadSlug: string;
  }>;
}

export async function generateMetadata(
  props: EditThreadPageProps,
): Promise<Metadata> {
  const params = await props.params;
  const thread = await getThread(params.threadSlug);
  return {
    title: `Edit - ${thread?.title ?? "Thread"} | BHW PAS`,
  };
}

export default async function EditThreadPage(props: EditThreadPageProps) {
  const params = await props.params;
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  const category = await getCategoryBySlug(params.categorySlug);
  if (!category) notFound();

  const forum = await getForumBySlugAndCategory(
    params.categorySlug,
    params.forumSlug,
  );
  if (!forum) notFound();

  const thread = await getThread(params.threadSlug);
  if (!thread) notFound();

  if (thread.authorId !== session.user.id) {
    return (
      <div className="rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
        You can only edit your own threads.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ForumBreadcrumbs
        items={[
          { label: category.title, href: `/forums/${category.slug}` },
          {
            label: forum.title,
            href: `/forums/${category.slug}/${forum.slug}`,
          },
          {
            label: thread.title,
            href: `/forums/${category.slug}/${forum.slug}/${thread.slug}`,
          },
          { label: "Edit" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold">Edit Thread</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your thread &quot;{thread.title}&quot;
        </p>
      </div>

      <div className="rounded-lg border p-6">
        <EditThreadForm thread={thread} />
      </div>
    </div>
  );
}
