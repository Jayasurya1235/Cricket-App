import { useId, useMemo, useState } from "react";
import { Check, Play, RotateCcw, User } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { TeamBadge } from "../ui";
import { cn } from "../../utils/cn";
import { teamLogo } from "../../utils/teams";

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
  const requiredBatters = 11;
  const isComplete = order.length === requiredBatters;

  function togglePlayer(id) {
    setOrder((prev) => {
      if (selectedSet.has(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= requiredBatters) {
        return prev;
      }
      return [...prev, id];
    });
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
            description="Choose exactly 11 players for the Playing XI and arrange them in batting order"
      size="xl"
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
                    <div className="flex items-center gap-2.5">
                      <TeamBadge
                        name={team.name}
                        shortName={team.short_name}
                        src={teamLogo(team)}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-ink">
                          {team.short_name || team.name}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-ink-muted">
                          {team.name}
                        </p>
                      </div>
                    </div>
                    <p className="mt-1 text-[10px] text-ink-faint">
                      {teamRoster.length} players available
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p
              id={orderId}
              className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle"
            >
              Select Playing XI
            </p>
            {requiredBatters > 0 && (
              <div className="mt-1 flex items-center gap-2">
                <p
                  className={cn(
                    "text-sm font-bold",
                    isComplete ? "text-brand-700" : "text-warning",
                  )}
                >
                  Playing XI: {order.length} / {requiredBatters} selected
                </p>
                {!isComplete && (
                  <span className="text-[11px] text-ink-subtle">
                    Select exactly 11 players in batting order
                  </span>
                )}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetOrder}
            disabled={selectedSet.size === 0}
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Reset Selection
          </Button>
        </div>

        {requiredBatters > 0 && !isComplete && (
          <div className="rounded-card border border-warning-line bg-warning-bg px-3.5 py-2.5">
            <p className="text-[11px] font-semibold text-warning">
              Select exactly {requiredBatters} players for the Playing XI
            </p>
            <p className="mt-0.5 text-[10px] text-warning">
              Choose exactly 11 players in batting order to proceed.
            </p>
          </div>
        )}

        {selectedSet.size > 0 && (
          <div className="rounded-card border border-brand-100 bg-brand-50 p-3">
            <div className="flex flex-wrap items-center gap-2">
              {order.map((id, i) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-surface px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-sm"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-5 items-center justify-center rounded-full bg-brand-600 text-[10px] text-white"
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
              Go to the team page and assign players to the squad first.
            </p>
          </div>
        ) : (
          <div
            role="group"
            aria-labelledby={orderId}
            className="rounded-card border border-line bg-surface-muted/30 p-4"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {roster.map((p) => {
                const selected = selectedSet.has(p.id);
                const position = selected ? order.indexOf(p.id) + 1 : null;
                const role =
                  p.role ||
                  p.player_role ||
                  p.batting_position ||
                  p.bowling_type ||
                  "";
                const roleDisplay = role
                  ? (typeof role === "string"
                      ? role.replace(/_/g, " ")
                      : Array.isArray(role)
                        ? role.join(", ")
                        : ""
                    ).trim()
                  : "";

                let displayRole = roleDisplay;
                if (!displayRole) {
                  const batPos = p.batting_position;
                  const bowlType = p.bowling_type;
                  if (batPos === "Wicket Keeper") {
                    displayRole = "Wicket Keeper";
                  } else if (bowlType && batPos && batPos !== "Wicket Keeper") {
                    displayRole = "All-rounder";
                  } else if (batPos && !bowlType) {
                    displayRole = "Batsman";
                  } else if (bowlType && !batPos) {
                    displayRole = "Bowler";
                  }
                }

                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => togglePlayer(p.id)}
                    className={cn(
                      "group relative flex h-full flex-col items-start gap-2 rounded-2xl border p-4 text-left shadow-sm transition-all duration-150",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
                      selected
                        ? "border-brand-500 bg-brand-50 shadow-md ring-2 ring-brand-500/10"
                        : "border-line bg-surface hover:border-line-strong hover:shadow-md",
                    )}
                  >
                    {selected && (
                      <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-brand-600 bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                        <Check className="size-3.5" aria-hidden="true" />
                        <span>Selected #{position}</span>
                      </div>
                    )}
                    <div
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-full",
                        selected
                          ? "bg-brand-600 text-white"
                          : "bg-brand-100 text-brand-700",
                      )}
                    >
                      <User className="size-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate text-sm font-semibold leading-tight text-ink">
                        {playerName(p)}
                      </p>
                      {displayRole && (
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                            selected
                              ? "bg-brand-600/10 text-brand-700"
                              : "bg-surface-muted text-ink-subtle",
                          )}
                        >
                          {displayRole}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
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