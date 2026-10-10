import { cn } from "../../utils/cn";
import { AnalyticsSection, DataTable, StatGrid, StatTile } from "../analytics";
import { formatStat } from "../../utils/analytics";
import { TeamSwitcher } from "./TeamSwitcher";

function teamById(teams, id) {
  return (teams ?? []).find((team) => String(team.id) === String(id)) ?? null;
}

function ScoringPattern({ pattern }) {
  if (!pattern) {
    return (
      <p className="rounded-card border border-dashed border-line-strong bg-surface-muted/40 px-4 py-6 text-center text-[13px] text-ink-subtle">
        No scoring pattern recorded for this innings.
      </p>
    );
  }
  const boundaryShare =
    pattern.legal_balls > 0
      ? (Number(pattern.boundaries) / Number(pattern.legal_balls)) * 100
      : 0;
  const dotShare =
    pattern.legal_balls > 0
      ? (Number(pattern.dot_balls) / Number(pattern.legal_balls)) * 100
      : 0;
  return (
    <StatGrid columns={4}>
      <StatTile label="Runs off bat" value={pattern.runs_off_bat} />
      <StatTile label="Extras" value={pattern.extras} />
      <StatTile label="Boundaries" value={pattern.boundaries} hint={`${formatStat(boundaryShare)}% of balls`} />
      <StatTile label="Dot balls" value={pattern.dot_balls} hint={`${formatStat(dotShare)}% of balls`} />
      <StatTile label="Fours" value={pattern.fours} />
      <StatTile label="Sixes" value={pattern.sixes} />
      <StatTile label="Singles" value={pattern.singles} />
      <StatTile label="Doubles / triples" value={`${pattern.doubles ?? 0} / ${pattern.triples ?? 0}`} />
    </StatGrid>
  );
}

function ExtrasBreakdown({ extras }) {
  if (!extras) {
    return (
      <p className="rounded-card border border-dashed border-line-strong bg-surface-muted/40 px-4 py-6 text-center text-[13px] text-ink-subtle">
        No extras recorded for this innings.
      </p>
    );
  }
  return (
    <StatGrid columns={4}>
      <StatTile label="Wides" value={extras.wides ?? 0} />
      <StatTile label="No balls" value={extras.no_balls ?? 0} />
      <StatTile label="Byes" value={extras.byes ?? 0} />
      <StatTile label="Leg byes" value={extras.leg_byes ?? 0} />
      <StatTile label="Total extras" value={extras.total ?? 0} tone="brand" />
    </StatGrid>
  );
}

function OverByOver({ overs }) {
  if (!Array.isArray(overs) || overs.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-line-strong bg-surface-muted/40 px-4 py-6 text-center text-[13px] text-ink-subtle">
        No over-by-over data recorded for this innings.
      </p>
    );
  }
  const maxRuns = Math.max(6, ...overs.map((o) => Number(o.runs) || 0));
  return (
    <div className="space-y-4">
      <div className="flex h-28 items-end gap-1 overflow-x-auto pb-1">
        {overs.map((over) => {
          const runs = Number(over.runs) || 0;
          const height = Math.max(6, Math.round((runs / maxRuns) * 100));
          const hasWicket = Number(over.wickets) > 0;
          return (
            <div
              key={over.over_number}
              className="flex w-6 shrink-0 flex-col items-center justify-end gap-1"
              title={`Over ${over.over_number}: ${runs} runs, ${over.wickets ?? 0} wkts`}
            >
              <span className="text-[10px] font-semibold tabular-nums text-ink-subtle">
                {runs}
              </span>
              <div
                className={cn(
                  "w-full rounded-t-sm",
                  hasWicket ? "bg-danger" : "bg-brand-400",
                )}
                style={{ height: `${height}%` }}
              />
              <span className="text-[9px] tabular-nums text-ink-faint">
                {over.over_number}
              </span>
            </div>
          );
        })}
      </div>
      <DataTable
        caption="Over by over summary"
        getRowKey={(row) => row.over_number}
        rows={overs}
        columns={[
          { key: "over_number", header: "Over" },
          { key: "runs", header: "Runs", align: "right" },
          { key: "wickets", header: "Wkts", align: "right" },
          { key: "fours", header: "4s", align: "right" },
          { key: "sixes", header: "6s", align: "right" },
          { key: "dot_balls", header: "Dots", align: "right" },
          {
            key: "cumulative_runs",
            header: "Score",
            align: "right",
            render: (row) =>
              `${row.cumulative_runs ?? 0}/${row.cumulative_wickets ?? 0}`,
          },
          {
            key: "cumulative_run_rate",
            header: "RR",
            align: "right",
            render: (row) => formatStat(row.cumulative_run_rate),
          },
          {
            key: "bowler_name",
            header: "Bowler",
            render: (row) => row.bowler_name || "—",
          },
        ]}
      />
    </div>
  );
}

function RunRateProgression({ points }) {
  if (!Array.isArray(points) || points.length < 2) return null;
  const max = Math.max(...points.map((p) => Number(p.run_rate) || 0), 1);
  return (
    <div className="flex h-24 items-end gap-0.5 overflow-x-auto">
      {points.map((point) => {
        const rate = Number(point.run_rate) || 0;
        const height = Math.max(4, Math.round((rate / max) * 100));
        return (
          <div
            key={point.over_number}
            className="w-3 shrink-0 flex-1 rounded-t-sm bg-brand-200"
            style={{ height: `${height}%` }}
            title={`Over ${point.over_number}: RR ${formatStat(rate)}${
              point.required_run_rate != null
                ? ` · RRR ${formatStat(point.required_run_rate)}`
                : ""
            }`}
          />
        );
      })}
    </div>
  );
}

export default function StatisticsPanel({
  teams,
  inningsModels,
  selectedTeamId,
  onSelectTeam,
}) {
  const team = teamById(teams, selectedTeamId) ?? teams?.[0] ?? null;

  if (!team) {
    return (
      <p className="rounded-card border border-dashed border-line-strong bg-surface-muted/40 px-4 py-8 text-center text-[13px] text-ink-subtle">
        No statistics available for this match yet.
      </p>
    );
  }

  const battingInnings = (inningsModels ?? []).filter(
    (i) => String(i.batting_team_id) === String(team.id),
  );

  return (
    <div className="space-y-6">
      <TeamSwitcher teams={teams} selectedId={team.id} onSelect={onSelectTeam} />

      {battingInnings.length === 0 ? (
        <p className="rounded-card border border-dashed border-line-strong bg-surface-muted/40 px-4 py-8 text-center text-[13px] text-ink-subtle">
          {team.name} haven&apos;t batted in this match yet.
        </p>
      ) : (
        battingInnings.map((inning) => (
          <div key={`stats-${inning.innings_number}`} className="space-y-6">
            {battingInnings.length > 1 && (
              <h3 className="text-[13px] font-bold uppercase tracking-wide text-ink-subtle">
                Innings {inning.innings_number}
              </h3>
            )}
            <AnalyticsSection
              title={`${team.name} · Scoring pattern`}
              description="How the innings was built ball by ball."
            >
              <ScoringPattern pattern={inning.scoring_pattern} />
            </AnalyticsSection>

            <div className="grid gap-6 lg:grid-cols-2">
              <AnalyticsSection
                title="Extras breakdown"
                description="Runs gifted to the batting side."
              >
                <ExtrasBreakdown extras={inning.extras} />
              </AnalyticsSection>

              <AnalyticsSection
                title="Run rate progression"
                description="Over-by-over run rate."
              >
                {inning.run_rate_progression?.length ? (
                  <RunRateProgression points={inning.run_rate_progression} />
                ) : (
                  <p className="rounded-card border border-dashed border-line-strong bg-surface-muted/40 px-4 py-6 text-center text-[13px] text-ink-subtle">
                    No run-rate data recorded for this innings.
                  </p>
                )}
              </AnalyticsSection>
            </div>

            <AnalyticsSection
              title="Over by over"
              description="Runs, wickets and cumulative score after each over."
            >
              <OverByOver overs={inning.over_by_over} />
            </AnalyticsSection>
          </div>
        ))
      )}
    </div>
  );
}
