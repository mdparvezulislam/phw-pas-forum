"use client";

import {
  AlertTriangle,
  ChevronDown,
  Home,
  Mail,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-lg text-center">
        <div className="animate-fade-in-up">
          <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 animate-pulse-glow rounded-full bg-danger/5" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
              <AlertTriangle className="h-8 w-8 text-danger" />
            </div>
          </div>
        </div>

        <div
          className="animate-fade-in-up space-y-3"
          style={{ animationDelay: "0.1s" }}
        >
          <h1 className="text-4xl font-bold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-muted-foreground">
            An unexpected error occurred. Please try again or contact support if
            the problem persists.
          </p>
        </div>

        <div
          className="animate-fade-in-up mt-6"
          style={{ animationDelay: "0.2s" }}
        >
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Error details
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showDetails ? "rotate-180" : ""}`}
            />
          </button>

          {showDetails && (
            <div className="animate-scale-in mt-3">
              <Alert
                variant="danger"
                title={error.name}
                description={error.message ?? "An unexpected error occurred"}
              >
                {error.digest && (
                  <p className="mt-2 font-mono text-xs opacity-70">
                    Digest: {error.digest}
                  </p>
                )}
              </Alert>
            </div>
          )}
        </div>

        <div
          className="animate-fade-in-up mt-8 flex flex-wrap items-center justify-center gap-3"
          style={{ animationDelay: "0.3s" }}
        >
          <Button onClick={reset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="mailto:support@example.com">
              <Mail className="mr-2 h-4 w-4" />
              Contact Support
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
