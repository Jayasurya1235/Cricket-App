import { useState } from "react";
import { Activity, BarChart3 } from "lucide-react";
import { usePlayerCareerStats } from "../../hooks/usePlayerCareerStats";
import { extractErrorMessage } from "../../api/client";
import { formatStat } from "../../utils/analytics";
import { AnalyticsSection, DataTable } from "../analytics";
import { LoadingState, TabPanel, Tabs } from "../ui";

function splitColumns(labelColumn) {
  return [
    { key: "label", header: labelColumn.header, render: labelColumn.render },
    { key: "matches_played", header: "Mat", align: "right" },
    { key: "innings_played", header: "Inns", align: "right" },
    {
      key: "runs",
      header: "Runs",
      align: "right",
      render: (row) => formatStat(row.batting?.runs),
    },
    {
      key: "highest",
      header: "HS",
      align: "right",
      render: (row) => formatStat(row.batting?.highest_score_display),
    },
    {
      key: "average",
      header: "Avg",
      align: "right",
      render: (row) => formatStat(row.batting?.average),
    },
    {
      key: "strike_rate",
      header: "SR",
      align: "right",
      render: (row) => formatStat(row.batting?.strike_rate),
    },
    {
      key: "wickets",
      header: "Wkts",
      align: "right",
      render: (row) => formatStat(row.bowling?.wickets),
    },
    {
      key: "economy",
      header: "Econ",
      align: "right",
      render: (row) => formatStat(row.bowling?.economy),
    },
    {
      key: "best",
      header: "Best",
      align: "right",
      render: (row) => formatStat(row.bowling?.best_display),
    },
  ];
}

const RECENT_FORM_COLUMNS = [
  {
    key: "match_date",
    header: "Date",
    render: (row) => (
      <span className="whitespace-nowrap text-ink-muted">{row.match_date}</span>
    ),
  },
  { key: "match_type", header: "Type" },
  {
    key: "batting",
    header: "Batting",
    render: (row) =>
      row.batting?.did_bat
        ? `${row.batting.runs} (${row.batting.balls_faced}b)`
        : "did not bat",
  },
  {
    key: "bowling",
    header: "Bowling",
    render: (row) =>
      row.bowling?.bowled
        ? `${row.bowling.overs_str ?? row.bowling.balls_bowled} · ${row.bowling.wickets}/${row.bowling.runs_conceded}`
        : "—",
  },
  {
    key: "fielding",
    header: "Fielding",
    render: (row) => {
      const fielding = row.fielding ?? {};
      return `C ${fielding.catches ?? 0} · RO ${fielding.run_outs ?? 0} · St ${fielding.stumpings ?? 0}`;
    },
  },
];

export default function PlayerCareerBreakdown({ playerId }) {
  const { data, isLoading, isError, error } = usePlayerCareerStats(playerId);
  const [split, setSplit] = useState("season");

  if (isLoading) {
    return <LoadingState compact label="Loading career breakdown…" />;
  }

  if (isError) {
    return (
      <p className="rounded-card border border-danger-line bg-danger-bg px-4 py-3 text-[13px] text-danger">
        {extractErrorMessage(error)}
      </p>
    );
  }

  if (!data) return null;

  const tabs = [
    { id: "season", label: "Season" },
    { id: "competition", label: "Competition" },
    { id: "tournament", label: "Tournament" },
    { id: "team", label: "Team" },
  ];

  const splitDefs = {
    season: {
      rows: data.by_season ?? [],
      columns: splitColumns({
        key: "season",
        header: "Season",
        render: (row) => <span className="font-semibold text-ink">{row.season}</span>,
      }),
      empty: "No season splits yet.",
    },
    competition: {
      rows: data.by_competition ?? [],
      columns: splitColumns({
        key: "level_name",
        header: "Competition",
        render: (row) => (
          <span className="font-semibold text-ink">{row.level_name || `Level #${row.level_id}`}</span>
        ),
      }),
      empty: "No competition splits yet.",
    },
    tournament: {
      rows: data.by_tournament ?? [],
      columns: splitColumns({
        key: "tournament_name",
        header: "Tournament",
        render: (row) => (
          <span className="font-semibold text-ink">{row.tournament_name || "—"}</span>
        ),
      }),
      empty: "No tournament splits yet.",
    },
    team: {
      rows: data.by_team ?? [],
      columns: splitColumns({
        key: "team_name",
        header: "Team",
        render: (row) => (
          <span className="font-semibold text-ink">{row.team_name || "Unattached"}</span>
        ),
      }),
      empty: "No team splits yet.",
    },
  };

  return (
    <div className="space-y-6">
      <AnalyticsSection
        icon={BarChart3}
        title="Career breakdown"
        description={`Splits across ${data.scope || "all completed matches"}.`}
      >
        <Tabs tabs={tabs} activeId={split} onChange={setSplit} label="Career splits" />
        <div className="mt-5">
          {(["season", "competition", "tournament", "team"]).map((key) => (
            <TabPanel key={key} id={key} activeId={split}>
              <DataTable
                caption={`Career by ${key}`}
                columns={splitDefs[key].columns}
                rows={splitDefs[key].rows}
                getRowKey={(row, index) => `${key}-${index}`}
                empty={splitDefs[key].empty}
              />
            </TabPanel>
          ))}
        </div>
      </AnalyticsSection>

      <AnalyticsSection
        icon={Activity}
        title="Recent form"
        description="The latest innings and spells, most recent first."
      >
        <DataTable
          caption="Recent player form"
          columns={RECENT_FORM_COLUMNS}
          rows={data.recent_form ?? []}
          getRowKey={(row) => `${row.match_id}-${row.innings_number}`}
          empty="No recent innings recorded."
        />
      </AnalyticsSection>
    </div>
  );
}
