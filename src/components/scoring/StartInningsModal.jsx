import { useState, useMemo } from "react";
import { X, Play, RotateCcw } from "lucide-react";

function playerName(p) {
  if (!p) return "";
  return `${p.first_name || ""} ${p.last_name || ""}`.trim() || `Player #${p.id}`;
}

export default function StartInningsModal({
  teamA,
  teamB,
  rosterA = [],
  rosterB = [],
  defaultTeamId,
  title = "Start Innings",
  isProcessing,
  errorMessage,
  onConfirm,
  onClose,
}) {
  const [battingTeamId, setBattingTeamId] = useState(
    String(defaultTeamId ?? teamA?.id ?? ""),
  );
  const [order, setOrder] = useState([]);

  const activeTeam = String(battingTeamId) === String(teamB?.id) ? teamB : teamA;
  const roster =
    String(battingTeamId) === String(teamB?.id) ? rosterB : rosterA;

  const selectedSet = useMemo(() => new Set(order), [order]);

  function togglePlayer(id) {
    setOrder((prev) =>
      selectedSet.has(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function resetOrder() {
    setOrder([]);
  }

  function canSubmit() {
    return order.length >= 1 && !isProcessing && activeTeam?.id;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl animate-[slideUp_0.25s_ease-out]">
        <div className="sticky top-0 bg-white border-b border-cricket-border/50 px-5 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl z-10">
          <div>
            <h2 className="text-sm font-bold text-gray-900">{title}</h2>
            <p className="text-[11px] text-gray-400">
              Choose the batting side and the order they bat in
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {teamA?.id && teamB?.id && (
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2.5">
                Batting Team
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setBattingTeamId(String(teamA.id))}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all duration-150 ${
                    String(battingTeamId) === String(teamA.id)
                      ? "border-emerald-500 bg-emerald-50 shadow-sm"
                      : "border-gray-100 bg-gray-50 hover:border-gray-200"
                  }`}
                >
                  <p className="text-sm font-extrabold text-gray-900">
                    {teamA.short_name || teamA.name}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                    {teamA.name}
                  </p>
                </button>
                <button
                  onClick={() => setBattingTeamId(String(teamB.id))}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all duration-150 ${
                    String(battingTeamId) === String(teamB.id)
                      ? "border-emerald-500 bg-emerald-50 shadow-sm"
                      : "border-gray-100 bg-gray-50 hover:border-gray-200"
                  }`}
                >
                  <p className="text-sm font-extrabold text-gray-900">
                    {teamB.short_name || teamB.name}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                    {teamB.name}
                  </p>
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Batting Order{" "}
              <span className="font-medium normal-case text-gray-400">
                (tap players in order)
              </span>
            </label>
            <button
              onClick={resetOrder}
              className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 hover:text-red-500 transition"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {selectedSet.size > 0 && (
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                {order.map((id, i) => {
                  const p = roster.find((r) => r.id === Number(id));
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-white border border-emerald-200 px-2 py-1 rounded-full"
                    >
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px]">
                        {i + 1}
                      </span>
                      {playerName(p)}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {roster.length === 0 ? (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
              <p className="text-xs font-bold text-amber-700">
                No players assigned to {activeTeam?.name}
              </p>
              <p className="text-[11px] text-amber-600 mt-1">
                Go to the team page and assign players to the Playing XI first.
              </p>
            </div>
          ) : (
            <div className="border border-cricket-border rounded-xl divide-y divide-cricket-border/40 max-h-60 overflow-y-auto">
              {roster.map((p) => {
                const selected = selectedSet.has(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePlayer(p.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition ${
                      selected ? "bg-emerald-50/70" : "hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        selected
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {selected ? order.indexOf(p.id) + 1 : ""}
                    </span>
                    <span className="text-sm font-semibold text-gray-800 truncate flex-1">
                      {playerName(p)}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {p.batting_position || ""}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-xs">
              {errorMessage}
            </div>
          )}

          <button
            onClick={() => onConfirm(Number(battingTeamId), order)}
            disabled={!canSubmit()}
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-sm transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Play className="w-4 h-4" />
                Begin {activeTeam?.short_name || "Batting"} Innings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}