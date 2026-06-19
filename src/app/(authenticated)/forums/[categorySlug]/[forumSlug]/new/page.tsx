import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { ForumBreadcrumbs } from "@/modules/forum/components";
import { CreateThreadForm } from "@/modules/thread/components";
import {
  getCategoryBySlug,
  getForumBySlugAndCategory,
} from "@/services/forum-stats";

interface NewThreadPageProps {
  params: Promise<{ categorySlug: string; forumSlug: string }>;
}

export async function generateMetadata(
  props: NewThreadPageProps,
): Promise<Metadata> {
  const params = await props.params;
  const _category = await getCategoryBySlug(params.categorySlug);
  const forum = await getForumBySlugAndCategory(
    params.categorySlug,
    params.forumSlug,
  );
  return {
    title: `New Thread - ${forum?.title ?? "Forum"} | BHW PAS`,
    description: `Create a new thread in ${forum?.title}`,
  };
}

export default async function NewThreadPage(props: NewThreadPageProps) {
  const params = await props.params;
  const session = await auth();

  if (!session) {
    return (
      <div className="rounded-md bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
        You must be logged in to create a thread.
      </div>
    );
  }

  const category = await getCategoryBySlug(params.categorySlug);
  if (!category) notFound();

  const forum = await getForumBySlugAndCategory(
    params.categorySlug,
    params.forumSlug,
  );
  if (!forum) notFound();

  if (forum.isLocked) {
    return (
      <div className="rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
        This forum is locked. No new threads can be created.
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
          { label: "New Thread" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold">Create New Thread</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start a discussion in {forum.title}
        </p>
      </div>

      <div className="rounded-lg border p-6">
        <CreateThreadForm forumId={forum.id} />
      </div>
    </div>
  );
}
