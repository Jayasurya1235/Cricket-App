import { useState } from "react";
import { X, UserMinus } from "lucide-react";

const WICKET_TYPES = [
  { value: "bowled", label: "Bowled", icon: "🎳" },
  { value: "caught", label: "Caught", icon: "🤲" },
  { value: "lbw", label: "LBW", icon: "🦵" },
  { value: "run_out", label: "Run Out", icon: "🏃" },
  { value: "stumped", label: "Stumped", icon: "🧤" },
  { value: "hit_wicket", label: "Hit Wicket", icon: "💥" },
];

function nameOf(map, id) {
  const p = map?.[id];
  if (!p) return `Player #${id}`;
  return `${p.first_name || ""} ${p.last_name || ""}`.trim() || `Player #${id}`;
}

export default function WicketModal({ scorecard, nameMap, onConfirm, onClose, isProcessing }) {
  const [wicketType, setWicketType] = useState("");
  const [dismissedId, setDismissedId] = useState(
    scorecard?.striker_id ?? "",
  );

  if (!scorecard) return null;

  const striker = scorecard.batsmen?.find(
    (b) => b.player_id === scorecard.striker_id,
  );
  const nonStriker = scorecard.batsmen?.find(
    (b) => b.player_id === scorecard.non_striker_id,
  );

  function handleSubmit() {
    if (!wicketType || !dismissedId) return;
    onConfirm({
      wicket_type: wicketType,
      dismissed_player_id: Number(dismissedId),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto shadow-2xl animate-[slideUp_0.25s_ease-out]">
        <div className="sticky top-0 bg-white border-b border-cricket-border/50 px-5 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <UserMinus className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Wicket</h2>
              <p className="text-[11px] text-gray-400">
                Who is out and how?
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2.5">
              Dismissed Player
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[striker, nonStriker].filter(Boolean).map((b) => (
                <button
                  key={b.player_id}
                  onClick={() => setDismissedId(b.player_id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all duration-150 ${
                    dismissedId === b.player_id
                      ? "border-red-500 bg-red-50 shadow-sm"
                      : "border-gray-100 bg-gray-50 hover:border-gray-200"
                  }`}
                >
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    {b.player_id === scorecard.striker_id ? "On Strike" : "Non-Striker"}
                  </p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5 truncate">
                    {nameOf(nameMap, b.player_id)}
                  </p>
                  <p className="text-[11px] text-gray-500 tabular-nums">
                    {b.runs} ({b.balls_faced})
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2.5">
              How was the batsman dismissed?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {WICKET_TYPES.map((wt) => (
                <button
                  key={wt.value}
                  onClick={() => setWicketType(wt.value)}
                  className={`p-3 rounded-xl border-2 text-left transition-all duration-150 active:scale-[0.98] ${
                    wicketType === wt.value
                      ? "border-red-500 bg-red-50 shadow-sm"
                      : "border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-lg">{wt.icon}</span>
                  <p
                    className={`text-xs font-bold mt-1 ${
                      wicketType === wt.value ? "text-red-700" : "text-gray-700"
                    }`}
                  >
                    {wt.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!wicketType || !dismissedId || isProcessing}
            className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserMinus className="w-4 h-4" />
                Record Wicket
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}