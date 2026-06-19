"use client";

import { useState } from "react";
import { useActionState } from "react";
import { formatDateRelative } from "@/lib/utils";
import { reportPost } from "@/modules/post/actions";
import type { PostWithAuthor } from "@/modules/post/types";

interface PostFooterProps {
  post: PostWithAuthor;
  isOwner: boolean;
  isModerator: boolean;
}

export function PostFooter({ post, isOwner, isModerator }: PostFooterProps) {
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportState, reportAction, reportPending] = useActionState(reportPost, undefined);

  return (
    <div className="border-t bg-muted/10 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {post.isEdited && post.editedAt && (
            <span>
              Last edited {formatDateRelative(post.editedAt)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isOwner && (
            <button
              type="button"
              onClick={() => setShowReportForm(!showReportForm)}
              className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-accent"
            >
              Report
            </button>
          )}
        </div>
      </div>

      {showReportForm && (
        <div className="mt-3 rounded-lg border bg-background p-3">
          <form action={reportAction} className="space-y-2">
            <input type="hidden" name="postId" value={post.id} />
            <div>
              <label htmlFor={`report-reason-${post.id}`} className="mb-1 block text-xs font-medium">
                Reason
              </label>
              <select
                id={`report-reason-${post.id}`}
                name="reason"
                required
                className="w-full rounded border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="SPAM">Spam</option>
                <option value="ABUSE">Abuse</option>
                <option value="SCAM">Scam</option>
                <option value="DUPLICATE">Duplicate</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor={`report-description-${post.id}`} className="mb-1 block text-xs font-medium">
                Description (optional)
              </label>
              <textarea
                id={`report-description-${post.id}`}
                name="description"
                rows={2}
                maxLength={2000}
                className="w-full rounded border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            {reportState?.error && (
              <p className="text-xs text-red-500">{reportState.error}</p>
            )}
            {reportState?.success && (
              <p className="text-xs text-green-500">Report submitted.</p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={reportPending}
                className="rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {reportPending ? "Submitting..." : "Submit Report"}
              </button>
              <button
                type="button"
                onClick={() => setShowReportForm(false)}
                className="rounded border px-3 py-1 text-xs hover:bg-accent"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
