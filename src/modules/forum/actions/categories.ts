"use server";

import { revalidatePath } from "next/cache";
import { getDatabase, schema } from "@/db";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { auditService } from "@/services/audit";
import { requireRole } from "@/modules/auth/guards";
import { RoleName } from "@/types/rbac";
import { slugify } from "@/lib/utils";
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@/validations/forum";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";

export type CategoryActionState = {
  error?: string;
  success?: boolean;
};

export async function createCategory(
  prevState: CategoryActionState | undefined,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireRole(RoleName.ADMIN);

  const raw: CreateCategoryInput = {
    title: formData.get("title") as string,
    slug: (formData.get("slug") as string) || slugify(formData.get("title") as string),
    description: (formData.get("description") as string) || undefined,
    icon: (formData.get("icon") as string) || undefined,
    color: (formData.get("color") as string) || undefined,
    position: Number(formData.get("position")) || 0,
    isVisible: formData.get("isVisible") === "on",
    isPremiumOnly: formData.get("isPremiumOnly") === "on",
  };

  const parsed = createCategorySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.title?.[0] ?? "Invalid input" };
  }

  const db = getDatabase();
  await db.insert(schema.categories).values(parsed.data);

  const session = await auth();
  await auditService.log(session?.user?.id ?? null, AUDIT_ACTIONS.FORUM_CATEGORY_CREATE, {
    resource: "category",
    metadata: { title: parsed.data.title, slug: parsed.data.slug },
  });

  revalidatePath("/forums");
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function updateCategory(
  prevState: CategoryActionState | undefined,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireRole(RoleName.ADMIN);

  const raw: UpdateCategoryInput = {
    id: formData.get("id") as string,
    title: (formData.get("title") as string) || undefined,
    slug: (formData.get("slug") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
    icon: (formData.get("icon") as string) || undefined,
    color: (formData.get("color") as string) || undefined,
    position: formData.get("position") ? Number(formData.get("position")) : undefined,
    isVisible: formData.get("isVisible") !== undefined ? formData.get("isVisible") === "on" : undefined,
    isPremiumOnly: formData.get("isPremiumOnly") !== undefined ? formData.get("isPremiumOnly") === "on" : undefined,
  };

  const parsed = updateCategorySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Invalid input" };
  }

  const db = getDatabase();
  await db
    .update(schema.categories)
    .set(parsed.data)
    .where(eq(schema.categories.id, parsed.data.id));

  const session = await auth();
  await auditService.log(session?.user?.id ?? null, AUDIT_ACTIONS.FORUM_CATEGORY_UPDATE, {
    resource: "category",
    resourceId: parsed.data.id,
  });

  revalidatePath("/forums");
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(
  prevState: CategoryActionState | undefined,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireRole(RoleName.ADMIN);

  const id = formData.get("id") as string;
  if (!id) return { error: "Category ID is required" };

  const db = getDatabase();
  await db.delete(schema.categories).where(eq(schema.categories.id, id));

  const session = await auth();
  await auditService.log(session?.user?.id ?? null, AUDIT_ACTIONS.FORUM_CATEGORY_DELETE, {
    resource: "category",
    resourceId: id,
  });

  revalidatePath("/forums");
  revalidatePath("/admin/categories");
  return { success: true };
}
