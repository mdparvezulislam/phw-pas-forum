import Link from "next/link";

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-6xl font-bold">401</h1>
        <h2 className="mt-4 text-2xl font-semibold">Unauthorized</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Please sign in to access this page.
        </p>
        <Link
          href="/auth/login"
          className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
