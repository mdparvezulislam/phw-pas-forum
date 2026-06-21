import { Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-lg text-center">
        <div className="animate-fade-in-up">
          <h1 className="text-gradient text-[10rem] font-bold leading-none tracking-tighter">
            404
          </h1>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="relative mx-auto mb-8 mt-4 flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 animate-pulse-glow rounded-full bg-primary/5" />
            <div className="absolute inset-2 animate-spin-slow rounded-full border border-dashed border-primary/20" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Search className="h-7 w-7 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div
          className="animate-fade-in-up space-y-3"
          style={{ animationDelay: "0.2s" }}
        >
          <h2 className="text-2xl font-bold tracking-tight">Page not found</h2>
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>

        <div
          className="animate-fade-in-up mt-8 flex items-center justify-center gap-3"
          style={{ animationDelay: "0.3s" }}
        >
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="javascript:history.back()">Go Back</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
