"use client";

import { useActionState } from "react";
import { Button, Input, Label } from "@/components/ui";
import { changePassword } from "@/modules/users/actions";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePassword,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
        />
        {state?.fieldErrors?.newPassword && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.newPassword[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
        />
      </div>

      {state?.error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-400">
          Password changed successfully
        </div>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Changing..." : "Change password"}
      </Button>
    </form>
  );
}
