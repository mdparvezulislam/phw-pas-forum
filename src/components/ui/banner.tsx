import * as React from "react";
import { cn } from "@/lib/utils";

/* ============================================
   BANNER COMPONENT
   Page-level announcements and alerts
   ============================================ */

interface BannerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "info" | "premium";
  icon?: React.ReactNode;
  action?: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
}

const variantClasses = {
  default: "bg-muted border-border",
  success: "bg-success/5 border-success/20",
  warning: "bg-warning/5 border-warning/20",
  info: "bg-info/5 border-info/20",
  premium: "bg-premium/5 border-premium/20",
};

const Banner = React.forwardRef<HTMLDivElement, BannerProps>(
  (
    {
      className,
      variant = "default",
      icon,
      action,
      closable,
      onClose,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative border-b px-4 py-3",
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        <div className="container mx-auto flex items-center justify-between gap-4 max-w-screen-2xl">
          <div className="flex items-center gap-3 min-w-0">
            {icon && <div className="shrink-0">{icon}</div>}
            <div className="flex-1 min-w-0 text-sm">{children}</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {action}
            {closable && (
              <button
                onClick={onClose}
                className="rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Close banner"
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
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  },
);
Banner.displayName = "Banner";

export { Banner };
