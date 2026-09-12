import { Target, TrendingUp, Zap } from "lucide-react";

export default function ScoreSummary({ state }) {
  if (!state) return null;

  const isChase = state.match_context === "chase";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      <StatCard
        label="Run Rate"
        value={state.run_rate || "0.00"}
        icon={<TrendingUp className="w-3.5 h-3.5" />}
        color="emerald"
      />
      {isChase && (
        <>
          <StatCard
            label="Target"
            value={state.target}
            icon={<Target className="w-3.5 h-3.5" />}
            color="amber"
            large
          />
          <StatCard
            label="Need"
            value={`${state.required_runs} from ${state.balls_remaining}`}
            icon={<Zap className="w-3.5 h-3.5" />}
            color="red"
            highlight
          />
          <StatCard
            label="Req. Rate"
            value={state.required_run_rate}
            icon={<TrendingUp className="w-3.5 h-3.5" />}
            color="red"
          />
        </>
      )}
      {!isChase && (
        <>
          <StatCard
            label="Extras"
            value={state.score.extras}
            color="gray"
          />
          <StatCard
            label="Balls Left"
            value={state.balls_remaining}
            color="blue"
          />
          <StatCard
            label="FOW"
            value={
              state.fall_of_wickets
                ? `${state.fall_of_wickets.length} / ${state.score.wickets}`
                : state.score.wickets
            }
            color="gray"
          />
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color = "gray", large, highlight }) {
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
        className={`font-extrabold tabular-nums tracking-tight ${
          large ? "text-xl sm:text-2xl" : "text-base sm:text-lg"
        } ${valueColorMap[color]}`}
      >
        {value}
      </p>
    </div>
  );
}
