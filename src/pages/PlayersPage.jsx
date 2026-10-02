import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Award,
  CheckCircle2,
  Pencil,
  Plus,
  Target,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { usePlayers } from "../hooks/usePlayers";
import { useDeletePlayer } from "../hooks/useDeletePlayer";
import { extractErrorMessage } from "../api/client";
import {
  Avatar,
  Badge,
  Button,
  CardSkeletonGrid,
  EmptyState,
  ErrorState,
  PageHeader,
  useConfirm,
} from "../components/ui";

function DetailRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5">
      <span
        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-surface-muted text-ink-subtle"
        aria-hidden="true"
      >
        {icon}
      </span>
      <p className="min-w-0 text-[13px] leading-snug text-ink-muted">
        <span className="font-medium text-ink-subtle">{label}: </span>
        <span className="text-ink">{value}</span>
      </p>
    </div>
  );
}

function PlayerCard({ player }) {
  const navigate = useNavigate();
  const deletePlayer = useDeletePlayer();
  const { confirm } = useConfirm();
  const [error, setError] = useState("");

  const name = `${player.first_name ?? ""} ${player.last_name ?? ""}`.trim();
  const squad = [
    Array.isArray(player.role) ? player.role.join(", ") : player.role,
    player.team?.name ?? player.team_name,
    player.level?.name ?? player.level_name,
  ]
    .filter(Boolean)
    .join(" • ");

  async function handleDelete() {
    const confirmed = await confirm({
      title: `Delete ${name}?`,
      description:
        "This permanently removes the player and their squad assignments. This can't be undone.",
      confirmLabel: "Delete player",
      variant: "danger",
    });
    if (!confirmed) return;

    setError("");
    deletePlayer.mutate(player.id, {
      onError: (err) => setError(extractErrorMessage(err)),
    });
  }

  return (
    <article className="flex flex-col rounded-card border border-line bg-surface p-5 shadow-card transition-[box-shadow,border-color] duration-200 hover:border-brand-200 hover:shadow-raised">
      <div className="flex items-start gap-3">
        <Avatar src={player.profile_image} name={name} size="lg" />

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold leading-tight text-ink">
            {name || "Unnamed player"}
          </h3>
          <p className="mt-1 text-[13px] text-ink-subtle">#{player.id}</p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => navigate(`/players/${player.id}/edit`)}
            aria-label={`Edit ${name || "player"}`}
            className="flex size-9 items-center justify-center rounded-lg text-ink-subtle transition hover:bg-surface-muted hover:text-ink"
          >
            <Pencil className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deletePlayer.isPending}
            aria-label={`Delete ${name || "player"}`}
            className="flex size-9 items-center justify-center rounded-lg text-ink-subtle transition hover:bg-danger-50 hover:text-danger-700 disabled:opacity-50"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        <DetailRow
          icon={<UserRound className="size-3.5" />}
          label="Gender"
          value={player.gender}
        />
        <DetailRow
          icon={<Award className="size-3.5" />}
          label="Batting"
          value={
            player.batting_hand || player.batting_position
              ? `${[player.batting_hand && `${player.batting_hand} handed`, player.batting_position]
                  .filter(Boolean)
                  .join(" • ")}`
              : null
          }
        />
        <DetailRow
          icon={<Target className="size-3.5" />}
          label="Bowling"
          value={
            player.bowling_hand || player.bowling_type
              ? `${[player.bowling_hand && `${player.bowling_hand} handed`, player.bowling_type]
                  .filter(Boolean)
                  .join(" • ")}`
              : null
          }
        />
        <DetailRow icon={<Users className="size-3.5" />} label="Squad" value={squad} />
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-[13px] text-danger-800"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-3">
        <span className="text-[13px] text-ink-subtle">
          {player.height && player.weight
            ? `${player.height} cm • ${player.weight} kg`
            : "Physicals not recorded"}
        </span>
        {player.is_phone_verified ? (
          <Badge tone="success" size="sm">
            <CheckCircle2 className="size-3" aria-hidden="true" />
            Verified
          </Badge>
        ) : (
          <Badge tone="warning" size="sm">
            <AlertCircle className="size-3" aria-hidden="true" />
            Pending OTP
          </Badge>
        )}
      </div>
    </article>
  );
}

function PlayersPage() {
  const { data: players, isLoading, isError, error, refetch } = usePlayers();

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Players"
          description="Every registered athlete in the league."
        />
        <CardSkeletonGrid count={6} />
      </>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load players"
        message={extractErrorMessage(error)}
        onRetry={() => refetch()}
      />
    );
  }

  const list = players ?? [];

  return (
    <>
      <PageHeader
        title="Players"
        description={`${list.length} ${list.length === 1 ? "athlete" : "athletes"} registered with full skill profiles.`}
        actions={
          list.length > 0 ? (
            <Button as={Link} to="/players/new" variant="secondary">
              <Plus className="size-4" aria-hidden="true" />
              Add player
            </Button>
          ) : undefined
        }
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<Users className="size-6" aria-hidden="true" />}
          title="No players registered yet"
          description="Start onboarding players to create squads and fixtures."
          action={
            <Button as={Link} to="/players/new">
              <Plus className="size-4" aria-hidden="true" />
              Register your first player
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}
    </>
  );
}

export default PlayersPage;