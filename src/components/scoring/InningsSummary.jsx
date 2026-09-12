import { Trophy, ArrowRight } from "lucide-react";

export default function InningsSummary({ state, onContinue, isProcessing }) {
  if (!state) return null;

  const summary = state.innings_summary;
  if (!summary) return null;

  return (
    <div className="bg-white border border-cricket-border rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-5 text-center">
        <Trophy className="w-8 h-8 text-emerald-200 mx-auto mb-2" />
        <h2 className="text-lg font-black text-white tracking-tight">
          Innings Complete
        </h2>
        <p className="text-emerald-100 text-xs mt-1">
          {summary.batting_team?.short_name} batting · Innings{" "}
          {state.innings_number}
        </p>
      </div>

      <div className="p-6 space-y-4">
        <div className="text-center">
          <p className="text-4xl font-black text-gray-900 tabular-nums">
            {summary.score.runs} / {summary.score.wickets}
          </p>
          <p className="text-sm text-gray-500 font-semibold mt-1">
            {Math.floor(state.overs.current)}.{state.overs.balls || 0} /{" "}
            {state.overs.total} Overs
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              Run Rate
            </p>
            <p className="text-lg font-black text-gray-900 tabular-nums mt-0.5">
              {summary.run_rate}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              Extras
            </p>
            <p className="text-lg font-black text-gray-900 tabular-nums mt-0.5">
              {summary.extras.wides +
                summary.extras.no_balls +
                summary.extras.byes +
                summary.extras.leg_byes}
            </p>
          </div>
        </div>

        {summary.top_batsman && (
          <div className="bg-emerald-50 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase">
                Top Scorer
              </p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {summary.top_batsman.name}
              </p>
            </div>
            <p className="text-xl font-black text-emerald-700 tabular-nums">
              {summary.top_batsman.runs} ({summary.top_batsman.balls})
            </p>
          </div>
        )}

        {summary.fall_of_wickets?.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Fall of Wickets
            </p>
            <div className="flex flex-wrap gap-1.5">
              {summary.fall_of_wickets.map((f, i) => (
                <span
                  key={i}
                  className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-lg"
                >
                  {f.wicket}-{f.runs}{" "}
                  <span className="text-gray-400">({f.batsman})</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {state.match_context === "chase" && state.target && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
              Target
            </p>
            <p className="text-2xl font-black text-amber-700 tabular-nums mt-1">
              {state.target}
            </p>
            <p className="text-xs text-amber-600 font-semibold mt-0.5">
              Need {state.required_runs} runs to win
            </p>
          </div>
        )}

        <button
          onClick={onContinue}
          disabled={isProcessing}
          className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          Continue to Next Innings
        </button>
      </div>
    </div>
  );
}
