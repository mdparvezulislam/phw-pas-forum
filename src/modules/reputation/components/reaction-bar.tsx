"use client";

import { useActionState, useState } from "react";
import { cn } from "@/lib/utils";
import {
  type ReactionState,
  toggleReaction,
} from "@/modules/reputation/actions";

const REACTION_ICONS: Record<string, string> = {
  LIKE: "👍",
  LOVE: "❤️",
  THANKS: "🙏",
  HELPFUL: "💡",
  INSIGHTFUL: "🧠",
  FIRE: "🔥",
};

const REACTION_LABELS: Record<string, string> = {
  LIKE: "Like",
  LOVE: "Love",
  THANKS: "Thanks",
  HELPFUL: "Helpful",
  INSIGHTFUL: "Insightful",
  FIRE: "Fire",
};

interface ReactionBarProps {
  targetId: string;
  targetType: "POST" | "THREAD";
  reactions: Array<{
    type: string;
    count: number;
    hasReacted: boolean;
  }>;
  isLocked?: boolean;
}

export function ReactionBar({
  targetId,
  targetType,
  reactions,
  isLocked,
}: ReactionBarProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [state, action, pending] = useActionState<
    ReactionState | undefined,
    FormData
  >(toggleReaction, undefined);

  const activeReactions = reactions.filter((r) => r.count > 0);
  const totalReactions = activeReactions.reduce((sum, r) => sum + r.count, 0);

  if (isLocked) return null;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center -space-x-1">
        {activeReactions.slice(0, 4).map((r) => (
          <form action={action} key={r.type} className="inline">
            <input type="hidden" name="targetId" value={targetId} />
            <input type="hidden" name="targetType" value={targetType} />
            <input type="hidden" name="reactionType" value={r.type} />
            <button
              type="submit"
              disabled={pending}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors hover:bg-accent",
                r.hasReacted
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-transparent text-muted-foreground",
              )}
              title={REACTION_LABELS[r.type]}
            >
              <span className="text-sm leading-none">
                {REACTION_ICONS[r.type]}
              </span>
              {r.count > 0 && <span>{r.count}</span>}
            </button>
          </form>
        ))}
        {activeReactions.length > 4 && (
          <span className="ml-1 text-xs text-muted-foreground">
            +{activeReactions.length - 4}
          </span>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className={cn(
            "ml-2 rounded-full p-1 text-xs text-muted-foreground transition-colors hover:bg-accent",
            showPicker && "bg-accent",
          )}
          title="Add reaction"
        >
          😊
        </button>

        {showPicker && (
          <div className="absolute bottom-full left-0 z-50 mb-2 rounded-lg border bg-card p-2 shadow-lg">
            <div className="flex gap-1">
              {["LIKE", "LOVE", "THANKS", "HELPFUL", "INSIGHTFUL", "FIRE"].map(
                (type) => {
                  const existing = reactions.find(
                    (r) => r.type === type && r.hasReacted,
                  );
                  return (
                    <form action={action} key={type}>
                      <input type="hidden" name="targetId" value={targetId} />
                      <input
                        type="hidden"
                        name="targetType"
                        value={targetType}
                      />
                      <input type="hidden" name="reactionType" value={type} />
                      <button
                        type="submit"
                        disabled={pending}
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-md text-lg transition-colors hover:bg-accent",
                          existing && "bg-primary/10 ring-1 ring-primary/40",
                        )}
                        title={REACTION_LABELS[type]}
                      >
                        {REACTION_ICONS[type]}
                      </button>
                    </form>
                  );
                },
              )}
            </div>
          </div>
        )}
      </div>

      {totalReactions > 0 && (
        <span className="ml-1 text-xs text-muted-foreground">
          {totalReactions}
        </span>
      )}
    </div>
  );
}
