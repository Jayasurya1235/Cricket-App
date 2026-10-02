import { BookOpen } from "lucide-react";

const PRIMARY_BUTTONS = [
  { runs: 0, label: "0", color: "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200 active:bg-gray-300" },
  { runs: 1, label: "1", color: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 active:bg-emerald-200" },
  { runs: 2, label: "2", color: "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 active:bg-blue-200" },
  { runs: 3, label: "3", color: "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 active:bg-indigo-200" },
  { runs: 4, label: "4", color: "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 active:bg-amber-200" },
  { runs: 6, label: "6", color: "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 active:bg-purple-200" },
];

const EXTRA_BUTTONS = [
  { type: "wide", label: "Wide", color: "bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200 active:bg-rose-200" },
  { type: "no_ball", label: "No Ball", color: "bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200 active:bg-orange-200" },
  { type: "bye", label: "Bye", color: "bg-sky-50 hover:bg-sky-100 text-sky-600 border-sky-200 active:bg-sky-200" },
  { type: "leg_bye", label: "Leg Bye", color: "bg-teal-50 hover:bg-teal-100 text-teal-600 border-teal-200 active:bg-teal-200" },
];

export default function ScoringControls({
  onRecordRuns,
  onOpenExtras,
  onOpenWicket,
  onOpenScorecard,
  isProcessing,
  canScore = true,
  blockedReason = null,
}) {
  const disabled = isProcessing || !canScore;

  return (
    <div className="bg-white border border-cricket-border rounded-2xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-cricket-border/50">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Score
        </h3>
      </div>

      <div className="p-4 space-y-3">
        {blockedReason && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5 text-center">
            <p className="text-[11px] font-bold text-amber-800">
              {blockedReason}
            </p>
          </div>
        )}

        <div className="grid grid-cols-6 gap-2">
          {PRIMARY_BUTTONS.map((btn) => (
            <button
              key={btn.runs}
              type="button"
              onClick={() => onRecordRuns(btn.runs)}
              disabled={disabled}
              aria-label={`Add ${btn.label} run${btn.label === "1" ? "" : "s"}`}
              className={`relative h-14 sm:h-16 rounded-xl border-2 font-black text-lg sm:text-xl transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${btn.color}`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {EXTRA_BUTTONS.map((btn) => (
            <button
              key={btn.type}
              type="button"
              onClick={() => onOpenExtras(btn.type)}
              disabled={disabled}
              className={`h-11 sm:h-12 rounded-xl border-2 text-xs sm:text-sm font-bold transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${btn.color}`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onOpenWicket}
            disabled={disabled}
            className="h-12 sm:h-14 rounded-xl border-2 bg-red-50 hover:bg-red-100 text-red-600 border-red-200 active:bg-red-200 font-bold text-sm transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span className="w-2 h-2 bg-red-500 rounded-full" aria-hidden="true" />
            Wicket
          </button>
          <button
            type="button"
            onClick={onOpenScorecard}
            disabled={isProcessing}
            className="h-12 sm:h-14 rounded-xl border-2 bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200 active:bg-gray-200 font-bold text-sm transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            Scorecard
          </button>
        </div>
      </div>
    </div>
  );
}