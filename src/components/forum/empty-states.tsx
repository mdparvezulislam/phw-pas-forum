import { FolderOpen, MessageSquare, Plus, Search } from "lucide-react";
import Link from "next/link";

export function EmptyForumState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/50 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <FolderOpen className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No Forums Yet</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        This category doesn&apos;t have any forums yet. Be the first to create
        one!
      </p>
      <Link
        href="/admin/forums"
        className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
      >
        <Plus className="h-4 w-4" />
        Create Forum
      </Link>
    </div>
  );
}

export function EmptyThreadState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/50 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <MessageSquare className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No Threads Yet</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        Be the first to start a discussion in this forum!
      </p>
      <Link
        href="/forums"
        className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
      >
        <Plus className="h-4 w-4" />
        Create Thread
      </Link>
    </div>
  );
}

export function EmptySearchState({ query }: { query?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/50 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <Search className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No Results Found</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        {query
          ? `No results for "${query}". Try different keywords.`
          : "Enter a search query to find threads, posts, or users."}
      </p>
    </div>
  );
}
