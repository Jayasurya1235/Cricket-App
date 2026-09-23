export default function BatsmenPanel({ scorecard, nameMap }) {
  if (!scorecard?.batsmen?.length) return null;

  const striker = scorecard.batsmen.find(
    (b) => b.player_id === scorecard.striker_id,
  );
  const nonStriker = scorecard.batsmen.find(
    (b) => b.player_id === scorecard.non_striker_id,
  );

  const active = [striker, nonStriker].filter(Boolean);

  return (
    <div className="bg-white border border-cricket-border rounded-2xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-cricket-border/50 flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Batting
        </h3>
        <span className="text-[10px] font-semibold text-gray-400">
          {scorecard.legal_balls} balls
        </span>
      </div>

      {active.length > 0 ? (
        <div className="divide-y divide-cricket-border/40">
          {active.map((b) => (
            <BatsmanRow
              key={b.player_id}
              batsman={b}
              name={nameOf(nameMap, b.player_id)}
              isStriker={b.player_id === scorecard.striker_id}
            />
          ))}
        </div>
      ) : (
        <div className="px-4 py-6 text-center">
          <p className="text-xs text-gray-400 font-medium">
            No batsmen at the crease yet
          </p>
        </div>
      )}
    </div>
  );
}

function nameOf(map, id) {
  const p = map?.[id];
  if (!p) return `Player #${id}`;
  return `${p.first_name || ""} ${p.last_name || ""}`.trim() || `Player #${id}`;
}

function BatsmanRow({ batsman, name, isStriker }) {
  return (
    <div
      className={`px-4 py-3 flex items-center gap-3 transition-colors ${
        isStriker ? "bg-emerald-50/60" : ""
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
          isStriker ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-500"
        }`}
      >
        {name?.charAt(0) || "B"}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-bold text-gray-900 truncate">{name}</p>
          {isStriker && (
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
              On Strike
            </span>
          )}
        </div>
        <p className="text-[11px] text-gray-400 font-medium mt-0.5">
          {batsman.balls_faced} balls
          {batsman.fours > 0 && (
            <span className="ml-1.5 text-blue-500">{batsman.fours}×4</span>
          )}
          {batsman.sixes > 0 && (
            <span className="ml-1.5 text-purple-500">{batsman.sixes}×6</span>
          )}
          {batsman.out && (
            <span className="ml-1.5 text-red-500 capitalize">
              {batsman.dismissal || "out"}
            </span>
          )}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-xl font-black text-gray-900 tabular-nums leading-none">
          {batsman.runs}
        </p>
        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
          SR {batsman.strike_rate}
        </p>
      </div>
    </div>
  );
}