import { Link, useParams } from "react-router-dom";
import {
  CalendarDays,
  Coins,
  MapPin,
  Play,
  ScrollText,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { useMatch } from "../hooks/useMatch";
import { useTeams } from "../hooks/useTeams";
import { getMatchStatus } from "../api/matchSchema";
import { extractErrorMessage } from "../api/client";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  TeamBadge,
} from "../components/ui";

const STATUS_TONES = {
  Upcoming: "info",
  Scheduled: "info",
  Live: "live",
  Completed: "neutral",
  Abandoned: "danger",
};

function MetaItem({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
        <Icon className="size-3.5 shrink-0 text-ink-faint" aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1.5 truncate text-sm font-semibold text-ink">
        {value || "To be announced"}
      </dd>
    </div>
  );
}

function CompetingTeam({ team, isTossWinner, tossDecision }) {
  if (!team) return null;

  return (
    <Card className="flex flex-1 flex-col gap-4 p-5">
      <div className="flex items-center gap-3">
        <TeamBadge
          name={team.name}
          shortName={team.short_name}
          src={team.logo ?? team.logo_url}
          size="md"
        />
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold leading-tight text-ink">
            <Link
              to={`/teams/${team.id}`}
              className="rounded transition hover:text-brand-800"
            >
              {team.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-[13px] text-ink-subtle">
            {team.short_name}
          </p>
        </div>
      </div>

      {isTossWinner && (
        <Badge tone="warning" size="sm" className="self-start">
          <Coins className="size-3" aria-hidden="true" />
          Won toss, chose to {tossDecision?.toLowerCase()} first
        </Badge>
      )}
    </Card>
  );
}

function MatchDetailPage() {
  const { matchId } = useParams();
  const { data: match, isLoading, isError, error, refetch } = useMatch(matchId);
  const { data: teams, isLoading: teamsLoading } = useTeams();

  if (isLoading || teamsLoading) {
    return <LoadingState label="Loading match details…" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load match"
        message={extractErrorMessage(error)}
        onRetry={() => refetch()}
      />
    );
  }

  if (!match) {
    return (
      <EmptyState
        icon={<ScrollText className="size-6" aria-hidden="true" />}
        title="Match not found"
        description="This fixture may have been removed, or the link is incorrect."
        action={
          <Button as={Link} to="/matches" variant="secondary">
            Back to matches
          </Button>
        }
      />
    );
  }

  // The backend response embeds team_a/team_b/toss_winner; fall back to the
  // local teams list for older/partial payloads.
  const team1 =
    match.team_a ||
    teams?.find((team) => team.id === match.team_a_id || team.id === match.team1_id);
  const team2 =
    match.team_b ||
    teams?.find((team) => team.id === match.team_b_id || team.id === match.team2_id);
  const tossWinner =
    match.toss_winner ||
    teams?.find((team) => team.id === Number(match.toss_winner_id));

  const status = getMatchStatus(match);

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Matches", to: "/matches" },
          { label: `Match #${match.id}` },
        ]}
        title={`${team1?.short_name ?? "Team 1"} vs ${team2?.short_name ?? "Team 2"}`}
        description={`${match.match_type} fixture · ${[match.match_date, match.match_time]
          .filter(Boolean)
          .join(" • ")}`}
        meta={
          <Badge
            tone={STATUS_TONES[status] ?? "neutral"}
            dot
            pulse={status === "Live"}
          >
            {status}
          </Badge>
        }
        actions={
          <Button as={Link} to={`/matches/${match.id}/score`}>
            <Play className="size-4" aria-hidden="true" />
            {status === "Completed" ? "Open scorecard" : "Score this match"}
          </Button>
        }
      />

      {status === "Completed" && match.result && (
        <Card className="mb-6 flex items-center gap-3 border-brand-200 bg-brand-50 p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface text-brand-700">
            <Trophy className="size-4" aria-hidden="true" />
          </span>
          <p className="text-sm font-semibold text-brand-900">
            Match result: {match.result}
          </p>
        </Card>
      )}

      {tossWinner && (
        <Card className="mb-6 flex items-center gap-3 p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-ink-subtle">
            <Coins className="size-4" aria-hidden="true" />
          </span>
          <p className="text-sm text-ink-muted">
            <span className="font-semibold text-ink">{tossWinner.name}</span> won
            the toss and elected to{" "}
            <span className="font-semibold text-ink">
              {match.toss_decision?.toLowerCase()}
            </span>{" "}
            first.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <dl className="grid grid-cols-2 gap-5 lg:grid-cols-1">
            <MetaItem
              icon={ScrollText}
              label="Match type"
              value={match.match_type}
            />
            <MetaItem icon={MapPin} label="Venue" value={match.venue} />
            <MetaItem
              icon={CalendarDays}
              label="Date"
              value={match.match_date}
            />
          </dl>
        </Card>

        <Card className="p-5">
          <dl className="grid grid-cols-2 gap-5 lg:grid-cols-1">
            <MetaItem
              icon={ShieldCheck}
              label="Umpire 1"
              value={match.referee_1_name}
            />
            <MetaItem
              icon={ShieldCheck}
              label="Umpire 2"
              value={match.referee_2_name}
            />
            <MetaItem
              icon={ShieldCheck}
              label="Match referee"
              value={match.match_referee_name}
            />
          </dl>
        </Card>
      </div>

      <div className="mt-6 flex flex-col gap-4 md:flex-row">
        <CompetingTeam
          team={team1}
          isTossWinner={Boolean(team1 && tossWinner?.id === team1.id)}
          tossDecision={match.toss_decision}
        />
        <CompetingTeam
          team={team2}
          isTossWinner={Boolean(team2 && tossWinner?.id === team2.id)}
          tossDecision={match.toss_decision}
        />
      </div>
    </>
  );
}

export default MatchDetailPage;