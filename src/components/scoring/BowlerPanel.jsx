import { AlertTriangle } from "lucide-react";

export default function BowlerPanel({
  scorecard,
  bowlingRoster,
  selectedBowlerId,
  onSelectBowler,
  ineligibleBowlerId = null,
  needsNewBowler = false,
}) {
  const activeBowlerId = Number(selectedBowlerId) || null;

  const stats = scorecard?.bowlers?.find(
    (b) => b.player_id === activeBowlerId,
  );
  const selectedPlayer = bowlingRoster.find((p) => p.id === activeBowlerId);

  function nameFor(p) {
    return (
      `${p.first_name || ""} ${p.last_name || ""}`.trim() || `Player #${p.id}`
    );
  }

  return (
    <div className="bg-white border border-cricket-border rounded-2xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-cricket-border/50">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Bowling
        </h3>
      </div>

      <div className="px-4 py-3 space-y-3">
        {needsNewBowler && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">
              Over finished. Please choose a different bowler.
            </p>
          </div>
        )}

        <label htmlFor="bowler-select" className="sr-only">
          Bowler for this over
        </label>
        <select
          id="bowler-select"
          value={activeBowlerId ?? ""}
          onChange={(e) => onSelectBowler(e.target.value)}
          aria-required="true"
          className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
        >
          <option value="" disabled>
            Select bowler...
          </option>
          {bowlingRoster.map((p) => {
            // Left selectable on purpose: picking the previous over's bowler
            // surfaces the "Over finished" message instead of a dead option.
            const blocked =
              ineligibleBowlerId != null && p.id === ineligibleBowlerId;
            return (
              <option key={p.id} value={p.id}>
                {nameFor(p)}
                {blocked ? " — bowled the previous over" : ""}
              </option>
            );
          })}
        </select>

        {selectedPlayer ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[11px] font-bold shrink-0">
              {nameFor(selectedPlayer).charAt(0) || "B"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {nameFor(selectedPlayer)}
              </p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                {stats ? `${stats.overs_str} ov` : "0.0 ov"}
                {stats?.maidens > 0 && (
                  <span className="ml-1 text-gray-500">
                    · {stats.maidens} M
                  </span>
                )}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-black text-gray-900 tabular-nums leading-none">
                {stats?.wickets ?? 0}
              </p>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                wickets
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400 font-medium text-center py-2">
            Select a bowler to bowl this over
          </p>
        )}

        {selectedPlayer && (
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-cricket-border/30">
            <BowlingStat label="Runs" value={stats?.runs_conceded ?? 0} />
            <BowlingStat label="Overs" value={stats?.overs_str ?? "0.0"} />
            <BowlingStat label="Econ" value={stats?.economy ?? 0} />
          </div>
        )}
      </div>
    </div>
  );
}

function BowlingStat({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-xs font-extrabold text-gray-900 tabular-nums">
        {value}
      </p>
      <p className="text-[10px] text-gray-400 font-semibold">{label}</p>
    </div>
  );
}
