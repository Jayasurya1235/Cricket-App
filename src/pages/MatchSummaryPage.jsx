import { Link, useParams } from "react-router-dom";
import {
  Award,
  BarChart3,
  CalendarDays,
  MapPin,
  ScrollText,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { useMatch } from "../hooks/useMatch";
import { useTeams } from "../hooks/useTeams";
import { useScoringState } from "../hooks/useScoring";
import { getMatchStatus } from "../api/matchSchema";
import { extractErrorMessage } from "../api/client";
import { resolveMatchTeam, teamLogo } from "../utils/teams";
import {
  Badge,
  Button,
  Card,
  ErrorState,
  LoadingState,
  PageHeader,
  TeamBadge,
} from "../components/ui";

// The scorecard is the ONLY source of innings numbers here. The scoring API
// exposes GET /matches/{id}/scorecard for the current innings and no
// ball-by-ball or innings-list endpoint, so a summary page can only describe
// the innings the server is currently on. Anything the payload does not carry
// is left out rather than filled with a placeholder.
function formatRuns(runs, wickets) {
  if (wickets == null) return String(runs ?? 0);
  return `${runs}/${wickets}`;
}

function formatOvers(oversStr, overs) {
  if (oversStr) return `${oversStr} overs`;
  if (overs != null) return `${overs} overs`;
  return null;
}

function fullName(first, last) {
  return `${first || ""} ${last || ""}`.trim();
}

// Derived from the scorecard's own batsman cards: most runs, then most balls
// faced, then the better strike rate. Not a backend field, but it is a sort of
// real numbers the server returned rather than an invented stat.
function topBatsman(batsmen) {
  if (!Array.isArray(batsmen) || batsmen.length === 0) return null;
  return [...batsmen].sort((a, b) => {
    if ((b.runs ?? 0) !== (a.runs ?? 0)) return (b.runs ?? 0) - (a.runs ?? 0);
    if ((b.balls_faced ?? 0) !== (a.balls_faced ?? 0)) {
      return (b.balls_faced ?? 0) - (a.balls_faced ?? 0);
    }
    return (b.strike_rate ?? 0) - (a.strike_rate ?? 0);
  })[0];
}

// Same idea for bowling: most wickets, then the best economy, then the fewest
// runs conceded.
function bestBowler(bowlers) {
  if (!Array.isArray(bowlers) || bowlers.length === 0) return null;
  return [...bowlers].sort((a, b) => {
    if ((b.wickets ?? 0) !== (a.wickets ?? 0)) return (b.wickets ?? 0) - (a.wickets ?? 0);
    const aEcon = a.economy ?? Number.POSITIVE_INFINITY;
    const bEcon = b.economy ?? Number.POSITIVE_INFINITY;
    if (aEcon !== bEcon) return aEcon - bEcon;
    return (b.runs_conceded ?? 0) - (a.runs_conceded ?? 0);
  })[0];
}

function round(value, digits = 2) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return value.toFixed(digits);
}

// A half-century/century is a threshold we apply to the server's own runs
// column, so the milestone text is always backed by a real recorded score.
function milestoneFor(runs) {
  if (runs == null) return null;
  if (runs >= 100) return "Century";
  if (runs >= 50) return "Half-century";
  return null;
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <Card className="p-6">
      <h2 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-ink-subtle">
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </Card>
  );
}

function PerformerRow({ name, subtitle, stats }) {
  return (
    <div className="flex flex-col gap-4 rounded-card border border-line bg-surface-muted/40 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate text-[15px] font-bold text-ink">{name}</p>
        {subtitle && (
          <p className="mt-0.5 truncate text-[13px] text-ink-subtle">{subtitle}</p>
        )}
      </div>
      <dl className="grid shrink-0 grid-cols-3 gap-3 sm:gap-5">
        {stats.map((stat) => (
          <div key={stat.label} className="min-w-0 text-center sm:text-right">
            <dd className="truncate text-base font-bold text-ink">{stat.value}</dd>
            <dt className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
              {stat.label}
            </dt>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function MatchSummaryPage() {
  const { matchId } = useParams();
  const {
    data: match,
    isLoading: matchLoading,
    isError: matchIsError,
    error: matchError,
    refetch,
  } = useMatch(matchId);
  const { data: teams } = useTeams();
  const { data: scorecard } = useScoringState(matchId);

  if (matchLoading) {
    return <LoadingState label="Loading match summary…" />;
  }

  if (matchIsError) {
    return (
      <ErrorState
        title="Couldn't load match summary"
        message={extractErrorMessage(matchError)}
        onRetry={() => refetch()}
      />
    );
  }

  if (!match) {
    return (
      <Card className="flex flex-col items-center gap-3 p-12 text-center">
        <ScrollText className="size-10 text-ink-faint" aria-hidden="true" />
        <h2 className="text-xl font-bold text-ink">Match not found</h2>
        <p className="max-w-sm text-sm text-ink-subtle">
          This fixture may have been removed, or the link is incorrect.
        </p>
        <Button as={Link} to="/matches" variant="secondary">
          Back to matches
        </Button>
      </Card>
    );
  }

  // The backend embeds team_a/team_b/toss_winner as { id, name, short_name }
  // with no logo; join against the teams list so the crest shows here too.
  const teamA = resolveMatchTeam(match, match.team_a, teams, "team_a_id", "team1_id");
  const teamB = resolveMatchTeam(match, match.team_b, teams, "team_b_id", "team2_id");
  const tossWinner = resolveMatchTeam(
    match,
    match.toss_winner,
    teams,
    "toss_winner_id",
  );

  const status = getMatchStatus(match);
  const battingTeam = scorecard
    ? scorecard.batting_team_id === teamB?.id
      ? teamB
      : teamA
    : null;
  const bowlingTeam = scorecard
    ? scorecard.batting_team_id === teamB?.id
      ? teamA
      : teamB
    : null;

  const bestBatting = topBatsman(scorecard?.batsmen);
  const bestBowling = bestBowler(scorecard?.bowlers);

  const fiftyPlus = (Array.isArray(scorecard?.batsmen)
    ? scorecard.batsmen
    : []
  )
    .map((b) => ({ b, milestone: milestoneFor(b.runs) }))
    .filter((entry) => entry.milestone)
    .sort((x, y) => (y.b.runs ?? 0) - (x.b.runs ?? 0));

  const hatTricks = (Array.isArray(scorecard?.bowlers)
    ? scorecard.bowlers
    : []
  ).filter((b) => (b.wickets ?? 0) >= 3);

  // Built strictly from fields the match and scorecard payloads actually
  // contain. No entry is added speculatively.
  const highlights = [];
  if (tossWinner && match.toss_decision) {
    highlights.push(
      `${tossWinner.name} won the toss and elected to ${String(match.toss_decision).toLowerCase()} first.`,
    );
  }
  if (match.result) {
    highlights.push(`Result: ${match.result}.`);
  }
  if (scorecard) {
    const line = `${battingTeam?.name ?? "The batting side"} finished on ${formatRuns(scorecard.total, scorecard.wickets)} from ${formatOvers(scorecard.overs_bowled_str, scorecard.overs_bowled) ?? "0 overs"}.`;
    highlights.push(line);
  }
  for (const { b, milestone } of fiftyPlus.slice(0, 3)) {
    const name = fullName(b.first_name, b.last_name) || `Player #${b.player_id}`;
    highlights.push(`${milestone}: ${name} made ${b.runs} from ${b.balls_faced} balls.`);
  }
  for (const b of hatTricks.slice(0, 2)) {
    const name = fullName(b.first_name, b.last_name) || `Player #${b.player_id}`;
    highlights.push(
      `${b.wickets}-wicket spell: ${name} took ${b.wickets} for ${b.runs_conceded} in ${formatOvers(b.overs_str, b.overs) ?? "their spell"}.`,
    );
  }
  if (scorecard?.end_reason) {
    highlights.push(`Innings ended: ${String(scorecard.end_reason).replace(/_/g, " ")}.`);
  }

  const resultLine = match.result || scorecard?.match_result || null;

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Matches", to: "/matches" },
          { label: `Match #${match.id}` },
        ]}
        title={`${teamA?.short_name ?? "Team 1"} vs ${teamB?.short_name ?? "Team 2"}`}
        description={`${match.match_type} · ${[match.match_date, match.match_time]
          .filter(Boolean)
          .join(" · ")}`}
        meta={
          <Badge
            tone={
              status === "Completed" ? "success" : status === "Live" ? "live" : "info"
            }
            dot
            pulse={status === "Live"}
          >
            {status}
          </Badge>
        }
        actions={
          <Button as={Link} to={`/matches/${match.id}`} variant="secondary">
            Match details
          </Button>
        }
      />

      <div className="space-y-6">
        <SectionCard icon={BarChart3} title="Match Summary">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              {[teamA, teamB].map((team) => {
                const isBatting = Boolean(
                  scorecard && team && scorecard.batting_team_id === team.id,
                );
                return (
                  <div
                    key={team?.id ?? "unknown"}
                    className="flex items-center justify-between gap-4 rounded-card border border-line bg-surface-muted/40 p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <TeamBadge
                        name={team?.name}
                        shortName={team?.short_name}
                        src={teamLogo(team)}
                        size="md"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-ink">
                          {team?.name ?? "Team"}
                        </p>
                        <p className="truncate text-xs text-ink-subtle">
                          {isBatting
                            ? `${formatRuns(scorecard.total, scorecard.wickets)} (${formatOvers(scorecard.overs_bowled_str, scorecard.overs_bowled)})`
                            : "Awaiting scorecard data"}
                        </p>
                      </div>
                    </div>
                    {isBatting && (
                      <span className="shrink-0 text-right text-[11px] font-semibold uppercase tracking-wide text-brand-700">
                        Batting
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-card border border-line p-4">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
                  Result
                </dt>
                <dd className="mt-1 text-sm font-semibold text-ink">
                  {resultLine || "Not recorded"}
                </dd>
              </div>
              <div className="rounded-card border border-line p-4">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
                  Toss
                </dt>
                <dd className="mt-1 text-sm font-semibold text-ink">
                  {tossWinner
                    ? `${tossWinner.name} won the toss${
                        match.toss_decision
                          ? ` and chose to ${String(match.toss_decision).toLowerCase()}`
                          : ""
                      }`
                    : "Not recorded"}
                </dd>
              </div>
              <div className="rounded-card border border-line p-4">
                <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
                  <MapPin className="size-3.5" aria-hidden="true" />
                  Venue
                </dt>
                <dd className="mt-1 truncate text-sm font-semibold text-ink">
                  {match.venue || "Not recorded"}
                </dd>
              </div>
              <div className="rounded-card border border-line p-4">
                <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  Date
                </dt>
                <dd className="mt-1 truncate text-sm font-semibold text-ink">
                  {[match.match_date, match.match_time].filter(Boolean).join(" · ") ||
                    "Not recorded"}
                </dd>
              </div>
            </dl>
          </div>
        </SectionCard>

        {status === "Completed" && resultLine && (
          <Card className="flex items-center gap-4 border-brand-200 bg-brand-50 p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-card bg-surface text-brand-700">
              <Trophy className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide text-brand-700">
                Final result
              </p>
              <p className="mt-0.5 text-base font-bold text-brand-900">
                {resultLine}
              </p>
            </div>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {bestBatting && (
            <SectionCard icon={TrendingUp} title="Top Run Scorer">
              <PerformerRow
                name={
                  fullName(bestBatting.first_name, bestBatting.last_name) ||
                  `Player #${bestBatting.player_id}`
                }
                subtitle={
                  battingTeam?.name ? `Batted for ${battingTeam.name}` : null
                }
                stats={[
                  { label: "Runs", value: bestBatting.runs ?? "-" },
                  { label: "Balls", value: bestBatting.balls_faced ?? "-" },
                  {
                    label: "Strike rate",
                    value: round(bestBatting.strike_rate) ?? "-",
                  },
                ]}
              />
            </SectionCard>
          )}

          {bestBowling && (
            <SectionCard icon={Target} title="Best Bowling">
              <PerformerRow
                name={
                  fullName(bestBowling.first_name, bestBowling.last_name) ||
                  `Player #${bestBowling.player_id}`
                }
                subtitle={
                  bowlingTeam?.name ? `Bowled for ${bowlingTeam.name}` : null
                }
                stats={[
                  {
                    label: "Overs",
                    value:
                      bestBowling.overs_str || round(bestBowling.overs, 1) || "-",
                  },
                  { label: "Runs", value: bestBowling.runs_conceded ?? "-" },
                  { label: "Wickets", value: bestBowling.wickets ?? "-" },
                  { label: "Economy", value: round(bestBowling.economy) ?? "-" },
                ]}
              />
            </SectionCard>
          )}
        </div>

        {scorecard && (
          <SectionCard icon={Users} title="Innings Summary">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-card border border-line bg-surface-muted/40 p-5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-ink-subtle">
                  Innings {scorecard.innings_number}
                </p>
                <p className="mt-1.5 truncate text-lg font-bold text-ink">
                  {battingTeam?.name ?? "Batting team"}
                </p>
                <p className="mt-1 text-sm text-ink-subtle">
                  {formatRuns(scorecard.total, scorecard.wickets)} ·{" "}
                  {formatOvers(scorecard.overs_bowled_str, scorecard.overs_bowled)}
                  {scorecard.target != null && ` · target ${scorecard.target}`}
                </p>
                {scorecard.extras > 0 && (
                  <p className="mt-1 text-xs text-ink-faint">
                    Extras {scorecard.extras} · Run rate{" "}
                    {round(scorecard.current_run_rate)}
                  </p>
                )}
              </div>
              <div className="rounded-card border border-line bg-surface-muted/40 p-5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-ink-subtle">
                  Bowling side
                </p>
                <p className="mt-1.5 truncate text-lg font-bold text-ink">
                  {bowlingTeam?.name ?? "Bowling team"}
                </p>
                <p className="mt-1 text-sm text-ink-subtle">
                  {bestBowling
                    ? `Best: ${fullName(bestBowling.first_name, bestBowling.last_name) || `Player #${bestBowling.player_id}`} — ${bestBowling.wickets}/${bestBowling.runs_conceded}`
                    : "No bowling figures recorded"}
                </p>
              </div>
            </div>
          </SectionCard>
        )}

        {highlights.length > 0 && (
          <SectionCard icon={Award} title="Match Highlights">
            <ul className="space-y-2.5">
              {highlights.map((line) => (
                <li key={line} className="flex gap-2.5 text-sm text-ink-muted">
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500"
                    aria-hidden="true"
                  />
                  <span className="min-w-0">{line}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {!scorecard && (
          <Card className="p-6 text-center">
            <p className="text-sm font-semibold text-ink">
              No scorecard recorded for this match yet
            </p>
            <p className="mt-1 text-[13px] text-ink-subtle">
              Once the innings are scored, the full summary appears here.
            </p>
            <Button
              as={Link}
              to={`/matches/${match.id}/score`}
              variant="secondary"
              className="mt-4"
            >
              Open scoring
            </Button>
          </Card>
        )}
      </div>
    </>
  );
}