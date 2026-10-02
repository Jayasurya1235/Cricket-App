import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Plus, Radio } from "lucide-react";
import { useMatches } from "../hooks/useMatches";
import { useTeams } from "../hooks/useTeams";
import { getMatchStatus } from "../api/matchSchema";
import { extractErrorMessage } from "../api/client";
import {
  Badge,
  Button,
  CardSkeletonGrid,
  EmptyState,
  ErrorState,
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

function formatWhen(date, time) {
  if (!date) return null;
  const parsed = new Date(`${date}T${time || "00:00"}`);
  if (Number.isNaN(parsed.getTime())) return [date, time].filter(Boolean).join(" • ");

  const day = parsed.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const clock = time
    ? parsed.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    : null;
  return [day, clock].filter(Boolean).join(" • ");
}

function MatchCard({ match, team1, team2 }) {
  const status = getMatchStatus(match);
  const tone = STATUS_TONES[status] ?? "neutral";
  const when = formatWhen(match.match_date, match.match_time);

  return (
    <article className="group relative flex flex-col rounded-card border border-line bg-surface p-5 shadow-card transition-[box-shadow,border-color] duration-200 hover:border-brand-200 hover:shadow-raised focus-within:border-brand-300">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
          {match.match_type}
        </span>
        <Badge tone={tone} size="sm" dot pulse={status === "Live"}>
          {status === "Live" ? "Live" : status}
        </Badge>
      </div>

      <div className="my-5 flex items-center gap-3">
        {[team1, team2].map((team, index) => (
          <div key={index} className="flex flex-1 flex-col items-center gap-2 text-center">
            <TeamBadge
              name={team?.name}
              shortName={team?.short_name}
              src={team?.logo ?? team?.logo_url}
              size="md"
            />
            <span className="w-full truncate text-[13px] font-semibold leading-tight text-ink">
              {team?.name ?? (index === 0 ? "Team 1" : "Team 2")}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-auto space-y-2 border-t border-line pt-3">
        {match.venue && (
          <p className="flex items-center gap-2 truncate text-[13px] text-ink-subtle">
            <MapPin className="size-4 shrink-0 text-ink-faint" aria-hidden="true" />
            <span className="truncate">{match.venue}</span>
          </p>
        )}
        {when && (
          <p className="flex items-center gap-2 text-[13px] text-ink-subtle">
            <CalendarDays className="size-4 shrink-0 text-ink-faint" aria-hidden="true" />
            <span className="truncate">{when}</span>
          </p>
        )}
        <p className="pt-1 text-[13px]">
          <Link
            to={`/matches/${match.id}`}
            className="rounded font-semibold text-brand-700 underline-offset-4 transition hover:text-brand-800 hover:underline after:absolute after:inset-0 after:content-['']"
          >
            {status === "Live" ? "View live score" : "View scorecard"}
            <span className="sr-only"> for {team1?.name} vs {team2?.name}</span>
          </Link>
        </p>
      </div>
    </article>
  );
}

function MatchesPage() {
  const { data: matches, isLoading, isError, error, refetch } = useMatches();
  const { data: teams } = useTeams();

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Matches"
          description="Scheduled, live, and completed fixtures."
        />
        <CardSkeletonGrid count={6} />
      </>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load matches"
        message={extractErrorMessage(error)}
        onRetry={() => refetch()}
      />
    );
  }

  const list = matches ?? [];

  return (
    <>
      <PageHeader
        title="Matches"
        description={`${list.length} ${list.length === 1 ? "fixture" : "fixtures"} across scheduled, live, and completed events.`}
        actions={
          list.length > 0 ? (
            <Button as={Link} to="/matches/new" variant="secondary">
              <Plus className="size-4" aria-hidden="true" />
              Schedule match
            </Button>
          ) : undefined
        }
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<Radio className="size-6" aria-hidden="true" />}
          title="No matches scheduled yet"
          description="Pick two competing teams, a venue, and a match type to plan your first fixture."
          action={
            <Button as={Link} to="/matches/new">
              <Plus className="size-4" aria-hidden="true" />
              Schedule a match
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((match) => {
            // The backend response embeds team_a/team_b; fall back to the local
            // teams list for older/partial payloads.
            const team1 =
              match.team_a ||
              teams?.find(
                (team) => team.id === match.team_a_id || team.id === match.team1_id,
              );
            const team2 =
              match.team_b ||
              teams?.find(
                (team) => team.id === match.team_b_id || team.id === match.team2_id,
              );

            return (
              <MatchCard
                key={match.id}
                match={match}
                team1={team1}
                team2={team2}
              />
            );
          })}
        </div>
      )}
    </>
  );
}

export default MatchesPage;