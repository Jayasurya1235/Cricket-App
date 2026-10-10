import { Swords } from "lucide-react";
import { useHeadToHead } from "../../hooks/useHeadToHead";
import { extractErrorMessage } from "../../api/client";
import { formatOvers, formatStat, fullName } from "../../utils/analytics";
import {
  AnalyticsSection,
  DataTable,
  PercentBar,
  ResultBadge,
  StatGrid,
  StatTile,
} from "../analytics";
import { ErrorState, LoadingState } from "../ui";

function resultsColumns(h2h) {
  return [
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
      header: h2h.team_short_name || "Team",
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
      header: h2h.opponent_short_name || "Opp",
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
  ];
}

function sideName(h2h, teamId) {
  return String(h2h.team_id) === String(teamId)
    ? h2h.team_short_name
    : h2h.opponent_short_name;
}

function battingColumns(h2h) {
  return [
    {
      key: "player",
      header: "Batter",
      render: (row) => (
        <span className="font-semibold text-ink">
          {fullName(row) || `Player #${row.player_id}`}
        </span>
      ),
    },
    {
      key: "side",
      header: "Team",
      render: (row) => sideName(h2h, row.team_id),
    },
    { key: "runs", header: "Runs", align: "right" },
    { key: "balls_faced", header: "Balls", align: "right" },
    { key: "fours", header: "4s", align: "right" },
    { key: "sixes", header: "6s", align: "right" },
    {
      key: "strike_rate",
      header: "SR",
      align: "right",
      render: (row) => formatStat(row.strike_rate),
    },
  ];
}

function bowlingColumns(h2h) {
  return [
    {
      key: "player",
      header: "Bowler",
      render: (row) => (
        <span className="font-semibold text-ink">
          {fullName(row) || `Player #${row.player_id}`}
        </span>
      ),
    },
    {
      key: "side",
      header: "Team",
      render: (row) => sideName(h2h, row.team_id),
    },
    {
      key: "overs",
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
  ];
}

export default function HeadToHeadPanel({ teamA, teamB }) {
  const query = useHeadToHead(teamA?.id, teamB?.id);
  const h2h = query.data;

  if (!teamA || !teamB) {
    return (
      <p className="rounded-card border border-dashed border-line-strong bg-surface-muted/40 px-4 py-8 text-center text-[13px] text-ink-subtle">
        Head-to-head needs two teams.
      </p>
    );
  }

  return (
    <AnalyticsSection
      icon={Swords}
      title="Head-to-head"
      description={`Rivalry between ${teamA.name} and ${teamB.name}.`}
    >
      {query.isLoading ? (
        <LoadingState compact label="Loading head-to-head…" />
      ) : query.isError ? (
        <ErrorState
          title="Couldn't load head-to-head"
          message={extractErrorMessage(query.error)}
          onRetry={() => query.refetch()}
        />
      ) : !h2h ? (
        <p className="rounded-card border border-dashed border-line-strong bg-surface-muted/40 px-4 py-8 text-center text-[13px] text-ink-subtle">
          No head-to-head data for this pairing yet.
        </p>
      ) : (
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
              columns={resultsColumns(h2h)}
              rows={h2h.recent_results ?? []}
              getRowKey={(row) => row.match_id}
              empty="No recorded meetings between these sides."
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div>
              <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-ink-subtle">
                Top batting
              </h3>
              <DataTable
                caption="Best batting innings of the rivalry"
                columns={battingColumns(h2h)}
                rows={h2h.top_batting ?? []}
                getRowKey={(row) => `${row.player_id}-${row.match_id}-${row.runs}`}
                empty="No batting performances recorded."
              />
            </div>
            <div>
              <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-ink-subtle">
                Top bowling
              </h3>
              <DataTable
                caption="Best bowling spells of the rivalry"
                columns={bowlingColumns(h2h)}
                rows={h2h.top_bowling ?? []}
                getRowKey={(row) =>
                  `${row.player_id}-${row.match_id}-${row.wickets}`
                }
                empty="No bowling performances recorded."
              />
            </div>
          </div>
        </div>
      )}
    </AnalyticsSection>
  );
}
