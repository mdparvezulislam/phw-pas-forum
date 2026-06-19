"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDatabase, schema } from "@/db";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { requireRole } from "@/modules/auth/guards";
import { auditService } from "@/services/audit";
import { getCategoryBySlug } from "@/services/forum-stats";
import { RoleName } from "@/types/rbac";
import {
  type CreateForumInput,
  createForumSchema,
  type UpdateForumInput,
  updateForumSchema,
} from "@/validations/forum";

export type ForumActionState = {
  error?: string;
  success?: boolean;
};

export async function createForum(
  prevState: ForumActionState | undefined,
  formData: FormData,
): Promise<ForumActionState> {
  await requireRole(RoleName.ADMIN);

  const raw: CreateForumInput = {
    categoryId: formData.get("categoryId") as string,
    parentForumId: (formData.get("parentForumId") as string) || undefined,
    title: formData.get("title") as string,
    slug:
      (formData.get("slug") as string) ||
      slugify(formData.get("title") as string),
    description: (formData.get("description") as string) || undefined,
    icon: (formData.get("icon") as string) || undefined,
    position: Number(formData.get("position")) || 0,
    isVisible: formData.get("isVisible") === "on",
    isLocked: formData.get("isLocked") === "on",
    isPremiumOnly: formData.get("isPremiumOnly") === "on",
  };

  const parsed = createForumSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: parsed.error.flatten().fieldErrors.title?.[0] ?? "Invalid input",
    };
  }

  const db = getDatabase();
  await db.insert(schema.forums).values(parsed.data);

  const session = await auth();
  await auditService.log(
    session?.user?.id ?? null,
    AUDIT_ACTIONS.FORUM_CREATE,
    {
      resource: "forum",
      metadata: { title: parsed.data.title, slug: parsed.data.slug },
    },
  );

  revalidatePath("/forums");
  revalidatePath("/admin/forums");
  return { success: true };
}

export async function updateForum(
  prevState: ForumActionState | undefined,
  formData: FormData,
): Promise<ForumActionState> {
  await requireRole(RoleName.ADMIN);

  const raw: UpdateForumInput = {
    id: formData.get("id") as string,
    categoryId: (formData.get("categoryId") as string) || undefined,
    parentForumId: (formData.get("parentForumId") as string) || undefined,
    title: (formData.get("title") as string) || undefined,
    slug: (formData.get("slug") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
    icon: (formData.get("icon") as string) || undefined,
    position: formData.get("position")
      ? Number(formData.get("position"))
      : undefined,
    isVisible:
      formData.get("isVisible") !== undefined
        ? formData.get("isVisible") === "on"
        : undefined,
    isLocked:
      formData.get("isLocked") !== undefined
        ? formData.get("isLocked") === "on"
        : undefined,
    isPremiumOnly:
      formData.get("isPremiumOnly") !== undefined
        ? formData.get("isPremiumOnly") === "on"
        : undefined,
  };

  const parsed = updateForumSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Invalid input" };
  }

  const db = getDatabase();
  await db
    .update(schema.forums)
    .set(parsed.data)
    .where(eq(schema.forums.id, parsed.data.id));

  const session = await auth();
  await auditService.log(
    session?.user?.id ?? null,
    AUDIT_ACTIONS.FORUM_UPDATE,
    {
      resource: "forum",
      resourceId: parsed.data.id,
    },
  );

  revalidatePath("/forums");
  revalidatePath("/admin/forums");
  return { success: true };
}

export async function deleteForum(
  prevState: ForumActionState | undefined,
  formData: FormData,
): Promise<ForumActionState> {
  await requireRole(RoleName.ADMIN);

  const id = formData.get("id") as string;
  if (!id) return { error: "Forum ID is required" };

  const db = getDatabase();
  await db.delete(schema.forums).where(eq(schema.forums.id, id));

  const session = await auth();
  await auditService.log(
    session?.user?.id ?? null,
    AUDIT_ACTIONS.FORUM_DELETE,
    {
      resource: "forum",
      resourceId: id,
    },
  );

  revalidatePath("/forums");
  revalidatePath("/admin/forums");
  return { success: true };
}
