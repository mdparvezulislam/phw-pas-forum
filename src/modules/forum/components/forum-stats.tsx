interface ForumStatsProps {
  totalThreads?: number;
  totalPosts?: number;
  totalMembers?: number;
  totalForums?: number;
  totalCategories?: number;
}

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
    <div className="grid grid-cols-5 gap-px overflow-hidden rounded-lg border bg-muted">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-card px-3 py-3 text-center">
          <div className="text-lg font-bold tabular-nums">
            {stat.value.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
