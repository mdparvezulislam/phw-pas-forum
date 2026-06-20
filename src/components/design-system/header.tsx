"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { useAuth } from "@/hooks";
import { UserDropdown } from "@/components/auth";
import { GlobalSearch } from "./global-search";

export function Header() {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center px-4">
        <Link href="/" className="mr-6 flex items-center gap-2 font-semibold">
          BHW PAS
        </Link>

        <nav className="mr-auto flex items-center gap-4">
          <Link
            href="/forums"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Forums
          </Link>
          <Link
            href="/marketplace"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Marketplace
          </Link>
          <Link
            href="/leaderboards"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Leaderboard
          </Link>
        </nav>

        <nav className="flex items-center gap-4">
          <GlobalSearch />
          {isAuthenticated && user ? (
            <UserDropdown user={user} />
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
