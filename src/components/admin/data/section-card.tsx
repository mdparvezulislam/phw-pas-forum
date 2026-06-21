import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: ReactNode;
  description?: ReactNode;
  /** Right-aligned header actions. */
  actions?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Remove inner padding on the body (e.g. when embedding a full-bleed table). */
  flush?: boolean;
  footer?: ReactNode;
}

/**
 * Titled card wrapper used to group page sections consistently.
 */
export function SectionCard({
  title,
  description,
  actions,
  icon,
  children,
  className,
  flush,
  footer,
}: SectionCardProps) {
  const hasHeader = title || description || actions || icon;
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm",
        className,
      )}
    >
      {hasHeader && (
        <div className="flex items-start justify-between gap-3 border-b px-4 py-3 sm:px-5">
          <div className="flex items-start gap-2.5">
            {icon && (
              <span className="mt-0.5 text-muted-foreground">{icon}</span>
            )}
            <div className="min-w-0">
              {title && (
                <h2 className="text-sm font-semibold tracking-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          )}
        </div>
      )}
      <div className={cn(!flush && "p-4 sm:p-5")}>{children}</div>
      {footer && <div className="border-t px-4 py-3 sm:px-5">{footer}</div>}
    </section>
  );
}
