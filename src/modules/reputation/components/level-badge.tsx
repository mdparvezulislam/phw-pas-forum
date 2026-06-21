import { cn } from "@/lib/utils";

interface LevelBadgeProps {
  level: {
    name: string;
    minPoints: number;
  } | null;
  size?: "sm" | "md" | "lg";
}

const LEVEL_COLORS: Record<string, string> = {
  "New Member":
    "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
  "Junior Member":
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Member:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "Senior Member":
    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  "Elite Member":
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  "Veteran Member":
    "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  "Legendary Member":
    "bg-gradient-to-r from-amber-500/20 to-red-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
};

export function LevelBadge({ level, size = "sm" }: LevelBadgeProps) {
  if (!level) return null;

  const colorClass = LEVEL_COLORS[level.name] ?? LEVEL_COLORS["New Member"];

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-[10px]",
    md: "px-2 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        colorClass,
        sizeClasses[size],
      )}
    >
      {level.name}
    </span>
  );
}
