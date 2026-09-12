export default function BowlerPanel({ state }) {
  const bowler = state?.current_bowler;

  return (
    <div className="bg-white border border-cricket-border rounded-2xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-cricket-border/50">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Bowling
        </h3>
      </div>

      {bowler ? (
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[11px] font-bold shrink-0">
              {bowler.name?.charAt(0) || "B"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {bowler.name}
              </p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                {bowler.overs} ov
                {bowler.maidens > 0 && (
                  <span className="ml-1 text-gray-500">
                    · {bowler.maidens} M
                  </span>
                )}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-black text-gray-900 tabular-nums leading-none">
                {bowler.wickets}
              </p>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                wickets
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-cricket-border/30">
            <BowlingStat label="Runs" value={bowler.runs} />
            <BowlingStat label="Overs" value={bowler.overs} />
            <BowlingStat label="Econ" value={bowler.economy} />
          </div>
        </div>
      ) : (
        <div className="px-4 py-6 text-center">
          <p className="text-xs text-gray-400 font-medium">
            Select bowler to begin over
          </p>
        </div>
      )}
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
