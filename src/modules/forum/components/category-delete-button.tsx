"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui";
import { deleteCategory } from "@/modules/forum/actions";

interface CategoryDeleteButtonProps {
  id: string;
}

export function CategoryDeleteButton({ id }: CategoryDeleteButtonProps) {
  const [state, formAction, pending] = useActionState(
    deleteCategory,
    undefined,
  );

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
