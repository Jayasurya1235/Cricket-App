import { cn } from "../../utils/cn";
import { Card } from "../ui";
import { formatStat } from "../../utils/analytics";
import { extrasTotal, oversFromBalls } from "../../utils/matchAnalytics";
import { TeamSwitcher } from "./TeamSwitcher";

function teamById(teams, id) {
  return (teams ?? []).find((team) => String(team.id) === String(id)) ?? null;
}

const HEAD =
  "px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-ink-faint whitespace-nowrap first:pl-0 last:pr-0";
const CELL =
  "px-3 py-2.5 text-[13px] text-ink-muted first:pl-0 last:pr-0 whitespace-nowrap";
const NUM = "text-right tabular-nums";

function ScoreTable({ caption, columns, children, empty }) {
  if (!children) {
    return (
      <p className="rounded-card border border-dashed border-line-strong bg-surface-muted/40 px-4 py-6 text-center text-[13px] text-ink-subtle">
        {empty}
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line">
            {columns.map((column) => (
              <th
                key={column.label}
                scope="col"
                className={cn(HEAD, column.numeric && "text-right")}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line/60">{children}</tbody>
      </table>
    </div>
  );
}

function InningsHeader({ inning, vsTeam }) {
  const extras = extrasTotal(inning.extras);
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 rounded-card border border-line bg-surface-muted/40 p-4">
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-ink-subtle">
          Innings {inning.innings_number}
          {inning.is_super_over ? " · Super Over" : ""}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-ink">
          {vsTeam ? `vs ${vsTeam.name}` : "Batting"}
        </p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-black tabular-nums text-ink">
          {formatStat(inning.total)}
          <span className="text-ink-faint">/{inning.wickets ?? 0}</span>
        </p>
        <p className="text-[12px] text-ink-subtle">
          {inning.overs_bowled_str || oversFromBalls(0)} overs · RR{" "}
          {formatStat(inning.run_rate)}
        </p>
        <p className="text-[11px] text-ink-faint">
          Extras {extras}
          {inning.target != null ? ` · Target ${inning.target}` : ""}
        </p>
      </div>
    </div>
  );
}

function BattingCard({ inning, vsTeam }) {
  const rows = (inning.batting || []).filter((b) => b.did_not_bat !== true || Number(b.runs) > 0);
  return (
    <div className="space-y-3">
      <InningsHeader inning={inning} vsTeam={vsTeam} />
      <ScoreTable
        caption={`Batting card for innings ${inning.innings_number}`}
        columns={[
          { label: "Batter" },
          { label: "R", numeric: true },
          { label: "B", numeric: true },
          { label: "4s", numeric: true },
          { label: "6s", numeric: true },
          { label: "SR", numeric: true },
        ]}
        empty="No batting recorded for this innings."
      >
        {rows.length > 0
          ? rows.map((b) => (
              <tr key={b.player_id} className="align-top">
                <td className={cn(CELL, "whitespace-normal")}>
                  <p className="font-semibold text-ink">
                    {b.name || `Player #${b.player_id}`}
                  </p>
                  <p className="text-[11px] text-ink-faint">
                    {b.did_not_bat
                      ? "did not bat"
                      : b.out
                        ? `out${b.dismissal ? ` (${String(b.dismissal).replace(/_/g, " ")})` : ""}`
                        : "not out"}
                  </p>
                </td>
                <td className={cn(CELL, NUM, "font-bold text-ink")}>{b.runs ?? 0}</td>
                <td className={cn(CELL, NUM)}>{b.balls_faced ?? 0}</td>
                <td className={cn(CELL, NUM)}>{b.fours ?? 0}</td>
                <td className={cn(CELL, NUM)}>{b.sixes ?? 0}</td>
                <td className={cn(CELL, NUM)}>{formatStat(b.strike_rate)}</td>
              </tr>
            ))
          : null}
      </ScoreTable>
      {Array.isArray(inning.fallOfWickets) && inning.fallOfWickets.length > 0 && (
        <p className="text-[12px] leading-relaxed text-ink-subtle">
          <span className="font-semibold text-ink-muted">Fall of wickets: </span>
          {inning.fallOfWickets
            .map(
              (f) =>
                `${f.score}-${f.wicket_number} (${
                  f.name || `Player #${f.player_id}`
                }, ${f.overs_str})`,
            )
            .join(", ")}
        </p>
      )}
    </div>
  );
}

function BowlingCard({ inning, battingTeam }) {
  const rows = inning.bowling || [];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-line bg-surface-muted/40 px-4 py-2.5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-ink-subtle">
          Bowling in innings {inning.innings_number}
        </p>
        <p className="text-[12px] text-ink-subtle">
          {battingTeam ? `${battingTeam.name} ` : ""}
          {formatStat(inning.total)}/{inning.wickets ?? 0} (
          {inning.overs_bowled_str || oversFromBalls(0)})
        </p>
      </div>
      <ScoreTable
        caption={`Bowling card for innings ${inning.innings_number}`}
        columns={[
          { label: "Bowler" },
          { label: "O", numeric: true },
          { label: "M", numeric: true },
          { label: "R", numeric: true },
          { label: "W", numeric: true },
          { label: "Econ", numeric: true },
        ]}
        empty="No bowling recorded for this innings."
      >
        {rows.length > 0
          ? rows.map((b) => (
              <tr key={b.player_id}>
                <td className={cn(CELL, "font-semibold text-ink")}>
                  {b.name || `Player #${b.player_id}`}
                </td>
                <td className={cn(CELL, NUM)}>
                  {b.overs_str || oversFromBalls(b.balls_bowled)}
                </td>
                <td className={cn(CELL, NUM)}>{b.maidens ?? 0}</td>
                <td className={cn(CELL, NUM)}>{b.runs_conceded ?? 0}</td>
                <td className={cn(CELL, NUM, "font-bold text-ink")}>
                  {b.wickets ?? 0}
                </td>
                <td className={cn(CELL, NUM)}>{formatStat(b.economy)}</td>
              </tr>
            ))
          : null}
      </ScoreTable>
    </div>
  );
}

export default function ScorecardPanel({
  teams,
  inningsModels,
  selectedTeamId,
  onSelectTeam,
}) {
  const team = teamById(teams, selectedTeamId) ?? teams?.[0] ?? null;

  if (!team) {
    return (
      <Card className="p-6 text-center text-[13px] text-ink-subtle">
        No team scorecard available for this match yet.
      </Card>
    );
  }

  const battingInnings = (inningsModels ?? []).filter(
    (i) => String(i.batting_team_id) === String(team.id),
  );
  const bowlingInnings = (inningsModels ?? []).filter(
    (i) => String(i.bowling_team_id) === String(team.id),
  );

  return (
    <div className="space-y-6">
      <TeamSwitcher
        teams={teams}
        selectedId={team.id}
        onSelect={onSelectTeam}
      />

      <Card className="space-y-6 p-5 sm:p-6">
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-ink-subtle">
            {team.name} · Batting
          </h3>
          {battingInnings.length > 0 ? (
            <div className="space-y-6">
              {battingInnings.map((inning) => (
                <BattingCard
                  key={`bat-${inning.innings_number}`}
                  inning={inning}
                  vsTeam={teamById(teams, inning.bowling_team_id)}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-card border border-dashed border-line-strong bg-surface-muted/40 px-4 py-6 text-center text-[13px] text-ink-subtle">
              {team.name} haven&apos;t batted in this match yet.
            </p>
          )}
        </section>

        <section className="border-t border-line pt-6">
          <h3 className="mb-3 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-ink-subtle">
            {team.name} · Bowling
          </h3>
          {bowlingInnings.length > 0 ? (
            <div className="space-y-6">
              {bowlingInnings.map((inning) => (
                <BowlingCard
                  key={`bowl-${inning.innings_number}`}
                  inning={inning}
                  battingTeam={teamById(teams, inning.batting_team_id)}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-card border border-dashed border-line-strong bg-surface-muted/40 px-4 py-6 text-center text-[13px] text-ink-subtle">
              {team.name} haven&apos;t bowled in this match yet.
            </p>
          )}
        </section>
      </Card>
    </div>
  );
}
