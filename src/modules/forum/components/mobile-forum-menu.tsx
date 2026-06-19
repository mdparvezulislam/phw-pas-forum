"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui";

export function MobileForumMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2"
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
        Forum Navigation
      </Button>

      {isOpen && (
        <div className="mt-2 rounded-lg border bg-card p-2 shadow-lg">
          <nav className="flex flex-col gap-1">
            <Link
              href="/forums"
              className="rounded-md px-3 py-2 text-sm hover:bg-accent"
              onClick={() => setIsOpen(false)}
            >
              All Forums
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
