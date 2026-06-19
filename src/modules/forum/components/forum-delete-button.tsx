"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui";
import { deleteForum } from "@/modules/forum/actions";

interface ForumDeleteButtonProps {
  id: string;
}

export function ForumDeleteButton({ id }: ForumDeleteButtonProps) {
  const [state, formAction, pending] = useActionState(deleteForum, undefined);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        disabled={pending}
        className="text-destructive hover:text-destructive"
      >
        {pending ? "..." : "Delete"}
      </Button>
    </form>
  );
}
