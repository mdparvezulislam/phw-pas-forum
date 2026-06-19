"use server";

import { auth } from "@/lib/auth";
import { storage } from "@/lib/r2";
import { getDatabase, schema } from "@/db";
import { eq } from "drizzle-orm";
import { auditService } from "@/services/audit";
import { AUDIT_ACTIONS } from "@/db/schema/audit-logs";
import { FILE_LIMITS } from "@/constants";

export type UploadAvatarState = {
  error?: string;
  avatarUrl?: string;
  success?: boolean;
};

export async function uploadAvatar(
  prevState: UploadAvatarState | undefined,
  formData: FormData,
): Promise<UploadAvatarState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Authentication required" };
  }

  const file = formData.get("avatar") as File | null;
  if (!file) {
    return { error: "No file provided" };
  }

  if (!FILE_LIMITS.AVATAR_ALLOWED_TYPES.includes(file.type as any)) {
    return {
      error:
        "Invalid file type. Allowed: JPEG, PNG, WebP",
    };
  }

  if (file.size > FILE_LIMITS.AVATAR_MAX_SIZE) {
    return { error: "File too large. Maximum size is 2MB" };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = (file.type.split("/")[1] ?? "jpg");
  const key = `avatars/${session.user.id}/${crypto.randomUUID()}.${ext}`;

  const { url } = await storage.upload(key, buffer, file.type);

  const db = getDatabase();
  const profile = await db.query.profiles.findFirst({
    where: (profiles, { eq }) => eq(profiles.userId, session.user.id),
  });

  if (profile?.avatarKey) {
    await storage.delete(profile.avatarKey);
  }

  await db
    .update(schema.profiles)
    .set({ avatarUrl: url, avatarKey: key })
    .where(eq(schema.profiles.userId, session.user.id));

  await auditService.log(session.user.id, AUDIT_ACTIONS.UPDATE_AVATAR);

  return { success: true, avatarUrl: url };
}

export async function removeAvatar(): Promise<{ error?: string; success?: boolean }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Authentication required" };
  }

  const db = getDatabase();

  db.transaction(async (tx) => {
    const profile = await tx.query.profiles.findFirst({
      where: (profiles, { eq }) => eq(profiles.userId, session!.user.id),
    });

    if (profile?.avatarKey) {
      await storage.delete(profile.avatarKey);
    }

    await tx
      .update(schema.profiles)
      .set({ avatarUrl: null, avatarKey: null })
      .where(eq(schema.profiles.userId, session!.user.id));
  });

  await auditService.log(session.user.id, AUDIT_ACTIONS.REMOVE_AVATAR);

  return { success: true };
}
