import { StatGrid, StatTile } from "./StatGrid";
import { formatStat } from "../../utils/analytics";

// Renders a PlayerBattingStats (PlayerPerformanceResponse / PlayerStatsBlock /
// PlayerCompetitionStats all share this shape).
export function BattingStatsBlock({ stats }) {
  if (!stats) return null;
  return (
    <StatGrid columns={4}>
      <StatTile label="Innings" value={formatStat(stats.innings)} />
      <StatTile label="Runs" value={formatStat(stats.runs)} tone="brand" />
      <StatTile label="Average" value={formatStat(stats.average)} />
      <StatTile label="Strike rate" value={formatStat(stats.strike_rate)} />
      <StatTile
        label="Highest"
        value={formatStat(stats.highest_score_display)}
      />
      <StatTile label="Balls faced" value={formatStat(stats.balls_faced)} />
      <StatTile label="Fours" value={formatStat(stats.fours)} />
      <StatTile label="Sixes" value={formatStat(stats.sixes)} />
      <StatTile label="Fifties" value={formatStat(stats.fifties)} />
      <StatTile label="Hundreds" value={formatStat(stats.hundreds)} />
      <StatTile label="Not outs" value={formatStat(stats.not_outs)} />
      <StatTile label="Dot balls" value={formatStat(stats.dot_balls)} />
    </StatGrid>
  );
}

// Renders a PlayerBowlingStats.
export function BowlingStatsBlock({ stats }) {
  if (!stats) return null;
  return (
    <StatGrid columns={4}>
      <StatTile label="Innings" value={formatStat(stats.innings)} />
      <StatTile label="Wickets" value={formatStat(stats.wickets)} tone="brand" />
      <StatTile label="Overs" value={formatStat(stats.overs_str)} />
      <StatTile label="Economy" value={formatStat(stats.economy)} />
      <StatTile label="Average" value={formatStat(stats.average)} />
      <StatTile label="Strike rate" value={formatStat(stats.strike_rate)} />
      <StatTile label="Best" value={formatStat(stats.best_display)} />
      <StatTile label="Maidens" value={formatStat(stats.maidens)} />
      <StatTile
        label="Runs conceded"
        value={formatStat(stats.runs_conceded)}
      />
      <StatTile label="Dot balls" value={formatStat(stats.dot_balls)} />
      <StatTile label="Wides" value={formatStat(stats.wides)} />
      <StatTile label="No balls" value={formatStat(stats.no_balls)} />
    </StatGrid>
  );
}

// Renders a PlayerFieldingStats. The delivery log never records the fielder, so
// the backend reports these as unavailable with a note — surface that rather
// than inventing figures.
export function FieldingStatsBlock({ stats }) {
  if (!stats) return null;

  if (!stats.available) {
    return (
      <p className="rounded-card border border-dashed border-line-strong bg-surface-muted/40 px-4 py-6 text-center text-[13px] text-ink-subtle">
        {stats.note ||
          "Fielding figures aren't available — dismissals don't record the fielder."}
      </p>
    );
  }

  return (
    <StatGrid columns={3}>
      <StatTile label="Catches" value={formatStat(stats.catches)} tone="brand" />
      <StatTile label="Run outs" value={formatStat(stats.run_outs)} />
      <StatTile label="Stumpings" value={formatStat(stats.stumpings)} />
    </StatGrid>
  );
}
