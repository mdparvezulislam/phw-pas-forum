import { X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

/* ============================================
   ALERT COMPONENT
   Inline notifications and messages
   ============================================ */

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
}

const variantClasses = {
  default: "bg-muted text-foreground border",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  danger: "bg-danger/10 text-danger border-danger/20",
  info: "bg-info/10 text-info border-info/20",
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = "default",
      title,
      description,
      icon,
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
        role="alert"
        className={cn(
          "relative rounded-lg p-4",
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        <div className="flex gap-3">
          {icon && <div className="shrink-0 mt-0.5">{icon}</div>}
          <div className="flex-1 min-w-0">
            {title && <h5 className="font-semibold text-sm mb-1">{title}</h5>}
            {description && <p className="text-sm opacity-90">{description}</p>}
            {children}
          </div>
          {closable && (
            <button
              onClick={onClose}
              className="shrink-0 rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  },
);
Alert.displayName = "Alert";

export { Alert };
