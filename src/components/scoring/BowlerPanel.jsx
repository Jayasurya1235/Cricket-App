export default function BowlerPanel({
  scorecard,
  bowlingRoster,
  selectedBowlerId,
  onSelectBowler,
}) {
  const stats = scorecard?.bowlers?.find(
    (b) => b.player_id === Number(selectedBowlerId),
  );
  const selectedPlayer = bowlingRoster.find(
    (p) => p.id === Number(selectedBowlerId),
  );

  return (
    <div className="bg-white border border-cricket-border rounded-2xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-cricket-border/50">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Bowling
        </h3>
      </div>

      <div className="px-4 py-3 space-y-3">
        <select
          value={selectedBowlerId || ""}
          onChange={(e) => onSelectBowler(e.target.value)}
          className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
        >
          <option value="" disabled>
            Select bowler...
          </option>
          {bowlingRoster.map((p) => (
            <option key={p.id} value={p.id}>
              {`${p.first_name || ""} ${p.last_name || ""}`.trim() ||
                `Player #${p.id}`}
            </option>
          ))}
        </select>

        {selectedPlayer ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[11px] font-bold shrink-0">
              {(
                `${selectedPlayer.first_name || ""} ${
                  selectedPlayer.last_name || ""
                }`.trim().charAt(0) || "B"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {`${selectedPlayer.first_name || ""} ${
                  selectedPlayer.last_name || ""
                }`.trim()}
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