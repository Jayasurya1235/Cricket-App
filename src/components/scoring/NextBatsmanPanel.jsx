import { useMemo, useState } from "react";
import { UserPlus, AlertTriangle, ChevronDown } from "lucide-react";
import { displayName } from "../../utils/scoring";

/**
 * Shown after a wicket, while the server has no striker_id. The next batsman
 * is brought in through POST /matches/{id}/batting-order — the server then
 * assigns the crease and we re-render from its response.
 *
 * Every selected batter is listed so the whole eleven stays visible; the ones
 * the server would reject (dismissed, or already at the crease) are shown but
 * cannot be chosen.
 */
export default function NextBatsmanPanel({
  choices = [],
  nameMap,
  onSelect,
  isProcessing,
  wicketType,
}) {
  const selectable = useMemo(
    () => choices.filter((c) => c.selectable),
    [choices],
  );
  const defaultId = selectable.length ? String(selectable[0].playerId) : "";
  const [picked, setPicked] = useState(null);

  // Fall back to the first available batter whenever the current pick is no
  // longer on offer (a new wicket, or a completed innings). Deriving the value
  // instead of syncing it keeps this free of an extra render pass.
  const value =
    picked !== null && selectable.some((c) => String(c.playerId) === picked)
      ? picked
      : defaultId;

  const exhausted = selectable.length === 0;

  return (
    <div className="bg-white border border-cricket-border rounded-2xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-cricket-border/50 bg-red-50/60 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <UserPlus className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="text-xs font-bold text-gray-900">Wicket</h3>
          <p className="text-[10px] text-gray-500 font-medium">
            {wicketType
              ? `Dismissed ${String(wicketType).replace(/_/g, " ")}`
              : "Choose the next batsman"}{" "}
            · select a batsman to continue
          </p>
        </div>
      </div>

      <div className="p-4">
        {exhausted ? (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-amber-800 font-semibold leading-relaxed">
              No batsmen left to come in. The batting order has been exhausted,
              and substitutes cannot be added from here.
            </p>
          </div>
        ) : (
          <>
            <label
              htmlFor="next-batsman"
              className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2"
            >
              Next batsman
            </label>

            <div className="relative">
              <select
                id="next-batsman"
                value={value}
                disabled={isProcessing}
                onChange={(e) => setPicked(e.target.value)}
                className="w-full appearance-none bg-gray-50 border-2 border-gray-100 hover:border-emerald-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 rounded-xl pl-3 pr-9 py-2.5 text-xs font-bold text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {choices.map((c) => {
                  const name = displayName(nameMap, c.playerId);
                  const label = c.selectable
                    ? `${c.position}. ${name}`
                    : `${c.position}. ${name} — ${c.status}`;
                  return (
                    <option
                      key={c.playerId}
                      value={c.playerId}
                      disabled={!c.selectable}
                    >
                      {label}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            </div>

            <div className="flex items-center justify-between gap-3 mt-3">
              <p className="text-[10px] font-medium text-gray-400">
                {selectable.length} of {choices.length} still to come in
              </p>
              <button
                type="button"
                onClick={() => onSelect(Number(value))}
                disabled={isProcessing || !value}
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
                {isProcessing ? "Bringing in..." : "Bring In"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
