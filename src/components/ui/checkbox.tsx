import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, Minus } from "lucide-react";

/* ============================================
   CHECKBOX COMPONENT
   Checkbox and indeterminate states
   ============================================ */

interface CheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, checked, indeterminate, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={indeterminate ? "mixed" : checked}
        disabled={disabled}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          checked
            ? "bg-primary text-primary-foreground"
            : "bg-background",
          indeterminate && "bg-primary text-primary-foreground",
          className
        )}
        onClick={() => onCheckedChange?.(!checked)}
        {...props}
      >
        <span className="flex items-center justify-center">
          {checked && <Check className="h-3 w-3" />}
          {indeterminate && <Minus className="h-3 w-3" />}
        </span>
      </button>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
