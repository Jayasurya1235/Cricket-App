import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, MapPin, Pencil, Trash2, Users } from "lucide-react";
import { useDeleteTeam } from "../hooks/useDeleteTeam";
import { extractErrorMessage } from "../api/client";
import { TeamBadge, useConfirm } from "./ui";

function playerCount(team) {
  if (team.total_players != null) return team.total_players;
  if (team.total != null) return team.total;
  if (team.players?.length != null) return team.players.length;
  return (
    (team.playing_11?.length ?? 0) +
    (team.substitutes?.length ?? 0) +
    (team.bench?.length ?? 0)
  );
}

function TeamCard({ team }) {
  const navigate = useNavigate();
  const deleteTeam = useDeleteTeam();
  const { confirm } = useConfirm();
  const [error, setError] = useState("");

  const image = team.logo || team.logo_url || null;
  const count = playerCount(team);

  async function handleDelete(event) {
    event.preventDefault();
    event.stopPropagation();

    const confirmed = await confirm({
      title: `Delete ${team.name}?`,
      description:
        "This permanently removes the team and its player registrations. This can't be undone.",
      confirmLabel: "Delete team",
      variant: "danger",
    });
    if (!confirmed) return;

    setError("");
    deleteTeam.mutate(team.id, {
      onError: (err) => setError(extractErrorMessage(err)),
    });
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card transition-[box-shadow,border-color] duration-200 hover:border-brand-200 hover:shadow-raised focus-within:border-brand-300">
      {image && (
        <div className="relative h-32 w-full overflow-hidden bg-surface-muted">
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
          />
          <div
            className="absolute inset-0 bg-linear-to-t from-surface via-surface/40 to-transparent"
            aria-hidden="true"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <TeamBadge name={team.name} shortName={team.short_name} src={image} />
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-semibold leading-tight text-ink">
                <Link
                  to={`/teams/${team.id}`}
                  className="rounded after:absolute after:inset-0 after:content-[''] hover:text-brand-800"
                >
                  {team.name}
                </Link>
              </h3>
              {team.homeground && (
                <p className="mt-1 flex items-center gap-1.5 truncate text-[13px] text-ink-subtle">
                  <MapPin
                    className="size-3.5 shrink-0 text-ink-faint"
                    aria-hidden="true"
                  />
                  {team.homeground}
                </p>
              )}
            </div>
          </div>

          <div className="relative z-10 flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                navigate(`/teams/${team.id}/edit`);
              }}
              aria-label={`Edit ${team.name}`}
              className="flex size-9 items-center justify-center rounded-lg text-ink-subtle transition hover:bg-surface-muted hover:text-ink"
            >
              <Pencil className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteTeam.isPending}
              aria-label={`Delete ${team.name}`}
              className="flex size-9 items-center justify-center rounded-lg text-ink-subtle transition hover:bg-danger-50 hover:text-danger-700 disabled:opacity-50"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <p className="mt-auto flex items-center gap-2 text-[13px] text-ink-subtle">
          <Users className="size-4 shrink-0 text-ink-faint" aria-hidden="true" />
          <span>
            {count} {count === 1 ? "player" : "players"} registered
          </span>
        </p>

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-[13px] text-danger-800"
          >
            <AlertCircle
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            {error}
          </p>
        )}
      </div>
    </article>
  );
}

export default TeamCard;