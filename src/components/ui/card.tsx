import * as React from "react";
import Link from "next/link";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

/* ============================================
   CARD COMPONENT
   Versatile card container
   ============================================ */

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow-sm",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

/* ============================================
   INTERACTIVE CARD
   Hover lift + scale with framer-motion
   ============================================ */

interface InteractiveCardProps extends HTMLMotionProps<"div"> {
  href?: string;
  onClick?: () => void;
}

const InteractiveCard = React.forwardRef<HTMLDivElement, InteractiveCardProps>(
  ({ className, href, onClick, children, ...props }, ref) => {
    const baseClasses = cn(
      "rounded-xl border bg-card text-card-foreground shadow-sm",
      "transition-shadow duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      className,
    );

    const motionProps: HTMLMotionProps<"div"> = {
      whileHover: {
        y: -2,
        scale: 1.005,
        boxShadow:
          "0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      },
      transition: { duration: 0.2, ease: "easeOut" },
      ...props,
    };

    if (href) {
      return (
        <Link href={href} className="block outline-none">
          <motion.div
            ref={ref}
            className={baseClasses}
            onClick={onClick}
            {...motionProps}
          >
            {children}
          </motion.div>
        </Link>
      );
    }

    return (
      <motion.div
        ref={ref}
        className={baseClasses}
        onClick={onClick}
        tabIndex={onClick ? 0 : undefined}
        role={onClick ? "button" : undefined}
        {...motionProps}
      >
        {children}
      </motion.div>
    );
  },
);
InteractiveCard.displayName = "InteractiveCard";

/* ============================================
   GLOW CARD
   Hover glow effect using primary color
   ============================================ */

const GlowCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow-sm",
      "transition-all duration-200",
      "hover:glow-primary",
      className,
    )}
    {...props}
  />
));
GlowCard.displayName = "GlowCard";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  InteractiveCard,
  GlowCard,
};
