import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  MapPin,
  Plus,
  Radio,
  Trophy,
} from "lucide-react";
import { useMatches } from "../hooks/useMatches";
import { useTeams } from "../hooks/useTeams";
import { useFinishedMatchScorecards } from "../hooks/useFinishedMatchScorecards";
import { getMatchStatus } from "../api/matchSchema";
import { extractErrorMessage } from "../api/client";
import { resolveMatchTeam, teamLogo } from "../utils/teams";
import {
  Badge,
  Button,
  Card,
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
  Completed: "success",
  Abandoned: "danger",
};

const SECTIONS = [
  { key: "Live", label: "Live Matches", empty: "No matches are live right now." },
  {
    key: "Scheduled",
    label: "Scheduled Matches",
    empty: "No upcoming fixtures are scheduled.",
  },
  {
    key: "Completed",
    label: "Completed Matches",
    empty: "No completed matches yet.",
  },
];

function formatWhen(date, time) {
  if (!date) return null;
  const parsed = new Date(`${date}T${time || "00:00"}`);
  if (Number.isNaN(parsed.getTime())) {
    return [date, time].filter(Boolean).join(" · ");
  }

  const day = parsed.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const clock = time
    ? parsed.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    : null;
  return [day, clock].filter(Boolean).join(" · ");
}

function scoreLine(score) {
  if (!score) return null;
  const overs = score.overs_bowled_str
    ? `${score.overs_bowled_str} ov`
    : score.overs_bowled != null
      ? `${score.overs_bowled} ov`
      : null;
  return [`${score.total}/${score.wickets}`, overs].filter(Boolean).join(" · ");
}

function TeamScoreRow({ name, shortName, logo, score, isWinner }) {
  return (
    <div
      className={
        "flex items-center justify-between gap-3 rounded-card border px-3.5 py-2.5 " +
        (isWinner
          ? "border-brand-200 bg-brand-50"
          : "border-line bg-surface-muted/40")
      }
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <TeamBadge name={name} shortName={shortName} src={logo} size="sm" />
        <span className="min-w-0 truncate text-[13px] font-semibold text-ink">
          {name ?? "Team"}
        </span>
        {isWinner && (
          <Trophy
            className="size-3.5 shrink-0 text-brand-700"
            aria-label="Winner"
          />
        )}
      </div>
      <span
        className={
          "shrink-0 tabular-nums text-[13px] font-bold " +
          (score ? "text-ink" : "text-ink-faint")
        }
      >
        {score ?? "—"}
      </span>
    </div>
  );
}

function CompletedMatchCard({ match, teamA, teamB, scorecard }) {
  const when = formatWhen(match.match_date, match.match_time);
  // The scorecard names the batting side; the other team is the bowling side.
  const battingIsA = scorecard?.batting_team_id === teamA?.id;
  const scoreFor = (team) =>
    !scorecard || !team || scorecard.batting_team_id !== team.id
      ? null
      : scoreLine(scorecard);

  // Prefer the scorecard's own result string, fall back to the free-text
  // `result` the match record already carries. Both are server data.
  const result = scorecard?.match_result || match.result || null;

  return (
    <article className="group relative flex flex-col rounded-card border border-line bg-surface p-5 shadow-card transition-[box-shadow,border-color] duration-200 hover:border-brand-200 hover:shadow-raised focus-within:border-brand-300">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
          {match.match_type}
        </span>
        <Badge tone="success" size="sm" icon={<CheckCircle2 className="size-3" />}>
          Completed
        </Badge>
      </div>

      <div className="mt-4 space-y-2">
        <TeamScoreRow
          name={teamA?.name}
          shortName={teamA?.short_name}
          logo={teamLogo(teamA)}
          score={scoreFor(teamA)}
          isWinner={Boolean(result && battingIsA && scorecard)}
        />
        <TeamScoreRow
          name={teamB?.name}
          shortName={teamB?.short_name}
          logo={teamLogo(teamB)}
          score={scoreFor(teamB)}
          isWinner={Boolean(result && !battingIsA && scorecard)}
        />
      </div>

      {result ? (
        <p className="mt-3 flex items-start gap-2 rounded-card border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-[13px] font-semibold text-brand-900">
          <Trophy className="mt-0.5 size-3.5 shrink-0 text-brand-700" aria-hidden="true" />
          <span className="min-w-0">{result}</span>
        </p>
      ) : (
        <p className="mt-3 rounded-card border border-line bg-surface-muted/60 px-3.5 py-2.5 text-[13px] text-ink-subtle">
          Result not recorded
        </p>
      )}

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
            to={`/matches/${match.id}/summary`}
            className="rounded font-semibold text-brand-700 underline-offset-4 transition hover:text-brand-800 hover:underline after:absolute after:inset-0 after:content-['']"
          >
            View match summary
            <span className="sr-only">
              {" "}
              for {teamA?.name} vs {teamB?.name}
            </span>
          </Link>
        </p>
      </div>
    </article>
  );
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
          <div
            key={index}
            className="flex flex-1 flex-col items-center gap-2 text-center"
          >
            <TeamBadge
              name={team?.name}
              shortName={team?.short_name}
              src={teamLogo(team)}
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

function MatchGroup({ label, count, empty, children }) {
  return (
    <section aria-labelledby={`matches-${label.replace(/\s+/g, "-").toLowerCase()}`}>
      <div className="mb-4 flex items-baseline gap-2">
        <h2
          id={`matches-${label.replace(/\s+/g, "-").toLowerCase()}`}
          className="text-base font-bold text-ink"
        >
          {label}
        </h2>
        <span className="text-[13px] text-ink-subtle">
          {count} {count === 1 ? "match" : "matches"}
        </span>
      </div>
      {count > 0 ? (
        children
      ) : (
        <Card className="px-5 py-8 text-center">
          <p className="text-[13px] text-ink-subtle">{empty}</p>
        </Card>
      )}
    </section>
  );
}

function MatchesPage() {
  const { data: matches, isLoading, isError, error, refetch } = useMatches();
  const { data: teams } = useTeams();

  const list = useMemo(() => matches ?? [], [matches]);
  const scorecards = useFinishedMatchScorecards(list);

  // The backend embeds team_a/team_b as { id, name, short_name } with no logo,
  // so join against the teams list — otherwise the crest never shows here.
  const resolveTeam = (match, embedded, ...idKeys) =>
    resolveMatchTeam(match, embedded, teams, ...idKeys);

  const grouped = useMemo(() => {
    const buckets = {
      Live: [],
      Scheduled: [],
      Completed: [],
      Other: [],
    };
    for (const match of list) {
      const status = getMatchStatus(match);
      if (status === "Live") buckets.Live.push(match);
      else if (status === "Completed") buckets.Completed.push(match);
      else if (status === "Scheduled" || status === "Upcoming") {
        buckets.Scheduled.push(match);
      } else buckets.Other.push(match);
    }
    return buckets;
  }, [list]);

  const renderCard = (match) => {
    const teamA = resolveTeam(match, match.team_a, "team_a_id", "team1_id");
    const teamB = resolveTeam(match, match.team_b, "team_b_id", "team2_id");

    if (getMatchStatus(match) === "Completed") {
      return (
        <CompletedMatchCard
          key={match.id}
          match={match}
          teamA={teamA}
          teamB={teamB}
          scorecard={scorecards[match.id]}
        />
      );
    }
    return (
      <MatchCard
        key={match.id}
        match={match}
        team1={teamA}
        team2={teamB}
      />
    );
  };

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

  const completedCount = grouped.Completed.length;
  const totalCount = list.length;

  return (
    <>
      <PageHeader
        title="Matches"
        description={`${totalCount} ${totalCount === 1 ? "fixture" : "fixtures"} across scheduled, live, and completed events.`}
        actions={
          totalCount > 0 ? (
            <Button as={Link} to="/matches/new" variant="secondary">
              <Plus className="size-4" aria-hidden="true" />
              Schedule match
            </Button>
          ) : undefined
        }
      />

      {totalCount === 0 ? (
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
        <div className="space-y-8">
          {SECTIONS.map(({ key, label, empty }) => {
            const bucket = grouped[key];
            return (
              <MatchGroup
                key={key}
                label={label}
                count={bucket.length}
                empty={empty}
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {bucket.map(renderCard)}
                </div>
              </MatchGroup>
            );
          })}

          {grouped.Other.length > 0 && (
            <MatchGroup
              label="Other Matches"
              count={grouped.Other.length}
              empty=""
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {grouped.Other.map(renderCard)}
              </div>
            </MatchGroup>
          )}

          {completedCount > 0 && (
            <p className="text-[13px] text-ink-faint">
              {completedCount} completed{" "}
              {completedCount === 1 ? "match has" : "matches have"} a match
              summary available.
            </p>
          )}
        </div>
      )}
    </>
  );
}

export default MatchesPage;