"use client";

import { useActionState } from "react";
import { updateProfile } from "@/modules/users/actions";
import { Button, Input, Label } from "@/components/ui";

interface ProfileSettingsFormProps {
  displayName: string;
  biography: string;
  website: string;
  location: string;
  signature: string;
}

export function ProfileSettingsForm({
  displayName,
  biography,
  website,
  location,
  signature,
}: ProfileSettingsFormProps) {
  const [state, formAction, pending] = useActionState(updateProfile, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={displayName}
          required
          maxLength={50}
        />
        {state?.fieldErrors?.displayName && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.displayName[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="biography">Bio</Label>
        <textarea
          id="biography"
          name="biography"
          defaultValue={biography}
          rows={4}
          maxLength={500}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          name="website"
          type="url"
          defaultValue={website}
          placeholder="https://example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          defaultValue={location}
          placeholder="City, Country"
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signature">Signature</Label>
        <textarea
          id="signature"
          name="signature"
          defaultValue={signature}
          rows={3}
          maxLength={500}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {state?.error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-400">
          Profile updated successfully
        </div>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
