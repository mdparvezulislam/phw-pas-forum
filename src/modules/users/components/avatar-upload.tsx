"use client";

import { useActionState, useRef } from "react";
import { Button } from "@/components/ui";
import {
  removeAvatar as removeAvatarAction,
  uploadAvatar,
} from "@/modules/users/actions";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
}

export function AvatarUpload({ currentAvatarUrl }: AvatarUploadProps) {
  const [state, formAction, pending] = useActionState(uploadAvatar, undefined);
  const removeFormRef = useRef<HTMLFormElement>(null);

  async function handleRemove() {
    await removeAvatarAction();
    // TODO: refresh the page or update state
  }

  return (
    <div className="rounded-lg border p-4">
      <h2 className="mb-4 font-semibold">Avatar</h2>

      <div className="flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full bg-muted">
          {currentAvatarUrl ? (
            <img
              src={currentAvatarUrl}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl text-muted-foreground">
              ?
            </div>
          )}
        </div>

        <div className="space-y-2">
          <form action={formAction} className="flex items-center gap-2">
            <input
              type="file"
              name="avatar"
              accept="image/jpeg,image/png,image/webp"
              className="text-sm file:mr-2 file:rounded file:border-0 file:bg-accent file:px-2 file:py-1 file:text-sm file:font-medium"
            />
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Uploading..." : "Upload"}
            </Button>
          </form>

          {state?.error && (
            <p className="text-xs text-destructive">{state.error}</p>
          )}

          {currentAvatarUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={handleRemove}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
