import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Award,
  BarChart3,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  MapPin,
  ScrollText,
  ShieldCheck,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { useMatch } from "../hooks/useMatch";
import { useTeams } from "../hooks/useTeams";
import { useScoringState } from "../hooks/useScoring";
import { useMatchSummary } from "../hooks/useMatchSummary";
import { useMatchAnalytics } from "../hooks/useMatchAnalytics";
import { getMatchStatus } from "../api/matchSchema";
import { extractErrorMessage } from "../api/client";
import { resolveMatchTeam, teamLogo } from "../utils/teams";
import { buildInningsModels } from "../utils/matchAnalytics";
import { cn } from "../utils/cn";
import {
  Badge,
  Button,
  Card,
  ErrorState,
  LoadingState,
  PageHeader,
  TabPanel,
  Tabs,
  TeamBadge,
} from "../components/ui";
import { TeamSwitcher } from "../components/match/TeamSwitcher";
import ScorecardPanel from "../components/match/ScorecardPanel";
import StatisticsPanel from "../components/match/StatisticsPanel";
import PlayersPanel from "../components/match/PlayersPanel";
import TeamAnalyticsPanel from "../components/match/TeamAnalyticsPanel";
import HeadToHeadPanel from "../components/match/HeadToHeadPanel";

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

function round(value, digits = 2) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return value.toFixed(digits);
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
      <dl className="grid shrink-0 grid-cols-3 gap-3 sm:gap-5 lg:grid-cols-5">
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

// Joins a summary team ({ id, name, short_name }) with the full teams list so
// the uploaded logo shows here, mirroring resolveMatchTeam for the match body.
function resolveSummaryTeam(st, teams) {
  if (!st) return null;
  const full = teams?.find((team) => String(team.id) === String(st.id));
  if (!full) return st;
  const merged = { ...full };
  for (const [key, value] of Object.entries(st)) {
    if (value !== undefined) merged[key] = value;
  }
  return merged;
}

function InningsTile({ innings }) {
  return (
    <div className="rounded-card border border-line bg-surface-muted/40 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-ink-subtle">
        Innings {innings.innings_number}
        {innings.is_super_over ? " · Super Over" : ""}
      </p>
      <p className="mt-1 text-2xl font-black tabular-nums text-ink">
        {formatRuns(innings.total, innings.wickets)}
      </p>
      <p className="mt-0.5 text-[13px] text-ink-subtle">
        {formatOvers(innings.overs_bowled_str, innings.overs_bowled)} · RR{" "}
        {round(innings.run_rate)}
      </p>
      <p className="mt-1 text-xs text-ink-faint">
        Extras {innings.extras}
        {innings.target != null && ` · Target ${innings.target}`}
      </p>
    </div>
  );
}

// The per-team view: verdict, innings, and that side's leaders.
function TeamSummaryPanel({ team, summary, teams }) {
  if (!team) return null;

  const isWinner =
    summary.winner?.id != null && String(summary.winner.id) === String(team.id);
  const hasWinner = Boolean(summary.winner);

  let verdict;
  if (!hasWinner) {
    verdict = { label: summary.result_text || "No result", tone: "neutral" };
  } else if (isWinner) {
    verdict = { label: "Won", tone: "success", detail: summary.margin };
  } else {
    verdict = { label: "Lost", tone: "danger", detail: summary.margin };
  }

  const TONES = {
    success:
      "border-success-line bg-success-bg text-success",
    danger: "border-danger-line bg-danger-bg text-danger",
    neutral: "border-line bg-surface-muted text-ink-muted",
  };

  const innings = (summary.innings ?? []).filter(
    (inn) => String(inn.team?.id) === String(team.id),
  );

  const topScorer = summary.top_run_scorer;
  const topScorerHere =
    topScorer && String(topScorer.team_id) === String(team.id) ? topScorer : null;
  const bestBowler = summary.best_bowler;
  const bestBowlerHere =
    bestBowler && String(bestBowler.team_id) === String(team.id) ? bestBowler : null;

  const teamHighlights = (summary.highlights ?? []).filter(
    (h) => h.team_id == null || String(h.team_id) === String(team.id),
  );

  const badge = teams.find(
    (t) => String(t.id) === String(team.id),
  ) ?? team;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <TeamBadge
            name={badge.name}
            shortName={badge.short_name}
            src={teamLogo(badge)}
            size="md"
          />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold text-ink">
              {team.name}
            </p>
            {verdict.detail && (
              <p className="truncate text-[13px] text-ink-subtle">
                {verdict.detail}
              </p>
            )}
          </div>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 self-start items-center rounded-full border px-3 py-1 text-xs font-bold",
            TONES[verdict.tone],
          )}
        >
          {verdict.label}
        </span>
      </div>

      {innings.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {innings.map((inn) => (
            <InningsTile
              key={`${inn.innings_number}-${inn.team?.id}`}
              innings={inn}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-card border border-dashed border-line-strong bg-surface-muted/40 px-4 py-8 text-center text-[13px] text-ink-subtle">
          No innings recorded for {team.name} yet.
        </p>
      )}

      {(topScorerHere || bestBowlerHere) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {topScorerHere && (
            <div>
              <p className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-ink-subtle">
                Top run scorer
              </p>
              <PerformerRow
                name={
                  fullName(topScorerHere.first_name, topScorerHere.last_name) ||
                  `Player #${topScorerHere.player_id}`
                }
                subtitle={topScorerHere.team_name || team.name}
                stats={[
                  { label: "Runs", value: topScorerHere.runs ?? "-" },
                  { label: "Balls", value: topScorerHere.balls_faced ?? "-" },
                  { label: "4s", value: topScorerHere.fours ?? "-" },
                  { label: "6s", value: topScorerHere.sixes ?? "-" },
                  {
                    label: "SR",
                    value: round(topScorerHere.strike_rate) ?? "-",
                  },
                ]}
              />
            </div>
          )}

          {bestBowlerHere && (
            <div>
              <p className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-ink-subtle">
                Best bowler
              </p>
              <PerformerRow
                name={
                  fullName(bestBowlerHere.first_name, bestBowlerHere.last_name) ||
                  `Player #${bestBowlerHere.player_id}`
                }
                subtitle={bestBowlerHere.team_name || team.name}
                stats={[
                  {
                    label: "Overs",
                    value:
                      bestBowlerHere.overs_str ||
                      round(bestBowlerHere.overs, 1) ||
                      "-",
                  },
                  { label: "Maidens", value: bestBowlerHere.maidens ?? "-" },
                  { label: "Runs", value: bestBowlerHere.runs_conceded ?? "-" },
                  { label: "Wickets", value: bestBowlerHere.wickets ?? "-" },
                  { label: "Economy", value: round(bestBowlerHere.economy) ?? "-" },
                ]}
              />
            </div>
          )}
        </div>
      )}

      {teamHighlights.length > 0 && (
        <div>
          <p className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-ink-subtle">
            {team.name} highlights
          </p>
          <ul className="space-y-2.5">
            {teamHighlights.map((item, index) => (
              <li
                key={`${item.type}-${index}`}
                className="flex gap-2.5 text-sm text-ink-muted"
              >
                <span
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500"
                  aria-hidden="true"
                />
                <span className="min-w-0">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// The old scorecard-driven view. Kept as the fallback for matches the summary
// endpoint has no record for yet (no innings started), so nothing that worked
// before stops working.
function ScorecardFallbackView({
  match,
  teamA,
  teamB,
  scorecard,
  status,
  resultLine,
}) {
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

  const fiftyPlus = (Array.isArray(scorecard?.batsmen) ? scorecard.batsmen : [])
    .map((b) => ({ b, milestone: milestoneFor(b.runs) }))
    .filter((entry) => entry.milestone)
    .sort((x, y) => (y.b.runs ?? 0) - (x.b.runs ?? 0));

  const hatTricks = (Array.isArray(scorecard?.bowlers) ? scorecard.bowlers : [])
    .filter((b) => (b.wickets ?? 0) >= 3);

  const highlights = [];
  if (match.toss_winner && match.toss_decision) {
    highlights.push(
      `${match.toss_winner.name} won the toss and elected to ${String(match.toss_decision).toLowerCase()} first.`,
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

  return (
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
                {match.toss_winner
                  ? `${match.toss_winner.name} won the toss${
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
              subtitle={battingTeam?.name ? `Batted for ${battingTeam.name}` : null}
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
              subtitle={bowlingTeam?.name ? `Bowled for ${bowlingTeam.name}` : null}
              stats={[
                {
                  label: "Overs",
                  value: bestBowling.overs_str || round(bestBowling.overs, 1) || "-",
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
  );
}

// Derived from the scorecard's own batsman cards (same rules as before) — only
// used by the fallback view.
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

function milestoneFor(runs) {
  if (runs == null) return null;
  if (runs >= 100) return "Century";
  if (runs >= 50) return "Half-century";
  return null;
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
  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryIsError,
  } = useMatchSummary(matchId);
  const { data: analytics } = useMatchAnalytics(matchId);

  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [lastSummaryId, setLastSummaryId] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Reset the switcher to its default (winner / first team) whenever we start
  // looking at a different match.
  if (summary && lastSummaryId !== summary.match_id) {
    setLastSummaryId(summary.match_id);
    setSelectedTeamId(null);
    setActiveTab("overview");
  }

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

  const status = getMatchStatus(match);
  const resultLine = match.result || scorecard?.match_result || null;

  if (summaryLoading) {
    return <LoadingState label="Preparing match summary…" />;
  }

  // The summary endpoint has nothing for matches with no innings (404 -> null)
  // or on an unexpected failure; fall back to the scorecard view so the page
  // keeps working exactly as before in those cases.
  if (!summary || summaryIsError) {
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
        <ScorecardFallbackView
          match={match}
          teamA={teamA}
          teamB={teamB}
          scorecard={scorecard}
          status={status}
          resultLine={resultLine}
        />
      </>
    );
  }

  const summaryTeams = (summary.teams ?? [])
    .map((team) => resolveSummaryTeam(team, teams))
    .filter(Boolean);

  const inningsFor = (teamId) =>
    (summary.innings ?? []).filter(
      (inn) => String(inn.team?.id) === String(teamId),
    );

  const effectiveSelectedId =
    selectedTeamId ??
    summary.winner?.id ??
    summaryTeams[0]?.id ??
    teamA?.id ??
    null;

  const selectedTeam =
    summaryTeams.find((t) => String(t.id) === String(effectiveSelectedId)) ??
    summaryTeams[0] ??
    null;

  const toss = summary.toss ?? null;

  // Full innings models for BOTH sides, rebuilt from the delivery log so every
  // scorecard/statistics tab works regardless of which innings the scorecard
  // endpoint happens to be reporting.
  const inningsModels = buildInningsModels(analytics, scorecard);
  const hasScorecard = inningsModels.length > 0;
  const hasAnalytics = Array.isArray(analytics?.innings) && analytics.innings.length > 0;

  const tabs = [{ id: "overview", label: "Overview", icon: LayoutDashboard }];
  if (hasScorecard) {
    tabs.push({ id: "scorecard", label: "Scorecard", icon: ClipboardList });
  }
  if (hasAnalytics) {
    tabs.push({ id: "statistics", label: "Statistics", icon: BarChart3 });
  }
  if (hasScorecard) {
    tabs.push({ id: "players", label: "Players", icon: Users });
  }
  if (summaryTeams.length >= 2) {
    tabs.push({ id: "teams", label: "Teams", icon: ShieldCheck });
  }
  if (teamA && teamB) {
    tabs.push({ id: "h2h", label: "Head-to-head", icon: Swords });
  }

  const safeActiveTab = tabs.some((tab) => tab.id === activeTab)
    ? activeTab
    : "overview";

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
        <Tabs
          tabs={tabs}
          activeId={safeActiveTab}
          onChange={setActiveTab}
          label="Match summary sections"
        />

        <TabPanel id="overview" activeId={safeActiveTab}>
          <div className="space-y-6">
            <SectionCard icon={BarChart3} title="Match Summary">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  {summaryTeams.map((team) => {
                    const innings = inningsFor(team.id);
                    const isWinner =
                      summary.winner?.id != null &&
                      String(summary.winner.id) === String(team.id);
                    return (
                      <div
                        key={team.id}
                        className={cn(
                          "flex items-center justify-between gap-4 rounded-card border p-4",
                          isWinner
                            ? "border-brand-200 bg-brand-50"
                            : "border-line bg-surface-muted/40",
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <TeamBadge
                            name={team.name}
                            shortName={team.short_name}
                            src={teamLogo(team)}
                            size="md"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-ink">
                              {team.name}
                            </p>
                            <p className="truncate text-xs text-ink-subtle">
                              {innings.length > 0
                                ? innings
                                    .map((inn) =>
                                      `${formatRuns(inn.total, inn.wickets)} (${formatOvers(inn.overs_bowled_str, inn.overs_bowled)})`,
                                    )
                                    .join(", ")
                                : isWinner
                                  ? "Winner"
                                  : "Awaiting scorecard data"}
                            </p>
                          </div>
                        </div>
                        {isWinner && (
                          <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-brand-700">
                            <Trophy className="size-3.5" aria-hidden="true" />
                            Won
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
                      {summary.result_text || summary.margin || "Not recorded"}
                    </dd>
                  </div>
                  <div className="rounded-card border border-line p-4">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
                      Toss
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-ink">
                      {toss
                        ? `${toss.winner?.name ?? "A side"} won the toss${
                            toss.decision
                              ? ` and chose to ${String(toss.decision).toLowerCase()}`
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
                      {summary.venue || match.venue || "Not recorded"}
                    </dd>
                  </div>
                  <div className="rounded-card border border-line p-4">
                    <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
                      <CalendarDays className="size-3.5" aria-hidden="true" />
                      Date
                    </dt>
                    <dd className="mt-1 truncate text-sm font-semibold text-ink">
                      {[summary.match_date || match.match_date, summary.match_time || match.match_time]
                        .filter(Boolean)
                        .join(" · ") || "Not recorded"}
                    </dd>
                  </div>
                </dl>
              </div>
            </SectionCard>

            {summary.result_text && (
              <Card className="flex items-center gap-4 border-brand-200 bg-brand-50 p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-card bg-surface text-brand-700">
                  <Trophy className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-brand-700">
                    Final result
                  </p>
                  <p className="mt-0.5 text-base font-bold text-brand-900">
                    {summary.result_text}
                  </p>
                </div>
              </Card>
            )}

            {summary.player_of_match && (
              <Card className="flex items-center gap-4 border-warning-line bg-warning-bg p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-card bg-surface text-warning">
                  <Award className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-warning">
                    Player of the match
                  </p>
                  <p className="mt-0.5 text-base font-bold text-ink">
                    {fullName(
                      summary.player_of_match.first_name,
                      summary.player_of_match.last_name,
                    ) || `Player #${summary.player_of_match.player_id}`}
                  </p>
                  {summary.player_of_match.team_name && (
                    <p className="mt-0.5 text-[13px] text-ink-muted">
                      {summary.player_of_match.team_name}
                    </p>
                  )}
                </div>
              </Card>
            )}

            {summaryTeams.length >= 2 && (
              <SectionCard icon={Users} title="Team Summary">
                <TeamSwitcher
                  teams={summaryTeams}
                  selectedId={selectedTeam?.id}
                  onSelect={setSelectedTeamId}
                />
                <div className="mt-5">
                  <TeamSummaryPanel
                    team={selectedTeam}
                    summary={summary}
                    teams={teams ?? []}
                  />
                </div>
              </SectionCard>
            )}

            {Array.isArray(summary.highlights) && summary.highlights.length > 0 && (
              <SectionCard icon={Award} title="Match Highlights">
                <ul className="space-y-2.5">
                  {summary.highlights.map((item, index) => (
                    <li
                      key={`${item.type}-${index}`}
                      className="flex gap-2.5 text-sm text-ink-muted"
                    >
                      <span
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500"
                        aria-hidden="true"
                      />
                      <span className="min-w-0">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}
          </div>
        </TabPanel>

        <TabPanel id="scorecard" activeId={safeActiveTab}>
          <ScorecardPanel
            teams={summaryTeams}
            inningsModels={inningsModels}
            selectedTeamId={selectedTeam?.id}
            onSelectTeam={setSelectedTeamId}
          />
        </TabPanel>

        <TabPanel id="statistics" activeId={safeActiveTab}>
          <StatisticsPanel
            teams={summaryTeams}
            inningsModels={inningsModels}
            selectedTeamId={selectedTeam?.id}
            onSelectTeam={setSelectedTeamId}
          />
        </TabPanel>

        <TabPanel id="players" activeId={safeActiveTab}>
          <PlayersPanel
            teams={summaryTeams}
            inningsModels={inningsModels}
            summary={summary}
          />
        </TabPanel>

        <TabPanel id="teams" activeId={safeActiveTab}>
          <TeamAnalyticsPanel
            teams={summaryTeams}
            selectedTeamId={selectedTeam?.id}
            onSelectTeam={setSelectedTeamId}
          />
        </TabPanel>

        <TabPanel id="h2h" activeId={safeActiveTab}>
          <HeadToHeadPanel teamA={teamA} teamB={teamB} />
        </TabPanel>
      </div>
    </>
  );
}
