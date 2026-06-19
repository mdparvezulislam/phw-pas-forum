import Link from "next/link";

export function ForumSidebar() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <h3 className="mb-3 text-sm font-semibold">Forum Navigation</h3>
        <nav className="flex flex-col gap-1">
          <Link
            href="/forums"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            All Forums
          </Link>
        </nav>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="mb-3 text-sm font-semibold">Forum Statistics</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Members</span>
            <span className="font-medium">—</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Threads</span>
            <span className="font-medium">—</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Posts</span>
            <span className="font-medium">—</span>
          </div>
        </div>
      </div>
    </div>
  );
}
