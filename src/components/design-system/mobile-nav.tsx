"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui";
import { useAuth } from "@/hooks";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </>
          )}
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-14 border-b bg-background p-4 shadow-lg">
          <nav className="flex flex-col gap-2">
            <Link
              href="/"
              className="rounded-md px-3 py-2 text-sm hover:bg-accent"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/forums"
              className="rounded-md px-3 py-2 text-sm hover:bg-accent"
              onClick={() => setIsOpen(false)}
            >
              Forums
            </Link>
            <Link
              href="/marketplace"
              className="rounded-md px-3 py-2 text-sm hover:bg-accent"
              onClick={() => setIsOpen(false)}
            >
              Marketplace
            </Link>
            <Link
              href="/leaderboards"
              className="rounded-md px-3 py-2 text-sm hover:bg-accent"
              onClick={() => setIsOpen(false)}
            >
              Leaderboard
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-md px-3 py-2 text-sm hover:bg-accent"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href={`/profile/${user?.username}`}
                  className="rounded-md px-3 py-2 text-sm hover:bg-accent"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="rounded-md px-3 py-2 text-sm hover:bg-accent"
                  onClick={() => setIsOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-md px-3 py-2 text-sm hover:bg-accent"
                  onClick={() => setIsOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
