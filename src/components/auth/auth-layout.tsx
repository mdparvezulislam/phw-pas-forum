import Link from "next/link";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  className,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6">
      {/* Background gradient */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-premium/5" />
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      {/* Logo */}
      <Link href="/" className="mb-8 text-xl font-bold tracking-tight">
        BHW<span className="text-premium">PAS</span>
      </Link>

      {/* Card */}
      <div
        className={cn(
          "relative w-full max-w-[440px] overflow-hidden rounded-2xl border bg-card/80 backdrop-blur-xl",
          "shadow-2xl shadow-primary/5",
          "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-b before:from-primary/20 before:to-transparent",
          className,
        )}
      >
        <div className="relative px-6 py-8 sm:px-8 sm:py-10">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
