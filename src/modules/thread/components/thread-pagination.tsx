import Link from "next/link";

interface ThreadPaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export function ThreadPagination({ currentPage, totalPages, baseUrl }: ThreadPaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "ellipsis")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      pages.push("ellipsis");
    }
  }

  return (
    <nav aria-label="Thread pagination" className="mt-6 flex items-center justify-center gap-1">
      {currentPage > 1 && (
        <Link
          href={`${baseUrl}?page=${currentPage - 1}`}
          className="rounded-lg border bg-card px-3 py-2 text-sm hover:bg-accent"
        >
          Previous
        </Link>
      )}
      {pages.map((page, i) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={page}
            href={`${baseUrl}?page=${page}`}
            className={`rounded-lg border px-3 py-2 text-sm ${
              page === currentPage
                ? "bg-primary text-primary-foreground"
                : "bg-card hover:bg-accent"
            }`}
          >
            {page}
          </Link>
        ),
      )}
      {currentPage < totalPages && (
        <Link
          href={`${baseUrl}?page=${currentPage + 1}`}
          className="rounded-lg border bg-card px-3 py-2 text-sm hover:bg-accent"
        >
          Next
        </Link>
      )}
    </nav>
  );
}
