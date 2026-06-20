"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const filters = [
  { value: "latest", label: "Latest" },
  { value: "trending", label: "Trending" },
  { value: "views", label: "Most Viewed" },
  { value: "replies", label: "Most Replied" },
  { value: "solved", label: "Solved" },
  { value: "pinned", label: "Pinned" },
];

export function ForumFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const current = searchParams.get("sort") ?? "latest";

  function setFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "latest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => setFilter(f.value)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
            current === f.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
