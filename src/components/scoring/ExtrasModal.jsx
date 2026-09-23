import { useState } from "react";
import { X, Plus } from "lucide-react";

export default function ExtrasModal({ extrasType, onConfirm, onClose, isProcessing }) {
  const [extraRuns, setExtraRuns] = useState(1);

  const typeConfig = {
    wide: {
      label: "Wide",
      description: "1 run for the wide plus any runs taken",
      style: "wd",
      badge: "Wd",
      color: "rose",
      borderColor: "border-rose-500",
      bgColor: "bg-rose-50",
      buttonColor: "bg-rose-600 hover:bg-rose-700",
    },
    no_ball: {
      label: "No Ball",
      description: "1 run for the no ball plus batsman runs",
      style: "nb",
      badge: "Nb",
      color: "orange",
      borderColor: "border-orange-500",
      bgColor: "bg-orange-50",
      buttonColor: "bg-orange-600 hover:bg-orange-700",
    },
    bye: {
      label: "Bye",
      description: "Runs that don't count to the batsman",
      style: "b",
      badge: "B",
      color: "sky",
      borderColor: "border-sky-500",
      bgColor: "bg-sky-50",
      buttonColor: "bg-sky-600 hover:bg-sky-700",
    },
    leg_bye: {
      label: "Leg Bye",
      description: "Runs off the batsman's body / pads",
      style: "lb",
      badge: "LB",
      color: "teal",
      borderColor: "border-teal-500",
      bgColor: "bg-teal-50",
      buttonColor: "bg-teal-600 hover:bg-teal-700",
    },
  };

  const config = typeConfig[extrasType] || typeConfig.wide;

  const RUNS =
    extrasType === "bye" || extrasType === "leg_bye"
      ? [1, 2, 3, 4]
      : [0, 1, 2, 3, 4];

  // wide:   runs_extras = 1 + additional runs
  // no_ball: runs_extras = 1, runs_batsman = additional runs
  // bye / leg_bye: runs_extras = runs
  const noBallRuns = extrasType === "no_ball" ? extraRuns : 0;
  const totalRuns =
    extrasType === "wide"
      ? 1 + extraRuns
      : extrasType === "no_ball"
        ? 1 + extraRuns
        : extraRuns;

  function handleSubmit() {
    onConfirm({
      extra_type: extrasType,
      runs_batsman: noBallRuns,
      runs_extras:
        extrasType === "wide" ? 1 + extraRuns : extrasType === "no_ball" ? 1 : extraRuns,
      total: totalRuns,
      label: config.badge,
      style: config.style,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm shadow-2xl animate-[slideUp_0.25s_ease-out]">
        <div className="px-5 py-4 flex items-center justify-between border-b border-cricket-border/50 rounded-t-3xl sm:rounded-t-2xl">
          <div>
            <h2 className="text-sm font-bold text-gray-900">{config.label}</h2>
            <p className="text-[11px] text-gray-400">{config.description}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2.5">
              {extrasType === "bye" || extrasType === "leg_bye"
                ? "How many runs?"
                : "Runs on the ball"}
            </label>
            <div className="grid grid-cols-5 gap-2">
              {RUNS.map((r) => (
                <button
                  key={r}
                  onClick={() => setExtraRuns(r)}
                  className={`h-12 rounded-xl border-2 font-bold text-sm transition-all duration-150 active:scale-95 ${
                    extraRuns === r
                      ? `${config.borderColor} ${config.bgColor} shadow-sm`
                      : "border-gray-100 bg-gray-50 hover:border-gray-200 text-gray-600"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className={`${config.bgColor} rounded-xl p-3 text-center`}>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Total {config.label} Runs
            </p>
            <p className={`text-2xl font-black mt-0.5 ${
              config.color === "rose"
                ? "text-rose-700"
                : config.color === "orange"
                  ? "text-orange-700"
                  : config.color === "sky"
                    ? "text-sky-700"
                    : "text-teal-700"
            }`}>
              {totalRuns}
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className={`w-full h-12 rounded-xl text-white font-bold text-sm transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${config.buttonColor}`}
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Record {config.label}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}