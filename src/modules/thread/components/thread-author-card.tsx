import type { ThreadWithRelations } from "@/modules/thread/types";
import { formatDateRelative } from "@/lib/utils";

interface ThreadAuthorCardProps {
  thread: ThreadWithRelations;
}

export function ThreadAuthorCard({ thread }: ThreadAuthorCardProps) {
  const author = thread.author;
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg text-primary">
          {author.image ? (
            <img
              src={author.image}
              alt=""
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            (author.displayName ?? author.username ?? "U").charAt(0).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <div className="font-medium truncate">
            {author.displayName ?? author.username}
          </div>
        </div>
      </div>
    </div>
  );
}
