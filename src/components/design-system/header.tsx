"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { useAuth } from "@/hooks";
import { GlobalSearch } from "./global-search";

export function Header() {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold mr-6">
          BHW PAS
        </Link>

        <nav className="flex items-center gap-4 mr-auto">
          <Link
            href="/forums"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Forums
          </Link>
          <Link
            href="/members/leaderboard"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Leaderboard
          </Link>
        </nav>

        <nav className="flex items-center gap-4">
          <GlobalSearch />
          {isAuthenticated ? (
            <>
              <Link
                href={`/profile/${user?.username}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {user?.displayName ?? user?.username}
              </Link>
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
