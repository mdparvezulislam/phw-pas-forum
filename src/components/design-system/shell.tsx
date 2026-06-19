import type { ReactNode } from "react";

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {children}
    </div>
  );
}

export function ShellHeader({ children }: { children: ReactNode }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center px-4">
        {children}
      </div>
    </header>
  );
}

export function ShellMain({ children }: { children: ReactNode }) {
  return (
    <main className="flex-1">
      <div className="container mx-auto max-w-screen-2xl px-4 py-6">
        {children}
      </div>
    </main>
  );
}

export function ShellSidebar({ children }: { children: ReactNode }) {
  return (
    <aside className="hidden w-64 shrink-0 border-r lg:block">
      <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-6 pr-4">
        {children}
      </div>
    </aside>
  );
}
