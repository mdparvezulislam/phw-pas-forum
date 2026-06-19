import Link from "next/link";

export default function Forbidden() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-6xl font-bold">403</h1>
        <h2 className="mt-4 text-2xl font-semibold">Access denied</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You do not have permission to access this page.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
