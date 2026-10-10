import { Link } from "react-router-dom";
import { BarChart3, History, Target, TrendingUp, Trophy } from "lucide-react";
import { useTeamAnalytics } from "../../hooks/useTeamAnalytics";
import { extractErrorMessage } from "../../api/client";
import { formatOvers, formatStat, fullName } from "../../utils/analytics";
import {
  AnalyticsSection,
  DataTable,
  FormLegend,
  FormPills,
  PercentBar,
  ResultBadge,
  StatGrid,
  StatTile,
} from "../analytics";
import { Button, ErrorState, LoadingState } from "../ui";
import { TeamSwitcher } from "./TeamSwitcher";

const FORM_COLUMNS = [
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
];

function PerformerCard({ icon: Icon, title, performer, kind }) {
  const name = performer ? fullName(performer) : null;
  const stats = performer
    ? kind === "bat"
      ? [
          { label: "Runs", value: formatStat(performer.runs) },
          { label: "HS", value: formatStat(performer.highest_score) },
          { label: "SR", value: formatStat(performer.strike_rate) },
        ]
      : [
          { label: "Wkts", value: formatStat(performer.wickets) },
          {
            label: "Overs",
            value: formatOvers(performer.overs_str, performer.overs),
          },
          { label: "Econ", value: formatStat(performer.economy) },
        ]
    : [];

  return (
    <div className="rounded-card border border-line bg-surface-muted/40 p-4">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-ink-subtle">
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        {title}
      </div>
      {name ? (
        <>
          <p className="mt-2 truncate text-[15px] font-bold text-ink">{name}</p>
          <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dd className="text-sm font-bold tabular-nums text-ink">
                  {stat.value}
                </dd>
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </>
      ) : (
        <p className="mt-2 text-[13px] text-ink-subtle">No leader yet.</p>
      )}
    </div>
  );
}

export default function TeamAnalyticsPanel({
  teams,
  selectedTeamId,
  onSelectTeam,
}) {
  const team = (teams ?? []).find(
    (t) => String(t.id) === String(selectedTeamId),
  );
  const query = useTeamAnalytics(team?.id);
  const analytics = query.data;

  return (
    <div className="space-y-6">
      <TeamSwitcher
        teams={teams}
        selectedId={team?.id}
        onSelect={onSelectTeam}
      />

      {query.isLoading ? (
        <LoadingState compact label="Loading team analytics…" />
      ) : query.isError ? (
        <ErrorState
          title="Couldn't load team analytics"
          message={extractErrorMessage(query.error)}
          onRetry={() => query.refetch()}
        />
      ) : !analytics ? (
        <p className="rounded-card border border-dashed border-line-strong bg-surface-muted/40 px-4 py-8 text-center text-[13px] text-ink-subtle">
          No team analytics available yet.
        </p>
      ) : (
        <>
          <AnalyticsSection
            icon={BarChart3}
            title={`${analytics.team_name || team?.name || "Team"} · record`}
            description="Played, won, lost and drawn, plus win percentage."
            action={
              team ? (
                <Button
                  as={Link}
                  to={`/teams/${team.id}/analytics`}
                  variant="ghost"
                  size="sm"
                >
                  Full analytics
                </Button>
              ) : null
            }
          >
            <div className="mb-4">
              <FormPills
                formString={analytics.recent_form_string}
                items={analytics.recent_form}
              />
            </div>
            <StatGrid columns={4}>
              <StatTile label="Played" value={analytics.matches_played} />
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
            description="Runs scored and conceded across completed matches."
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

          <div className="grid gap-4 sm:grid-cols-2">
            <PerformerCard
              icon={Trophy}
              title="Leading run scorer"
              performer={analytics.top_run_scorer}
              kind="bat"
            />
            <PerformerCard
              icon={Target}
              title="Leading wicket taker"
              performer={analytics.top_wicket_taker}
              kind="bowl"
            />
          </div>

          {analytics.recent_form?.length > 0 && (
            <AnalyticsSection
              icon={History}
              title="Recent form"
              description="Most recent first, with the scores from each game."
              action={<FormLegend />}
            >
              <DataTable
                caption="Recent team results"
                columns={FORM_COLUMNS}
                rows={analytics.recent_form}
                getRowKey={(row) => row.match_id}
                empty="No recent results recorded."
              />
            </AnalyticsSection>
          )}
        </>
      )}
    </div>
  );
}
