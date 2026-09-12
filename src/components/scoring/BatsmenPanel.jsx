import { ArrowLeftRight } from "lucide-react";

export default function BatsmenPanel({ state, onSwapStriker }) {
  if (!state?.batsmen) return null;

  const striker = state.batsmen.find((b) => b.is_on_strike);
  const nonStriker = state.batsmen.find((b) => !b.is_on_strike);
  const hasBatsmen = state.batsmen.length > 0;

  return (
    <div className="bg-white border border-cricket-border rounded-2xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-cricket-border/50 flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Batting
        </h3>
        {hasBatsmen && (
          <button
            onClick={onSwapStriker}
            className="flex items-center gap-1 text-[10px] font-semibold text-gray-500 hover:text-emerald-600 transition px-2 py-1 rounded-lg hover:bg-emerald-50"
            title="Swap striker"
          >
            <ArrowLeftRight className="w-3 h-3" />
            Swap
          </button>
        )}
      </div>

      {hasBatsmen ? (
        <div className="divide-y divide-cricket-border/40">
          {striker && <BatsmanRow batsman={striker} isStriker />}
          {nonStriker && <BatsmanRow batsman={nonStriker} />}
        </div>
      ) : (
        <div className="px-4 py-6 text-center">
          <p className="text-xs text-gray-400 font-medium">
            Select striker and non-striker to begin
          </p>
        </div>
      )}
    </div>
  );
}

function BatsmanRow({ batsman, isStriker }) {
  return (
    <div
      className={`px-4 py-3 flex items-center gap-3 transition-colors ${
        isStriker ? "bg-emerald-50/60" : ""
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
          isStriker
            ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {isStriker && (
          <span className="absolute w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        )}
        {batsman.name?.charAt(0) || "B"}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-bold text-gray-900 truncate">
            {batsman.name}
          </p>
          {isStriker && (
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
              On Strike
            </span>
          )}
        </div>
        <p className="text-[11px] text-gray-400 font-medium mt-0.5">
          {batsman.balls} balls
          {batsman.fours > 0 && (
            <span className="ml-1.5 text-blue-500">{batsman.fours}×4</span>
          )}
          {batsman.sixes > 0 && (
            <span className="ml-1.5 text-purple-500">{batsman.sixes}×6</span>
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
