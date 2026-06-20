import { ShieldAlert } from "lucide-react";

export function RiskScoreCard({ score }: { score: number }) {
  const getRiskLevel = (val: number) => {
    if (val >= 60) {
      return {
        label: "High Risk",
        color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        barColor: "from-rose-500 to-red-600",
      };
    }
    if (val >= 30) {
      return {
        label: "Medium Risk",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        barColor: "from-amber-500 to-orange-500",
      };
    }
    return {
      label: "Low Risk",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      barColor: "from-emerald-500 to-teal-500",
    };
  };

  const level = getRiskLevel(score);

  return (
    <div className="rounded-2xl border bg-card/40 backdrop-blur p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-muted-foreground/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-sm">Automated Risk Score</span>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${level.color}`}>
          {level.label}
        </span>
      </div>

      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-3xl font-extrabold tracking-tight">{score}</span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>

      <div className="w-full bg-secondary/30 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${level.barColor} transition-all duration-1000 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
