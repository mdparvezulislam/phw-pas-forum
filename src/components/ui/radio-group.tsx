import * as React from "react";
import { cn } from "@/lib/utils";

/* ============================================
   RADIO GROUP COMPONENT
   Radio button group
   ============================================ */

interface RadioGroupContextType {
  value?: string;
  onValueChange?: (value: string) => void;
  name: string;
}

const RadioGroupContext = React.createContext<
  RadioGroupContextType | undefined
>(undefined);

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
}

function RadioGroup({
  className,
  value,
  onValueChange,
  name,
  children,
  ...props
}: RadioGroupProps) {
  const groupName = React.useId();
  const contextValue = React.useMemo(
    () => ({ value, onValueChange, name: name ?? groupName }),
    [value, onValueChange, name, groupName],
  );

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <div role="radiogroup" className={cn("grid gap-2", className)} {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

interface RadioGroupItemProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "type"
  > {
  value: string;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext);

    return (
      <label
        className={cn(
          "inline-flex items-center gap-2 cursor-pointer",
          "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          className,
        )}
      >
        <input
          ref={ref}
          type="radio"
          name={context?.name}
          value={value}
          checked={context?.value === value}
          onChange={() => context?.onValueChange?.(value)}
          className="sr-only"
          {...props}
        />
        <span
          className={cn(
            "flex h-4 w-4 items-center justify-center rounded-full border border-primary text-primary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
        >
          {context?.value === value && (
            <span className="h-2 w-2 rounded-full bg-primary" />
          )}
        </span>
      </label>
    );
  },
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
