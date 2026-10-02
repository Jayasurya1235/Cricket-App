import { useId, useMemo, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { cn } from "../../utils/cn";

// The roster is an array of player records, not a name map, so it gets its own
// accessor rather than displayName() from utils/scoring.
function playerName(p) {
  if (!p) return "";
  return `${p.first_name || ""} ${p.last_name || ""}`.trim() || `Player #${p.id}`;
}

export default function StartInningsModal({
  open,
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
  const orderId = useId();

  const activeTeam = String(battingTeamId) === String(teamB?.id) ? teamB : teamA;
  const roster =
    String(battingTeamId) === String(teamB?.id) ? rosterB : rosterA;

  const selectedSet = useMemo(() => new Set(order), [order]);
  const requiredBatters = Math.min(11, roster.length);
  const isComplete = order.length >= requiredBatters;

  function togglePlayer(id) {
    setOrder((prev) =>
      selectedSet.has(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function resetOrder() {
    setOrder([]);
  }

  const canSubmit =
    requiredBatters > 0 && isComplete && !isProcessing && !!activeTeam?.id;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description="Choose the batting side and the order they bat in"
      footer={
        <Button
          fullWidth
          size="lg"
          onClick={() => onConfirm(Number(battingTeamId), order)}
          disabled={!canSubmit}
          loading={isProcessing}
        >
          {!isProcessing && <Play className="size-4" aria-hidden="true" />}
          Begin {activeTeam?.short_name || "Batting"} Innings
        </Button>
      }
    >
      <div className="space-y-5">
        {teamA?.id && teamB?.id && (
          <div role="radiogroup" aria-label="Batting Team">
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
              Batting Team
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { team: teamA, roster: rosterA },
                { team: teamB, roster: rosterB },
              ].map(({ team, roster: teamRoster }) => {
                const isActive = String(battingTeamId) === String(team.id);
                return (
                  <button
                    key={team.id}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => setBattingTeamId(String(team.id))}
                    className={cn(
                      "rounded-card border-2 p-3.5 text-left transition-all duration-150",
                      "focus-visible:outline-2 focus-visible:outline-offset-2",
                      "focus-visible:outline-brand-600",
                      isActive
                        ? "border-brand-500 bg-brand-50 shadow-sm"
                        : "border-line bg-surface-muted hover:border-line-strong",
                    )}
                  >
                    <p className="text-sm font-extrabold text-ink">
                      {team.short_name || team.name}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-ink-muted">
                      {team.name}
                    </p>
                    <p className="mt-1 text-[10px] text-ink-faint">
                      {Math.min(11, teamRoster.length)} available
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div>
            <p
              id={orderId}
              className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle"
            >
              Batting Order{" "}
              <span className="font-medium normal-case text-ink-faint">
                (tap players in order)
              </span>
            </p>
            {requiredBatters > 0 && (
              <p
                className={cn(
                  "mt-0.5 text-[10px] font-bold",
                  isComplete ? "text-brand-700" : "text-warning",
                )}
              >
                {order.length} of {requiredBatters} selected
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetOrder}
            disabled={selectedSet.size === 0}
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Reset
          </Button>
        </div>

        {requiredBatters > 0 && !isComplete && (
          <div className="rounded-card border border-warning-line bg-warning-bg px-3.5 py-2.5">
            <p className="text-[11px] font-semibold text-warning">
              Select all {requiredBatters} batters in batting order.
            </p>
            <p className="mt-0.5 text-[10px] text-warning">
              The innings is all out once this order is exhausted, so a partial
              order would end the innings after the first wicket.
            </p>
          </div>
        )}

        {selectedSet.size > 0 && (
          <div className="rounded-card border border-brand-100 bg-brand-50 p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {order.map((id, i) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-surface px-2 py-1 text-[10px] font-bold text-brand-700"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-4 items-center justify-center rounded-full bg-brand-600 text-[9px] text-white"
                  >
                    {i + 1}
                  </span>
                  {playerName(roster.find((r) => r.id === Number(id)))}
                </span>
              ))}
            </div>
          </div>
        )}

        {roster.length === 0 ? (
          <div className="rounded-card border border-warning-line bg-warning-bg p-4 text-center">
            <p className="text-xs font-bold text-warning">
              No players assigned to {activeTeam?.name}
            </p>
            <p className="mt-1 text-[11px] text-warning">
              Go to the team page and assign players to the Playing XI first.
            </p>
          </div>
        ) : (
          <div
            role="group"
            aria-labelledby={orderId}
            className="max-h-60 divide-y divide-line/60 overflow-y-auto rounded-card border border-line"
          >
            {roster.map((p) => {
              const selected = selectedSet.has(p.id);
              const position = selected ? order.indexOf(p.id) + 1 : null;
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => togglePlayer(p.id)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition",
                    "focus-visible:outline-2 -outline-offset-2 focus-visible:outline-brand-600",
                    selected ? "bg-brand-50" : "hover:bg-surface-muted",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                      selected
                        ? "bg-brand-600 text-white"
                        : "bg-surface-muted text-ink-muted",
                    )}
                  >
                    {position ?? ""}
                  </span>
                  <span className="flex-1 truncate text-sm font-semibold text-ink">
                    {playerName(p)}
                  </span>
                  <span className="text-[10px] text-ink-faint">
                    {p.batting_position || ""}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="rounded-card border border-danger-line bg-danger-bg p-3 text-xs text-danger"
          >
            {errorMessage}
          </div>
        )}
      </div>
    </Modal>
  );
}