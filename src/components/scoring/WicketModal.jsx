import { useState } from "react";
import { X, UserMinus } from "lucide-react";

const WICKET_TYPES = [
  { value: "bowled", label: "Bowled", icon: "🎳" },
  { value: "caught", label: "Caught", icon: "🤲" },
  { value: "lbw", label: "LBW", icon: "🦵" },
  { value: "run_out", label: "Run Out", icon: "🏃" },
  { value: "stumped", label: "Stumped", icon: "🧤" },
  { value: "hit_wicket", label: "Hit Wicket", icon: "💥" },
  { value: "hit_below_waist", label: "Hit Below Waist", icon: "⚡" },
  { value: "obstructing", label: "Obstructing", icon: "🚧" },
];

export default function WicketModal({ state, onConfirm, onClose, isProcessing }) {
  const [wicketType, setWicketType] = useState("");
  const [newBatsmanName, setNewBatsmanName] = useState("");

  const striker = state?.batsmen?.find((b) => b.is_on_strike);

  function handleSubmit() {
    if (!wicketType) return;

    const data = {
      wicket_type: wicketType,
      dismissed_batsman_id: striker?.player_id,
      new_batsman_name: newBatsmanName.trim() || "New Batsman",
      new_batsman_id: 900 + Math.floor(Math.random() * 100),
    };

    onConfirm(data);
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
                {striker?.name || "Batsman"} is on strike
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

          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
              New Batsman Name
            </label>
            <input
              type="text"
              value={newBatsmanName}
              onChange={(e) => setNewBatsmanName(e.target.value)}
              placeholder="Enter new batsman name"
              className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!wicketType || isProcessing}
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
