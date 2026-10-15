import { Link } from "react-router-dom";
import { AlertCircle, CalendarDays, Plus, Trash2, Trophy, Users } from "lucide-react";
import { useTournaments } from "../hooks/useTournaments";
import { useDeleteTournament } from "../hooks/useTournamentMutations";
import { extractErrorMessage } from "../api/client";
import { useState } from "react";
import {
  Badge,
  Button,
  CardSkeletonGrid,
  EmptyState,
  ErrorState,
  PageHeader,
  useConfirm,
} from "../components/ui";

const FORMAT_LABELS = {
  league: "League",
  knockout: "Knockout",
  league_knockout: "League + Knockout",
};

const STATUS_TONES = {
  upcoming: "info",
  ongoing: "warning",
  completed: "success",
};

function formatRange(start, end) {
  const parts = [start, end].filter(Boolean);
  return parts.length ? parts.join(" → ") : null;
}

function TournamentCard({ tournament }) {
  const confirm = useConfirm();
  const deleteTournament = useDeleteTournament();
  const [error, setError] = useState("");

  async function handleDelete(event) {
    event.preventDefault();
    event.stopPropagation();
    const ok = await confirm({
      title: `Delete ${tournament.name}?`,
      description:
        "This removes the tournament, its fixtures and its points table. This cannot be undone.",
      confirmLabel: "Delete tournament",
    });
    if (!ok) return;
    try {
      await deleteTournament.mutateAsync(tournament.id);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <article className="relative flex flex-col gap-4 rounded-card border border-line bg-surface p-5 shadow-card transition hover:border-brand-200 hover:shadow-raised focus-within:border-brand-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <Trophy className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-semibold leading-tight text-ink">
              <Link
                to={`/tournaments/${tournament.id}`}
                className="rounded after:absolute after:inset-0 after:content-[''] hover:text-brand-800"
              >
                {tournament.name}
              </Link>
            </h3>
            {tournament.description && (
              <p className="mt-0.5 line-clamp-2 text-[13px] text-ink-subtle">
                {tournament.description}
              </p>
            )}
          </div>
        </div>
        <div className="relative z-10 flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteTournament.isPending}
            aria-label={`Delete ${tournament.name}`}
            className="flex size-9 items-center justify-center rounded-lg text-ink-subtle transition hover:bg-danger-bg hover:text-danger disabled:opacity-50"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={STATUS_TONES[tournament.status] ?? "neutral"}>
          {tournament.status || "—"}
        </Badge>
        <Badge tone="neutral">
          {FORMAT_LABELS[tournament.format] ?? tournament.format}
        </Badge>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px] text-ink-subtle">
        <span className="flex items-center gap-1.5">
          <Users className="size-3.5 text-ink-faint" aria-hidden="true" />
          {tournament.team_count ?? 0} teams
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarDays className="size-3.5 text-ink-faint" aria-hidden="true" />
          {tournament.fixture_count ?? 0} fixtures
        </span>
      </div>


      {formatRange(tournament.start_date, tournament.end_date) && (
        <p className="text-[12px] text-ink-faint">
          {formatRange(tournament.start_date, tournament.end_date)}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-danger-line bg-danger-bg px-3 py-2 text-[13px] text-danger"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </article>
  );
}

export default function TournamentsPage() {
  const { data, isLoading, isError, error, refetch } = useTournaments();

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Tournaments"
          description="Leagues and cups running across the season."
        />
        <CardSkeletonGrid count={6} />
      </>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load tournaments"
        message={extractErrorMessage(error)}
        onRetry={() => refetch()}
      />
    );
  }

  const list = data ?? [];

  return (
    <>
      <PageHeader
        title="Tournaments"
        description={`${list.length} ${list.length === 1 ? "tournament" : "tournaments"} registered.`}
        actions={
          <Button as={Link} to="/tournaments/new">
            <Plus className="size-4" aria-hidden="true" />
            New tournament
          </Button>
        }
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<Trophy className="size-6" aria-hidden="true" />}
          title="No tournaments yet"
          description="Create a league or cup to group fixtures, teams and a points table."
          action={
            <Button as={Link} to="/tournaments/new">
              <Plus className="size-4" aria-hidden="true" />
              Create your first tournament
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      )}
    </>
  );
}
