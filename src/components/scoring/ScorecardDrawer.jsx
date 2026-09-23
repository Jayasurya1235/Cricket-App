import { X } from "lucide-react";

function nameOf(map, id) {
  const p = map?.[id];
  if (!p) return `Player #${id}`;
  return `${p.first_name || ""} ${p.last_name || ""}`.trim() || `Player #${id}`;
}

export default function ScorecardDrawer({ scorecard, nameMap, isOpen, onClose }) {
  if (!isOpen || !scorecard) return null;

  const batsmen = scorecard.batsmen || [];
  const bowlers = scorecard.bowlers || [];
  const isChase = scorecard.innings_number > 1;
  const requiredRuns =
    scorecard.target != null ? scorecard.target - scorecard.total : null;

  const summaryLine = `${scorecard.total}/${scorecard.wickets} · ${scorecard.overs_bowled_str} ov · CRR ${Number(scorecard.current_run_rate || 0).toFixed(2)}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full sm:w-[440px] h-full overflow-y-auto shadow-2xl animate-[slideInRight_0.3s_ease-out]">
        <div className="sticky top-0 bg-white border-b border-cricket-border/50 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Scorecard</h2>
            <p className="text-[11px] text-gray-400">
              Innings {scorecard.innings_number}
              {scorecard.completed && ` · ${scorecard.end_reason || "Complete"}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Team Total */}
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-lg font-black text-gray-900 tabular-nums mt-1">
              {scorecard.total} / {scorecard.wickets}
            </p>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">
              {scorecard.overs_bowled_str} Overs · Extras {scorecard.extras ?? 0}
            </p>
            <p className="text-[10px] text-gray-400 font-semibold mt-1">
              {summaryLine}
            </p>
            {isChase && scorecard.target != null && (
              <p className="text-[11px] font-bold text-amber-600 mt-2">
                Target {scorecard.target} · Need {Math.max(0, requiredRuns)} to
                win
              </p>
            )}
          </div>

          {/* Batting */}
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Batting
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-cricket-border/50">
                    <th className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-2 pr-3">
                      Batsman
                    </th>
                    <th className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-2 text-right px-2">R</th>
                    <th className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-2 text-right px-2">B</th>
                    <th className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-2 text-right px-2">4s</th>
                    <th className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-2 text-right px-2">6s</th>
                    <th className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-2 text-right">SR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cricket-border/30">
                  {batsmen.map((b) => {
                    const active = b.player_id === scorecard.striker_id;
                    return (
                      <tr key={b.player_id} className={active ? "bg-emerald-50/60" : ""}>
                        <td className="py-2 pr-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-gray-900">
                              {nameOf(nameMap, b.player_id)}
                            </span>
                            {active && (
                              <span className="text-[8px] font-bold text-emerald-600 bg-emerald-100 px-1 py-0.5 rounded">
                                {b.did_not_bat ? "" : "*"}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {b.out
                              ? `out (${b.dismissal || "unknown"})`
                              : b.did_not_bat
                                ? "did not bat"
                                : "not out"}
                          </span>
                        </td>
                        <td className="py-2 text-right px-2 text-xs font-bold text-gray-900 tabular-nums">{b.runs}</td>
                        <td className="py-2 text-right px-2 text-xs text-gray-500 tabular-nums">{b.balls_faced}</td>
                        <td className="py-2 text-right px-2 text-xs text-gray-500 tabular-nums">{b.fours}</td>
                        <td className="py-2 text-right px-2 text-xs text-gray-500 tabular-nums">{b.sixes}</td>
                        <td className="py-2 text-right text-xs text-gray-500 tabular-nums">{b.strike_rate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bowling */}
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Bowling
            </h3>
            {bowlers.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-3 bg-gray-50 rounded-xl">
                No balls bowled yet
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-cricket-border/50">
                      <th className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-2 pr-3">Bowler</th>
                      <th className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-2 text-right px-2">O</th>
                      <th className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-2 text-right px-2">M</th>
                      <th className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-2 text-right px-2">R</th>
                      <th className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-2 text-right px-2">W</th>
                      <th className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-2 text-right">Econ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cricket-border/30">
                    {bowlers.map((bw) => (
                      <tr key={bw.player_id}>
                        <td className="py-2 pr-3 text-xs font-bold text-gray-900">
                          {nameOf(nameMap, bw.player_id)}
                        </td>
                        <td className="py-2 text-right px-2 text-xs text-gray-500 tabular-nums">{bw.overs_str}</td>
                        <td className="py-2 text-right px-2 text-xs text-gray-500 tabular-nums">{bw.maidens}</td>
                        <td className="py-2 text-right px-2 text-xs text-gray-500 tabular-nums">{bw.runs_conceded}</td>
                        <td className="py-2 text-right px-2 text-xs text-gray-500 tabular-nums">{bw.wickets}</td>
                        <td className="py-2 text-right text-xs text-gray-500 tabular-nums">{bw.economy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}