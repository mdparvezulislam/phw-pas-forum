import {
  MessageSquare,
  FileText,
  Users,
  LayoutGrid,
  FolderOpen,
} from "lucide-react";

interface ForumStatsProps {
  totalThreads?: number;
  totalPosts?: number;
  totalMembers?: number;
  totalForums?: number;
  totalCategories?: number;
}

const icons = {
  Threads: FileText,
  Posts: MessageSquare,
  Members: Users,
  Forums: LayoutGrid,
  Categories: FolderOpen,
};

export function ForumStats({
  totalThreads = 0,
  totalPosts = 0,
  totalMembers = 0,
  totalForums = 0,
  totalCategories = 0,
}: ForumStatsProps) {
  const stats = [
    { label: "Threads", value: totalThreads },
    { label: "Posts", value: totalPosts },
    { label: "Members", value: totalMembers },
    { label: "Forums", value: totalForums },
    { label: "Categories", value: totalCategories },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat) => {
        const Icon = icons[stat.label as keyof typeof icons];
        return (
          <div
            key={stat.label}
            className="rounded-xl border bg-card p-4 transition-colors hover:border-primary/20"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold tabular-nums">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
