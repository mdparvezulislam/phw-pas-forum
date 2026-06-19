interface DeletedPostCardProps {
  postNumber: number;
}

export function DeletedPostCard({ postNumber }: DeletedPostCardProps) {
  return (
    <div
      id={`post-${postNumber}`}
      className="scroll-mt-20"
    >
      <div className="rounded-lg border bg-muted/30">
        <div className="flex items-center justify-between border-b bg-muted/20 px-4 py-2">
          <div className="flex items-center gap-2">
            <a
              href={`#post-${postNumber}`}
              className="text-sm font-semibold text-muted-foreground hover:underline"
            >
              #{postNumber}
            </a>
            <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
              Deleted
            </span>
          </div>
        </div>
        <div className="p-4">
          <p className="text-sm text-muted-foreground italic">
            This post has been removed.
          </p>
        </div>
      </div>
    </div>
  );
}
