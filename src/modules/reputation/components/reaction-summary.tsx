const REACTION_ICONS: Record<string, string> = {
  LIKE: "👍",
  LOVE: "❤️",
  THANKS: "🙏",
  HELPFUL: "💡",
  INSIGHTFUL: "🧠",
  FIRE: "🔥",
};

interface ReactionSummaryProps {
  reactions: Array<{
    type: string;
    count: number;
  }>;
}

export function ReactionSummary({ reactions }: ReactionSummaryProps) {
  const active = reactions.filter((r) => r.count > 0);
  if (active.length === 0) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {active.slice(0, 5).map((r) => (
        <span key={r.type} className="inline-flex items-center gap-1">
          <span className="text-base leading-none">
            {REACTION_ICONS[r.type]}
          </span>
          <span>{r.count}</span>
        </span>
      ))}
      {active.length > 5 && (
        <span className="text-xs">+{active.length - 5}</span>
      )}
    </div>
  );
}

export function ReactionHoverList({
  reactions,
  users,
}: {
  reactions: Array<{
    type: string;
    count: number;
    users?: Array<{ username: string }>;
  }>;
  users?: Array<{ username: string; reactionType: string }>;
}) {
  const active = reactions.filter((r) => r.count > 0);
  if (active.length === 0) return null;

  return (
    <div className="space-y-1">
      {active.map((r) => (
        <div key={r.type} className="flex items-center gap-2 text-sm">
          <span className="text-base leading-none">
            {REACTION_ICONS[r.type]}
          </span>
          <span className="font-medium">{r.count}</span>
          <span className="text-muted-foreground">
            {REACTION_LABELS[r.type]?.toLowerCase() ?? r.type.toLowerCase()}
          </span>
        </div>
      ))}
    </div>
  );
}

const REACTION_LABELS: Record<string, string> = {
  LIKE: "Like",
  LOVE: "Love",
  THANKS: "Thanks",
  HELPFUL: "Helpful",
  INSIGHTFUL: "Insightful",
  FIRE: "Fire",
};
