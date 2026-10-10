import { Link } from "react-router-dom";
import { Badge } from "../ui";
import { AnalyticsSection, DataTable, StatGrid, StatTile } from "../analytics";
import { formatStat } from "../../utils/analytics";
import { aggregatePlayerStats, oversFromBalls } from "../../utils/matchAnalytics";

function teamShort(teams, id) {
  const team = (teams ?? []).find((t) => String(t.id) === String(id));
  return team?.short_name || team?.name || "—";
}

function performerName(performer) {
  if (!performer) return null;
  if (typeof performer === "string") return performer;
  return (
    performer.player_name ||
    performer.name ||
    performer.full_name ||
    performer.player?.name ||
    null
  );
}

function TopPerformers({ summary }) {
  if (!summary) return null;
  const items = [
    { label: "Player of the match", value: performerName(summary.player_of_match), tone: "brand" },
    { label: "Top run scorer", value: performerName(summary.top_run_scorer), tone: "success" },
    { label: "Best bowler", value: performerName(summary.best_bowler), tone: "info" },
  ].filter((item) => item.value);

  if (items.length === 0) return null;

  return (
    <AnalyticsSection
      title="Key performers"
      description="Standout players from the match."
    >
      <StatGrid columns={3}>
        {items.map((item) => (
          <StatTile key={item.label} label={item.label} value={item.value} tone={item.tone} />
        ))}
      </StatGrid>
    </AnalyticsSection>
  );
}

export default function PlayersPanel({ teams, inningsModels, summary }) {
  const players = aggregatePlayerStats(inningsModels ?? []).sort((a, b) => {
    if (b.batting.runs !== a.batting.runs) return b.batting.runs - a.batting.runs;
    return b.bowling.wickets - a.bowling.wickets;
  });

  const columns = [
    {
      key: "name",
      header: "Player",
      className: "whitespace-normal",
      render: (row) => (
        <Link
          to={`/players/${row.player_id}`}
          className="font-semibold text-ink hover:text-brand-700 hover:underline"
        >
          {row.name || `Player #${row.player_id}`}
        </Link>
      ),
    },
    {
      key: "team",
      header: "Team",
      render: (row) => teamShort(teams, row.team_id),
    },
    {
      key: "batting",
      header: "Batting",
      align: "right",
      render: (row) =>
        row.has_batted
          ? `${row.batting.runs} (${row.batting.balls})`
          : "—",
    },
    {
      key: "sr",
      header: "SR",
      align: "right",
      render: (row) =>
        row.has_batted ? formatStat(row.batting.strike_rate) : "—",
    },
    {
      key: "boundaries",
      header: "4s/6s",
      align: "right",
      render: (row) =>
        row.has_batted ? `${row.batting.fours}/${row.batting.sixes}` : "—",
    },
    {
      key: "bowling",
      header: "Bowling",
      align: "right",
      render: (row) =>
        row.has_bowled
          ? `${row.bowling.wickets}/${row.bowling.runs}`
          : "—",
    },
    {
      key: "overs",
      header: "Overs",
      align: "right",
      render: (row) =>
        row.has_bowled
          ? row.bowling.overs_str || oversFromBalls(row.bowling.balls)
          : "—",
    },
    {
      key: "econ",
      header: "Econ",
      align: "right",
      render: (row) =>
        row.has_bowled ? formatStat(row.bowling.economy) : "—",
    },
  ];

  return (
    <div className="space-y-6">
      <TopPerformers summary={summary} />

      <AnalyticsSection
        title="Player figures"
        description="Every player's match totals. Select a player for their full profile."
        action={
          players.length > 0 ? (
            <Badge tone="neutral">{players.length} players</Badge>
          ) : null
        }
      >
        <DataTable
          caption="Player match figures"
          columns={columns}
          rows={players}
          getRowKey={(row) => row.player_id}
          empty="No player statistics recorded for this match yet."
        />
      </AnalyticsSection>
    </div>
  );
}
