import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  History,
  Swords,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useTeam } from "../hooks/useTeam";
import { useTeams } from "../hooks/useTeams";
import { useTeamAnalytics } from "../hooks/useTeamAnalytics";
import { useHeadToHead } from "../hooks/useHeadToHead";
import { extractErrorMessage } from "../api/client";
import { formatOvers, formatStat, fullName } from "../utils/analytics";
import { teamLogo } from "../utils/teams";
import {
  AnalyticsSection,
  DataTable,
  FormLegend,
  FormPills,
  PercentBar,
  ResultBadge,
  StatGrid,
  StatTile,
} from "../components/analytics";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  PageHeader,
  Select,
  TeamBadge,
} from "../components/ui";

const TEAM_FORM_COLUMNS = [
  {
    key: "match_date",
    header: "Date",
    render: (row) => (
      <span className="whitespace-nowrap text-ink-muted">{row.match_date}</span>
    ),
  },
  { key: "match_type", header: "Type" },
  {
    key: "opponent_name",
    header: "Opponent",
    render: (row) => row.opponent_name || "—",
  },
  {
    key: "result",
    header: "Result",
    render: (row) => <ResultBadge code={row.result_code} text={row.result} />,
  },
  {
    key: "team_score",
    header: "Team",
    align: "right",
    render: (row) => formatStat(row.team_score),
  },
  {
    key: "opponent_score",
    header: "Opp",
    align: "right",
    render: (row) => formatStat(row.opponent_score),
  },
  {
    key: "margin",
    header: "Margin",
    render: (row) => row.margin || "—",
  },
];

function PerformerCard({ icon: Icon, title, name, subtitle, stats, message }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-ink-subtle">
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        {title}
      </div>

      {message ? (
        <p className="mt-3 text-[13px] text-ink-subtle">{message}</p>
      ) : (
        <div className="mt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold text-ink">{name}</p>
              {subtitle && (
                <p className="mt-0.5 truncate text-[13px] text-ink-subtle">
                  {subtitle}
                </p>
              )}
            </div>
            <dl className="flex shrink-0 flex-wrap justify-start gap-x-4 gap-y-1 sm:justify-end">
              {stats.map((stat) => (
                <div key={stat.label} className="min-w-0 text-left sm:text-right">
                  <dd className="text-base font-bold tabular-nums text-ink">
                    {stat.value}
                  </dd>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function TeamAnalyticsPage() {
  const { teamId } = useParams();
  const teamQuery = useTeam(teamId);
  const analyticsQuery = useTeamAnalytics(teamId);
  const { data: teams } = useTeams();
  const [chosenOpponentId, setChosenOpponentId] = useState("");

  const opponents = useMemo(
    () => (teams ?? []).filter((team) => String(team.id) !== String(teamId)),
    [teams, teamId],
  );
  const selectedOpponentId = chosenOpponentId || opponents[0]?.id || "";
  const opponent = (teams ?? []).find(
    (team) => String(team.id) === String(selectedOpponentId),
  );

  const h2hQuery = useHeadToHead(teamId, selectedOpponentId);
  const h2h = h2hQuery.data;

  if (teamQuery.isLoading || analyticsQuery.isLoading) {
    return <LoadingState label="Loading team analytics…" />;
  }

  if (analyticsQuery.isError) {
    return (
      <ErrorState
        title="Couldn't load team analytics"
        message={extractErrorMessage(analyticsQuery.error)}
        onRetry={() => analyticsQuery.refetch()}
      />
    );
  }

  const analytics = analyticsQuery.data;
  if (!analytics) {
    return (
      <EmptyState
        icon={<BarChart3 className="size-6" aria-hidden="true" />}
        title="Team analytics not available"
        description="This team may have been removed, or the link is incorrect."
        action={
          <Button as={Link} to={`/teams/${teamId}`} variant="secondary">
            Back to team
          </Button>
        }
      />
    );
  }

  const teamName = analytics.team_name || teamQuery.data?.name || "Team";
  const logo = teamLogo(teamQuery.data);

  const runScorer = analytics.top_run_scorer;
  const wicketTaker = analytics.top_wicket_taker;

  const h2hColumns = h2h
    ? {
        results: [
          {
            key: "match_date",
            header: "Date",
            render: (row) => (
              <span className="whitespace-nowrap text-ink-muted">
                {row.match_date}
              </span>
            ),
          },
          { key: "match_type", header: "Type" },
          {
            key: "venue",
            header: "Venue",
            render: (row) => row.venue || "—",
          },
          {
            key: "team_score",
            header: analytics.team_short_name || "Team",
            align: "right",
            render: (row) => (
              <span
                className={
                  row.winner_team_id != null &&
                  String(row.winner_team_id) === String(h2h.team_id)
                    ? "font-bold text-brand-700"
                    : ""
                }
              >
                {formatStat(row.team_score)}
              </span>
            ),
          },
          {
            key: "opponent_score",
            header: analytics.opponent_short_name || "Opp",
            align: "right",
            render: (row) => (
              <span
                className={
                  row.winner_team_id != null &&
                  String(row.winner_team_id) === String(h2h.opponent_id)
                    ? "font-bold text-brand-700"
                    : ""
                }
              >
                {formatStat(row.opponent_score)}
              </span>
            ),
          },
          {
            key: "result",
            header: "Result",
            render: (row) => <ResultBadge code={row.result_code} text={row.margin} />,
          },
          {
            key: "player_of_match_name",
            header: "Player of match",
            render: (row) => row.player_of_match_name || "—",
          },
        ],
        batting: [
          {
            key: "player",
            header: "Batsman",
            render: (row) => (
              <div className="min-w-0">
                <p className="font-semibold text-ink">
                  {fullName(row) || `Player #${row.player_id}`}
                </p>
                {row.player_code && (
                  <p className="text-[11px] text-ink-faint">#{row.player_code}</p>
                )}
              </div>
            ),
          },
          {
            key: "side",
            header: "Team",
            render: (row) =>
              String(h2h.team_id) === String(row.team_id)
                ? h2h.team_short_name
                : h2h.opponent_short_name,
          },
          { key: "runs", header: "Runs", align: "right" },
          {
            key: "balls_faced",
            header: "Balls",
            align: "right",
          },
          { key: "fours", header: "4s", align: "right" },
          { key: "sixes", header: "6s", align: "right" },
          {
            key: "strike_rate",
            header: "SR",
            align: "right",
            render: (row) => formatStat(row.strike_rate),
          },
        ],
        bowling: [
          {
            key: "player",
            header: "Bowler",
            render: (row) => (
              <div className="min-w-0">
                <p className="font-semibold text-ink">
                  {fullName(row) || `Player #${row.player_id}`}
                </p>
                {row.player_code && (
                  <p className="text-[11px] text-ink-faint">#{row.player_code}</p>
                )}
              </div>
            ),
          },
          {
            key: "side",
            header: "Team",
            render: (row) =>
              String(h2h.team_id) === String(row.team_id)
                ? h2h.team_short_name
                : h2h.opponent_short_name,
          },
          {
            key: "overs_str",
            header: "Overs",
            align: "right",
            render: (row) => formatOvers(row.overs_str, row.overs),
          },
          { key: "maidens", header: "M", align: "right" },
          { key: "runs_conceded", header: "Runs", align: "right" },
          { key: "wickets", header: "Wkts", align: "right" },
          {
            key: "economy",
            header: "Econ",
            align: "right",
            render: (row) => formatStat(row.economy),
          },
        ],
      }
    : null;

  let h2hBody;
  if (opponents.length === 0) {
    h2hBody = (
      <p className="rounded-card border border-dashed border-line-strong bg-surface-muted/40 px-4 py-8 text-center text-[13px] text-ink-subtle">
        No other teams to compare against yet. Register another team to see
        head-to-head analytics.
      </p>
    );
  } else if (h2hQuery.isLoading) {
    h2hBody = <LoadingState compact label="Loading head-to-head…" />;
  } else if (h2hQuery.isError) {
    h2hBody = (
      <ErrorState
        title="Couldn't load head-to-head"
        message={extractErrorMessage(h2hQuery.error)}
        onRetry={() => h2hQuery.refetch()}
      />
    );
  } else if (!h2h) {
    h2hBody = (
      <p className="rounded-card border border-dashed border-line-strong bg-surface-muted/40 px-4 py-8 text-center text-[13px] text-ink-subtle">
        No head-to-head data for this pairing yet.
      </p>
    );
  } else {
    h2hBody = (
      <div className="space-y-6">
        <StatGrid columns={4}>
          <StatTile label="Matches played" value={h2h.matches_played} />
          <StatTile
            label="Wins"
            value={h2h.team_wins}
            tone="success"
            hint={h2h.team_short_name}
          />
          <StatTile
            label="Losses"
            value={h2h.opponent_wins}
            tone="danger"
            hint={h2h.opponent_short_name}
          />
          <StatTile label="Draws" value={h2h.draws ?? 0} />
        </StatGrid>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-card border border-line bg-surface-muted/40 p-4">
            <PercentBar
              label={`${h2h.team_short_name} win percentage`}
              value={h2h.team_win_percentage}
            />
          </div>
          <dl className="grid grid-cols-2 gap-3">
            <StatTile
              label={`${h2h.team_short_name} best`}
              value={formatStat(h2h.team_highest_score)}
            />
            <StatTile
              label={`${h2h.team_short_name} worst`}
              value={formatStat(h2h.team_lowest_score)}
            />
            <StatTile
              label={`${h2h.opponent_short_name} best`}
              value={formatStat(h2h.opponent_highest_score)}
            />
            <StatTile
              label={`${h2h.opponent_short_name} worst`}
              value={formatStat(h2h.opponent_lowest_score)}
            />
          </dl>
        </div>

        <div>
          <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-ink-subtle">
            Recent results
          </h3>
          <DataTable
            caption="Recent head-to-head results"
            columns={h2hColumns.results}
            rows={h2h.recent_results ?? []}
            getRowKey={(row) => row.match_id}
            empty="No recorded meetings between these sides."
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div>
            <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-ink-subtle">
              Top batting performances
            </h3>
            <DataTable
              caption="Best batting innings of the rivalry"
              columns={h2hColumns.batting}
              rows={h2h.top_batting ?? []}
              getRowKey={(row) =>
                `${row.player_id}-${row.match_id}-${row.runs}`
              }
              empty="No batting performances recorded."
            />
          </div>
          <div>
            <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-ink-subtle">
              Top bowling performances
            </h3>
            <DataTable
              caption="Best bowling spells of the rivalry"
              columns={h2hColumns.bowling}
              rows={h2h.top_bowling ?? []}
              getRowKey={(row) =>
                `${row.player_id}-${row.match_id}-${row.wickets}`
              }
              empty="No bowling performances recorded."
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Teams", to: "/teams" },
          { label: teamName, to: `/teams/${teamId}` },
          { label: "Analytics" },
        ]}
        title={`${teamName} Analytics`}
        description="Record across completed matches owned by this account."
        meta={
          <div className="flex items-center gap-2">
            <TeamBadge
              name={teamName}
              shortName={analytics.short_name}
              src={logo}
              size="sm"
            />
            <FormPills
              formString={analytics.recent_form_string}
              items={analytics.recent_form}
            />
          </div>
        }
        actions={
          <Button as={Link} to={`/teams/${teamId}`} variant="secondary">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to team
          </Button>
        }
      />

      <div className="space-y-6">
        {analytics.matches_played === 0 && (
          <Card className="flex flex-col items-center gap-2 p-8 text-center">
            <BarChart3
              className="size-8 text-ink-faint"
              aria-hidden="true"
            />
            <p className="text-[15px] font-semibold text-ink">
              No completed matches yet
            </p>
            <p className="max-w-sm text-[13px] text-ink-subtle">
              Once matches finish, this page fills in with the record, recent
              form and leading performers.
            </p>
          </Card>
        )}

        <AnalyticsSection
          icon={BarChart3}
          title="Match record"
          description="Played, won, lost and drawn, plus win percentage."
        >
          <StatGrid columns={4}>
            <StatTile label="Matches played" value={analytics.matches_played} />
            <StatTile label="Wins" value={analytics.wins} tone="success" />
            <StatTile label="Losses" value={analytics.losses} tone="danger" />
            <StatTile label="Draws" value={analytics.draws ?? 0} />
          </StatGrid>
          <div className="mt-4 max-w-sm">
            <PercentBar
              label="Win percentage"
              value={analytics.win_percentage}
            />
          </div>
        </AnalyticsSection>

        <AnalyticsSection
          icon={TrendingUp}
          title="Scoring"
          description="Every run the side has put on the board, and conceded."
        >
          <StatGrid columns={3}>
            <StatTile
              label="Runs scored"
              value={formatStat(analytics.runs_scored)}
              tone="brand"
            />
            <StatTile
              label="Runs conceded"
              value={formatStat(analytics.runs_conceded)}
            />
            <StatTile
              label="Highest score"
              value={formatStat(analytics.highest_score)}
            />
            <StatTile
              label="Lowest score"
              value={formatStat(analytics.lowest_score)}
            />
            <StatTile
              label="Average score"
              value={formatStat(analytics.average_score)}
            />
            <StatTile
              label="Average run rate"
              value={formatStat(analytics.average_run_rate, 2)}
            />
          </StatGrid>
        </AnalyticsSection>

        {(analytics.recent_form?.length > 0 ||
          analytics.recent_form_string) && (
          <AnalyticsSection
            icon={History}
            title="Recent form"
            description="Most recent first, with the scores from each game."
            action={<FormLegend />}
          >
            <DataTable
              caption="Recent team results"
              columns={TEAM_FORM_COLUMNS}
              rows={analytics.recent_form ?? []}
              getRowKey={(row) => row.match_id}
              empty="No recent results recorded."
            />
          </AnalyticsSection>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <PerformerCard
            icon={Trophy}
            title="Leading run scorer"
            name={runScorer ? fullName(runScorer) : null}
            subtitle={
              runScorer
                ? `${runScorer.innings} innings · ${
                    runScorer.player_code
                      ? `#${runScorer.player_code}`
                      : `Player #${runScorer.player_id}`
                  }`
                : null
            }
            stats={
              runScorer
                ? [
                    { label: "Runs", value: formatStat(runScorer.runs) },
                    { label: "Balls", value: formatStat(runScorer.balls_faced) },
                    { label: "4s", value: formatStat(runScorer.fours) },
                    { label: "6s", value: formatStat(runScorer.sixes) },
                    { label: "HS", value: formatStat(runScorer.highest_score) },
                    {
                      label: "SR",
                      value: formatStat(runScorer.strike_rate),
                    },
                  ]
                : []
            }
            message={
              runScorer ? null : "No batting leader yet."
            }
          />
          <PerformerCard
            icon={Target}
            title="Leading wicket taker"
            name={wicketTaker ? fullName(wicketTaker) : null}
            subtitle={
              wicketTaker
                ? `${wicketTaker.innings} innings · ${
                    wicketTaker.player_code
                      ? `#${wicketTaker.player_code}`
                      : `Player #${wicketTaker.player_id}`
                  }`
                : null
            }
            stats={
              wicketTaker
                ? [
                    { label: "Wkts", value: formatStat(wicketTaker.wickets) },
                    {
                      label: "Overs",
                      value: formatOvers(
                        wicketTaker.overs_str,
                        wicketTaker.overs,
                      ),
                    },
                    {
                      label: "Runs",
                      value: formatStat(wicketTaker.runs_conceded),
                    },
                    {
                      label: "Econ",
                      value: formatStat(wicketTaker.economy),
                    },
                    {
                      label: "Best",
                      value: formatStat(wicketTaker.best_display),
                    },
                  ]
                : []
            }
            message={
              wicketTaker ? null : "No bowling leader yet."
            }
          />
        </div>

        <AnalyticsSection
          icon={Swords}
          title="Head-to-head"
          description={
            opponent
              ? `Rivalry between ${analytics.team_name} and ${opponent.name}`
              : "Compare this team against another side"
          }
        >
          {opponents.length > 0 && (
            <div className="mb-5 max-w-xs">
              <Field label="Opponent">
                <Select
                  value={selectedOpponentId}
                  onChange={(event) => setChosenOpponentId(event.target.value)}
                >
                  {opponents.map((opp) => (
                    <option key={opp.id} value={opp.id}>
                      {opp.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          )}
          {h2hBody}
        </AnalyticsSection>
      </div>
    </>
  );
}