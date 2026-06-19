import Link from "next/link";

export function EmptyForumState({
  title = "No content yet",
  description = "This forum is empty. Check back later.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
      <div className="mb-4 text-4xl text-muted-foreground/50">📭</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <Link
        href="/forums"
        className="mt-4 text-sm text-primary hover:underline"
      >
        Browse forums
      </Link>
    </div>
  );
}
