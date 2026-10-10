import { cn } from "../../utils/cn";
import { TeamBadge } from "../ui";
import { teamLogo } from "../../utils/teams";

// Two-up team selector used by the scorecard and statistics tabs so both can
// switch which side's data is shown.
export function TeamSwitcher({ teams, selectedId, onSelect }) {
  if (!teams || teams.length < 2) return null;
  return (
    <div
      role="tablist"
      aria-label="Choose a team"
      className="grid grid-cols-2 gap-2 rounded-card bg-surface-muted/60 p-2"
    >
      {teams.map((team) => {
        const active = String(team.id) === String(selectedId);
        return (
          <button
            key={team.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(team.id)}
            className={cn(
              "flex min-w-0 items-center justify-center gap-2.5 rounded-card px-3 py-2.5 text-sm font-semibold transition-colors duration-150",
              active
                ? "border border-line bg-surface text-ink shadow-card"
                : "text-ink-muted hover:bg-surface/60 hover:text-ink",
            )}
          >
            <TeamBadge
              name={team.name}
              shortName={team.short_name}
              src={teamLogo(team)}
              size="sm"
            />
            <span className="truncate">{team.short_name || team.name}</span>
          </button>
        );
      })}
    </div>
  );
}

export default TeamSwitcher;
