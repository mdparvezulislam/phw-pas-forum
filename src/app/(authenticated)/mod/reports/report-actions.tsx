"use client";

import { useActionState } from "react";
import { resolveReport } from "@/modules/post/actions";

interface ReportActionsProps {
  reportId: string;
}

export function ReportActions({ reportId }: ReportActionsProps) {
  const [state, action, pending] = useActionState(resolveReport, undefined);

  return (
    <div className="flex items-center gap-2">
      <form action={action}>
        <input type="hidden" name="reportId" value={reportId} />
        <input type="hidden" name="action" value="RESOLVED" />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          Resolve
        </button>
      </form>

      <form action={action}>
        <input type="hidden" name="reportId" value={reportId} />
        <input type="hidden" name="action" value="REJECTED" />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-accent disabled:opacity-50"
        >
          Reject
        </button>
      </form>

      {state?.error && (
        <span className="text-xs text-red-500">{state.error}</span>
      )}
    </div>
  );
}
