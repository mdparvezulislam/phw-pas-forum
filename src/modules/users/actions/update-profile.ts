"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { DISPLAY_NAME_REGEX } from "@/constants";
import { getDatabase, schema } from "@/db";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";
import { auth } from "@/lib/auth";
import { auditService } from "@/services/audit";

const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(50, "Display name must be at most 50 characters")
    .regex(
      DISPLAY_NAME_REGEX,
      "Display name can only contain letters, numbers, spaces, underscores, and hyphens",
    ),
  biography: z
    .string()
    .max(500, "Biography must be at most 500 characters")
    .optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  location: z.string().max(100).optional(),
  signature: z.string().max(500).optional(),
});

export type UpdateProfileState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function updateProfile(
  prevState: UpdateProfileState | undefined,
  formData: FormData,
): Promise<UpdateProfileState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Authentication required" };
  }

  const data = {
    displayName: formData.get("displayName") as string,
    biography: (formData.get("biography") as string) || undefined,
    website: (formData.get("website") as string) || undefined,
    location: (formData.get("location") as string) || undefined,
    signature: (formData.get("signature") as string) || undefined,
  };

  const parsed = updateProfileSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: "Invalid form data",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const db = getDatabase();

  await db
    .update(schema.profiles)
    .set({
      displayName: parsed.data.displayName,
      biography: parsed.data.biography ?? null,
      website: parsed.data.website ?? null,
      location: parsed.data.location ?? null,
      signature: parsed.data.signature ?? null,
    })
    .where(eq(schema.profiles.userId, session.user.id));

  await db
    .update(schema.users)
    .set({ displayName: parsed.data.displayName })
    .where(eq(schema.users.id, session.user.id));

  await auditService.log(session.user.id, AUDIT_ACTIONS.UPDATE_PROFILE);

  return { success: true };
}
