import Link from "next/link";

interface PostPaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  postNumber?: number;
}

interface PageEntry {
  type: "page" | "ellipsis";
  value: number;
  key: string;
}

export function PostPagination({
  currentPage,
  totalPages,
  baseUrl,
  postNumber,
}: PostPaginationProps) {
  if (totalPages <= 1) return null;

  const pages: PageEntry[] = [];
  let ellipsisCount = 0;
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 2 && i <= currentPage + 2)
    ) {
      pages.push({ type: "page", value: i, key: `page-${i}` });
    } else if (
      pages.length === 0 ||
      pages[pages.length - 1].type !== "ellipsis"
    ) {
      pages.push({
        type: "ellipsis",
        value: i,
        key: `ellipsis-${ellipsisCount++}`,
      });
    }
  }

  return (
    <nav
      aria-label="Post pagination"
      className="flex items-center justify-between border-t bg-muted/20 px-4 py-3"
    >
      <div className="text-sm text-muted-foreground">
        {postNumber && (
          <span>
            Post #{postNumber} of page {currentPage}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {currentPage > 1 && (
          <Link
            href={`${baseUrl}?page=${currentPage - 1}`}
            className="rounded border bg-card px-3 py-1.5 text-sm hover:bg-accent"
          >
            Previous
          </Link>
        )}

        {pages.map((entry) =>
          entry.type === "ellipsis" ? (
            <span key={entry.key} className="px-2 text-muted-foreground">
              ...
            </span>
          ) : (
            <Link
              key={entry.key}
              href={`${baseUrl}?page=${entry.value}`}
              className={`rounded border px-3 py-1.5 text-sm ${
                entry.value === currentPage
                  ? "bg-primary text-primary-foreground"
                  : "bg-card hover:bg-accent"
              }`}
            >
              {entry.value}
            </Link>
          ),
        )}

        {currentPage < totalPages && (
          <Link
            href={`${baseUrl}?page=${currentPage + 1}`}
            className="rounded border bg-card px-3 py-1.5 text-sm hover:bg-accent"
          >
            Next
          </Link>
        )}
      </div>
    </nav>
  );
}
