import { X } from "lucide-react";

export default function ScorecardDrawer({ state, isOpen, onClose }) {
  if (!isOpen || !state) return null;

  const batting = state.batsmen || [];
  const bowler = state.current_bowler;
  const extras = state.extras || {};
  const fow = state.fall_of_wickets || [];

  const totalExtras = extras.wides + extras.no_balls + extras.byes + extras.leg_byes;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full sm:w-[420px] h-full overflow-y-auto shadow-2xl animate-[slideInRight_0.3s_ease-out]">
        <div className="sticky top-0 bg-white border-b border-cricket-border/50 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Scorecard</h2>
            <p className="text-[11px] text-gray-400">
              {state.batting_team?.short_name} · Innings {state.innings_number}
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
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {state.batting_team?.short_name}
            </p>
            <p className="text-3xl font-black text-gray-900 tabular-nums mt-1">
              {state.score.runs} / {state.score.wickets}
            </p>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">
              {Math.floor(state.overs.current)}.{state.overs.balls || 0} /{" "}
              {state.overs.total} Overs
            </p>
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
                    <th className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-2 text-right px-2">
                      R
                    </th>
                    <th className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-2 text-right px-2">
                      B
                    </th>
                    <th className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-2 text-right px-2">
                      4s
                    </th>
                    <th className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-2 text-right px-2">
                      6s
                    </th>
                    <th className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-2 text-right">
                      SR
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cricket-border/30">
                  {batting.map((b, i) => (
                    <tr
                      key={b.player_id || i}
                      className={b.is_on_strike ? "bg-emerald-50/60" : ""}
                    >
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-900">
                            {b.name}
                          </span>
                          {b.is_on_strike && (
                            <span className="text-[8px] font-bold text-emerald-600 bg-emerald-100 px-1 py-0.5 rounded">
                              *
                            </span>
                          )}
                          {!b.is_not_out && (
                            <span className="text-[10px] text-gray-400">
                              not out
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 text-right px-2 text-xs font-bold text-gray-900 tabular-nums">
                        {b.runs}
                      </td>
                      <td className="py-2 text-right px-2 text-xs text-gray-500 tabular-nums">
                        {b.balls}
                      </td>
                      <td className="py-2 text-right px-2 text-xs text-gray-500 tabular-nums">
                        {b.fours}
                      </td>
                      <td className="py-2 text-right px-2 text-xs text-gray-500 tabular-nums">
                        {b.sixes}
                      </td>
                      <td className="py-2 text-right text-xs text-gray-500 tabular-nums">
                        {b.strike_rate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bowling */}
          {bowler && (
            <div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Bowling
              </h3>
              <div className="bg-gray-50 rounded-xl p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">
                    {bowler.name}
                  </span>
                  <span className="text-xs text-gray-500 tabular-nums">
                    {bowler.overs} ov
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-3 mt-2.5 pt-2.5 border-t border-cricket-border/30">
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-900 tabular-nums">
                      {bowler.maidens}
                    </p>
                    <p className="text-[10px] text-gray-400">M</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-900 tabular-nums">
                      {bowler.runs}
                    </p>
                    <p className="text-[10px] text-gray-400">R</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-900 tabular-nums">
                      {bowler.wickets}
                    </p>
                    <p className="text-[10px] text-gray-400">W</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-900 tabular-nums">
                      {bowler.economy}
                    </p>
                    <p className="text-[10px] text-gray-400">Econ</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Extras */}
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Extras
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <ExtraItem label="Wides" value={extras.wides} />
              <ExtraItem label="No Balls" value={extras.no_balls} />
              <ExtraItem label="Byes" value={extras.byes} />
              <ExtraItem label="Leg Byes" value={extras.leg_byes} />
            </div>
            <div className="mt-2 bg-gray-50 rounded-xl p-3 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">
                Total Extras
              </span>
              <span className="text-sm font-black text-gray-900 tabular-nums">
                {totalExtras}
              </span>
            </div>
          </div>

          {/* Fall of Wickets */}
          {fow.length > 0 && (
            <div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Fall of Wickets
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {fow.map((f, i) => (
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
        </div>
      </div>
    </div>
  );
}

function ExtraItem({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-2.5 text-center">
      <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
      <p className="text-sm font-black text-gray-700 tabular-nums mt-0.5">
        {value}
      </p>
    </div>
  );
}
