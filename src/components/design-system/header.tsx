"use client";

import Link from "next/link";
import { useAuth } from "@/hooks";
import { Button } from "@/components/ui";

export function Header() {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold"
        >
          BHW PAS
        </Link>

        <nav className="ml-auto flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground">
                {user?.displayName ?? user?.username}
              </span>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Sign out
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
