import { Trophy, ArrowRight, CheckCircle2, BookOpen } from "lucide-react";
import { displayName } from "../../utils/scoring";

export default function InningsSummary({
  scorecard,
  nameMap,
  isChase,
  requiredRuns,
  canStartNextInnings,
  onStartNextInnings,
  onOpenScorecard,
  isProcessing,
}) {
  if (!scorecard) return null;

  const batsmen = [...(scorecard.batsmen || [])].sort((a, b) => b.runs - a.runs);
  const topBatsman = batsmen[0];
  // Most wickets wins; ties are broken by the cheaper bowler (fewest runs
  // conceded), so the tiebreak must sort ascending on runs_conceded.
  const bowlers = [...(scorecard.bowlers || [])].sort(
    (a, b) => b.wickets - a.wickets || a.runs_conceded - b.runs_conceded,
  );
  const topBowler = bowlers[0];

  const chaseWon = isChase && requiredRuns != null && requiredRuns <= 0;
  const matchOver = !canStartNextInnings;

  return (
    <div className="bg-white border border-cricket-border rounded-2xl overflow-hidden shadow-sm">
      <div
        className={`px-6 py-5 text-center ${
          chaseWon
            ? "bg-gradient-to-r from-amber-500 to-amber-600"
            : matchOver
              ? "bg-gradient-to-r from-gray-600 to-gray-700"
              : "bg-gradient-to-r from-emerald-600 to-emerald-700"
        }`}
      >
        <Trophy className="w-8 h-8 text-white/90 mx-auto mb-2" aria-hidden="true" />
        <h2 className="text-lg font-black text-white tracking-tight">
          {chaseWon ? "Match Won!" : matchOver ? "Match Complete" : "Innings Complete"}
        </h2>
        <p className="text-white/80 text-xs mt-1">
          {scorecard.end_reason || "innings"} · Innings {scorecard.innings_number}
        </p>
      </div>

      <div className="p-6 space-y-4">
        <div className="text-center">
          <p className="text-4xl font-black text-gray-900 tabular-nums">
            {scorecard.total} / {scorecard.wickets}
          </p>
          <p className="text-sm text-gray-500 font-semibold mt-1">
            {scorecard.overs_bowled_str} Overs · {scorecard.extras ?? 0} extras
            · CRR {Number(scorecard.current_run_rate || 0).toFixed(2)}
          </p>
        </div>

        {isChase && scorecard.target != null && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
              Target
            </p>
            <p className="text-2xl font-black text-amber-700 tabular-nums mt-1">
              {scorecard.target}
            </p>
            <p className="text-xs text-amber-600 font-semibold mt-0.5">
              {chaseWon
                ? "Target chased successfully"
                : `Finished ${Math.max(0, requiredRuns)} runs short`}
            </p>
          </div>
        )}

        {topBatsman && (
          <div className="bg-emerald-50 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase">
                Top Scorer
              </p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {displayName(nameMap, topBatsman.player_id)}
              </p>
            </div>
            <p className="text-xl font-black text-emerald-700 tabular-nums">
              {topBatsman.runs} ({topBatsman.balls_faced})
            </p>
          </div>
        )}

        {topBowler && (
          <div className="bg-orange-50 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-orange-600 uppercase">
                Best Bowler
              </p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {displayName(nameMap, topBowler.player_id)}
              </p>
            </div>
            <p className="text-xl font-black text-orange-700 tabular-nums">
              {topBowler.wickets}/
              <span className="text-sm">{topBowler.runs_conceded}</span>
            </p>
          </div>
        )}

        <div className="space-y-2">
          {canStartNextInnings && (
            <button
              type="button"
              onClick={onStartNextInnings}
              disabled={isProcessing}
              className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-sm transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  Start Next Innings
                </>
              )}
            </button>
          )}

          {/* ScoringControls is unmounted once the innings ends, so the full
              scorecard has to stay reachable from here. */}
          {onOpenScorecard && (
            <button
              type="button"
              onClick={onOpenScorecard}
              className="w-full h-11 rounded-xl border-2 border-cricket-border bg-white hover:bg-gray-50 text-gray-700 font-bold text-sm transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              View Scorecard
            </button>
          )}
        </div>

        {matchOver && (
          <div className="flex items-center justify-center gap-2 text-emerald-600 text-sm font-bold">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            Scoring complete for this match
          </div>
        )}
      </div>
    </div>
  );
}