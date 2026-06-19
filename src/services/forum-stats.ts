import "server-only";

import { getDatabase, schema } from "@/db";
import { eq, asc, or, and, count } from "drizzle-orm";
import type { CategoryWithForums, ForumWithChildren } from "@/modules/forum/types";

export async function getCategoriesWithForums(): Promise<CategoryWithForums[]> {
  const db = getDatabase();

  const cats = await db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.position)],
    where: (categories, { eq }) => eq(categories.isVisible, true),
  });

  const allForums = await db.query.forums.findMany({
    orderBy: (forums, { asc }) => [asc(forums.position)],
    where: (forums, { eq }) => eq(forums.isVisible, true),
  });

  return cats.map((cat) => {
    const catForums = buildForumTree(
      allForums.filter((f) => f.categoryId === cat.id),
    );

    return {
      id: cat.id,
      title: cat.title,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      color: cat.color,
      position: cat.position,
      isVisible: cat.isVisible,
      isPremiumOnly: cat.isPremiumOnly,
      forums: catForums,
    };
  });
}

export async function getCategoryBySlug(slug: string) {
  const db = getDatabase();
  return db.query.categories.findFirst({
    where: (categories, { eq }) => eq(categories.slug, slug),
  });
}

export async function getForumBySlug(slug: string) {
  const db = getDatabase();
  return db.query.forums.findFirst({
    where: (forums, { eq }) => eq(forums.slug, slug),
  });
}

export async function getForumBySlugAndCategory(
  categorySlug: string,
  forumSlug: string,
) {
  const db = getDatabase();
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return null;

  return db.query.forums.findFirst({
    where: (forums, { and, eq }) =>
      and(eq(forums.slug, forumSlug), eq(forums.categoryId, category.id)),
  });
}

export async function getForumsByCategory(categoryId: string) {
  const db = getDatabase();
  const forums = await db.query.forums.findMany({
    where: (forums, { and, eq, isNull }) =>
      and(eq(forums.categoryId, categoryId), eq(forums.isVisible, true)),
    orderBy: (forums, { asc }) => [asc(forums.position)],
  });

  return buildForumTree(forums);
}

export async function getSubForums(parentForumId: string) {
  const db = getDatabase();
  const subForums = await db.query.forums.findMany({
    where: (forums, { and, eq }) =>
      and(eq(forums.parentForumId, parentForumId), eq(forums.isVisible, true)),
    orderBy: (forums, { asc }) => [asc(forums.position)],
  });

  return buildForumTree(subForums);
}

export async function getStats() {
  const db = getDatabase();

  const [forumCount] = await db
    .select({ value: count() })
    .from(schema.forums);

  const [categoryCount] = await db
    .select({ value: count() })
    .from(schema.categories);

  const [memberCount] = await db
    .select({ value: count() })
    .from(schema.users);

  const totalThreads = await db
    .select({ value: count() })
    .from(schema.forums)
    .then((r) => 0); // placeholder, threads not built yet

  return {
    totalForums: Number(forumCount.value),
    totalCategories: Number(categoryCount.value),
    totalMembers: Number(memberCount.value),
  };
}

function buildForumTree(
  flatForums: any[],
  parentId: string | null = null,
): ForumWithChildren[] {
  return flatForums
    .filter((f) => f.parentForumId === parentId)
    .sort((a, b) => a.position - b.position)
    .map((forum) => ({
      id: forum.id,
      title: forum.title,
      slug: forum.slug,
      description: forum.description,
      icon: forum.icon,
      position: forum.position,
      isVisible: forum.isVisible,
      isLocked: forum.isLocked,
      isPremiumOnly: forum.isPremiumOnly,
      threadCount: forum.threadCount,
      postCount: forum.postCount,
      lastActivityAt: forum.lastActivityAt,
      parentForumId: forum.parentForumId,
      children: buildForumTree(flatForums, forum.id),
    }));
}
