import { Target, TrendingUp, Layers, Zap } from "lucide-react";

export default function ScoreSummary({
  scorecard,
  isChase,
  requiredRuns,
  ballsRemaining,
}) {
  if (!scorecard) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      <StatCard
        label="Run Rate"
        value={Number(scorecard.current_run_rate || 0).toFixed(2)}
        icon={<TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />}
        color="emerald"
      />
      <StatCard label="Extras" value={scorecard.extras ?? 0} color="gray" />
      <StatCard
        label="Overs Bowled"
        value={scorecard.overs_bowled_str}
        icon={<Layers className="w-3.5 h-3.5" aria-hidden="true" />}
        color="blue"
      />
      {isChase && scorecard.target != null ? (
        <StatCard
          label="Need"
          value={`${requiredRuns ?? 0} from ${ballsRemaining}`}
          icon={<Zap className="w-3.5 h-3.5" aria-hidden="true" />}
          color="red"
          highlight
        />
      ) : (
        <StatCard
          label="Target"
          value={scorecard.target ?? "—"}
          icon={<Target className="w-3.5 h-3.5" aria-hidden="true" />}
          color="amber"
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color = "gray", highlight }) {
  const colorMap = {
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
    amber: "bg-amber-50 border-amber-100 text-amber-700",
    red: "bg-red-50 border-red-100 text-red-600",
    blue: "bg-blue-50 border-blue-100 text-blue-600",
    gray: "bg-gray-50 border-gray-100 text-gray-600",
  };

  const valueColorMap = {
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    red: "text-red-600",
    blue: "text-blue-600",
    gray: "text-gray-700",
  };

  return (
    <div
      className={`rounded-xl border p-3 sm:p-3.5 ${colorMap[color]} transition-all duration-200 ${
        highlight ? "ring-1 ring-red-200" : ""
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon && <span className="opacity-70">{icon}</span>}
        <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
          {label}
        </p>
      </div>
      <p
        className={`font-extrabold tabular-nums tracking-tight text-base sm:text-lg ${valueColorMap[color]}`}
      >
        {value}
      </p>
    </div>
  );
}