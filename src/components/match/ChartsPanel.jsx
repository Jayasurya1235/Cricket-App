import { useState } from "react";
import { Link } from "react-router-dom";
import { Activity, BarChart3, Crosshair, PieChart, Target, TrendingUp } from "lucide-react";
import {
  useBowlerEconomy,
  useInningsProgression,
  usePlayerRuns,
  usePlayerStrikeRate,
  useRunsByOver,
  useRunDistribution,
  useWicketsByBowler,
} from "../../hooks/useMatchVisualizations";
import { extractErrorMessage } from "../../api/client";
import { formatOvers, formatStat, fullName } from "../../utils/analytics";
import { AnalyticsSection, StatGrid, StatTile } from "../analytics";
import { BarChart, DonutChart, HorizontalBarList, LineChart } from "../charts";
import { Field, LoadingState, Select } from "../ui";

function pickInnings(response, inningsNumber) {
  const innings = response?.innings;
  if (!Array.isArray(innings)) return null;
  return (
    innings.find((i) => Number(i.innings_number) === Number(inningsNumber)) ??
    innings[0] ??
    null
  );
}

function buildDistributionSegments(distribution) {
  if (!distribution) return [];
  return [
    { key: "dots", label: "Dot balls", value: distribution.dot_balls },
    { key: "ones", label: "Singles", value: distribution.ones },
    { key: "twos", label: "Twos", value: distribution.twos },
    { key: "threes", label: "Threes", value: distribution.threes },
    { key: "fours", label: "Fours", value: distribution.fours },
    { key: "sixes", label: "Sixes", value: distribution.sixes },
    { key: "other", label: "Other", value: distribution.other },
  ];
}

export default function ChartsPanel({ matchId, teams, inningsModels }) {
  const battingInnings = (inningsModels ?? []).filter(
    (innings) => innings?.innings_number != null,
  );

  const teamLabel = (teamId) => {
    const team = (teams ?? []).find((t) => String(t.id) === String(teamId));
    return team?.short_name || team?.name || (teamId != null ? `Team ${teamId}` : "");
  };

  const [inningsNumber, setInningsNumber] = useState(
    () => battingInnings[0]?.innings_number ?? null,
  );
  const effectiveInnings = battingInnings.some(
    (i) => Number(i.innings_number) === Number(inningsNumber),
  )
    ? inningsNumber
    : (battingInnings[0]?.innings_number ?? null);

  const runsByOver = useRunsByOver(matchId, effectiveInnings);
  const progression = useInningsProgression(matchId, effectiveInnings);
  const playerRuns = usePlayerRuns(matchId, effectiveInnings);
  const playerStrikeRate = usePlayerStrikeRate(matchId, effectiveInnings);
  const bowlerEconomy = useBowlerEconomy(matchId, effectiveInnings);
  const wicketsByBowler = useWicketsByBowler(matchId, effectiveInnings);
  const runDistribution = useRunDistribution(matchId, effectiveInnings);

  if (battingInnings.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-line-strong bg-surface-muted/40 px-4 py-8 text-center text-[13px] text-ink-subtle">
        Charts appear once the innings have been scored.
      </p>
    );
  }

  const oversInnings = pickInnings(runsByOver.data, effectiveInnings);
  const overPoints = oversInnings?.overs ?? [];
  const overBars = overPoints.map((over) => ({
    key: over.over_number,
    label: over.over_number,
    value: over.runs,
    marker: over.wickets > 0 ? `${over.wickets}w` : null,
    tone: over.wickets > 0 ? "danger" : "brand",
    title: `Over ${over.over_number}: ${over.runs} runs, ${over.wickets} wkts`,
  }));

  const progressionInnings = pickInnings(progression.data, effectiveInnings);

  const distributionSegments = buildDistributionSegments(
    pickInnings(runDistribution.data, effectiveInnings)?.distribution,
  );

  const runBars = [...(playerRuns.data?.players ?? [])]
    .sort((a, b) => (b.runs ?? 0) - (a.runs ?? 0))
    .slice(0, 10)
    .map((player) => ({
      key: player.player_id,
      label: fullName(player),
      value: player.runs,
      sublabel: `${player.balls_faced} balls · SR ${formatStat(player.strike_rate)}`,
      href: `/players/${player.player_id}`,
    }));

  const strikeRateItems = [...(playerStrikeRate.data?.players ?? [])]
    .sort((a, b) => (b.strike_rate ?? 0) - (a.strike_rate ?? 0))
    .slice(0, 10)
    .map((player) => ({
      key: player.player_id,
      label: fullName(player),
      value: Number(player.strike_rate) || 0,
      sublabel: `${player.runs} runs (${player.balls_faced}b)`,
      href: `/players/${player.player_id}`,
    }));

  const economyItems = [...(bowlerEconomy.data?.bowlers ?? [])]
    .sort((a, b) => (a.economy ?? 0) - (b.economy ?? 0))
    .slice(0, 10)
    .map((bowler) => ({
      key: bowler.player_id,
      label: fullName(bowler),
      value: Number(bowler.economy) || 0,
      sublabel: `${formatOvers(bowler.overs_str, bowler.overs)} · ${bowler.wickets} wkts`,
      href: `/players/${bowler.player_id}`,
    }));

  const wicketItems = [...(wicketsByBowler.data?.bowlers ?? [])]
    .filter((bowler) => (bowler.wickets ?? 0) > 0)
    .sort((a, b) => (b.wickets ?? 0) - (a.wickets ?? 0))
    .map((bowler) => ({
      key: bowler.player_id,
      label: fullName(bowler),
      value: bowler.wickets,
      sublabel: `${formatOvers(bowler.overs_str, bowler.overs)} · econ ${formatStat(bowler.economy)}`,
      href: `/players/${bowler.player_id}`,
    }));

  const anyError =
    runsByOver.isError ||
    progression.isError ||
    playerRuns.isError ||
    playerStrikeRate.isError ||
    bowlerEconomy.isError ||
    wicketsByBowler.isError ||
    runDistribution.isError;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="w-full max-w-xs">
          <Field label="Innings">
            <Select
              value={effectiveInnings ?? ""}
              onChange={(event) =>
                setInningsNumber(Number(event.target.value))
              }
            >
              {battingInnings.map((innings) => (
                <option key={innings.innings_number} value={innings.innings_number}>
                  Innings {innings.innings_number}
                  {innings.is_super_over ? " (Super Over)" : ""} ·{" "}
                  {teamLabel(innings.batting_team_id)}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        {oversInnings?.total != null && (
          <StatGrid columns={3} className="w-full max-w-md">
            <StatTile
              label="Score"
              value={`${oversInnings.total}/${oversInnings.wickets ?? 0}`}
              tone="brand"
            />
            <StatTile
              label="Overs"
              value={formatStat(oversInnings.overs_bowled_str)}
            />
            <StatTile
              label="Target"
              value={oversInnings.target != null ? formatStat(oversInnings.target) : "—"}
            />
          </StatGrid>
        )}
      </div>

      {anyError && (
        <p className="rounded-card border border-danger-line bg-danger-bg px-4 py-3 text-[13px] text-danger">
          {extractErrorMessage(
            runsByOver.error ||
              progression.error ||
              playerRuns.error ||
              playerStrikeRate.error ||
              bowlerEconomy.error ||
              wicketsByBowler.error ||
              runDistribution.error,
          )}
        </p>
      )}

      <AnalyticsSection
        icon={BarChart3}
        title="Runs by over"
        description="Runs scored in each over; red bars mark overs that took wickets."
      >
        <BarChart
          data={overBars}
          ariaLabel="Runs scored per over"
          emptyLabel="No over-by-over data for this innings."
          formatValue={(value) => String(value)}
          height={150}
        />
      </AnalyticsSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsSection
          icon={TrendingUp}
          title="Innings progression"
          description="Cumulative runs as the innings unfolds."
        >
          <LineChart
            key={`prog-${effectiveInnings}`}
            labels={(progressionInnings?.progression ?? []).map((point) => point.over_number)}
            series={[
              {
                key: "runs",
                label: "Cumulative runs",
                values: (progressionInnings?.progression ?? []).map(
                  (point) => point.cumulative_runs,
                ),
              },
            ]}
            ariaLabel="Cumulative runs by over"
            emptyLabel="No progression data for this innings."
          />
        </AnalyticsSection>

        <AnalyticsSection
          icon={Activity}
          title="Run rate"
          description="Run rate per over, with the required rate to chase when set."
        >
          <LineChart
            key={`rr-${effectiveInnings}`}
            labels={(progressionInnings?.progression ?? []).map((point) => point.over_number)}
            formatY={(value) => String(value)}
            series={[
              {
                key: "rr",
                label: "Run rate",
                values: (progressionInnings?.progression ?? []).map(
                  (point) => Number(point.run_rate) || 0,
                ),
              },
              {
                key: "rrr",
                label: "Required rate",
                color: "var(--color-warning)",
                values: (progressionInnings?.progression ?? []).map((point) =>
                  point.required_run_rate != null ? Number(point.required_run_rate) : 0,
                ),
              },
            ]}
            ariaLabel="Run rate by over"
            emptyLabel="No run-rate data for this innings."
          />
        </AnalyticsSection>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsSection
          icon={BarChart3}
          title="Top run scorers"
          description="Runs scored in this innings."
        >
          {playerRuns.isLoading ? (
            <LoadingState compact label="Loading batting chart…" />
          ) : (
            <HorizontalBarList
              items={runBars}
              emptyLabel="No batting data for this innings."
            />
          )}
        </AnalyticsSection>

        <AnalyticsSection
          icon={Crosshair}
          title="Strike rates"
          description="How quickly each batter scored."
        >
          {playerStrikeRate.isLoading ? (
            <LoadingState compact label="Loading strike rates…" />
          ) : (
            <HorizontalBarList
              items={strikeRateItems}
              barTone="info"
              formatValue={(value) => Number(value).toFixed(1)}
              emptyLabel="No strike-rate data for this innings."
            />
          )}
        </AnalyticsSection>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsSection
          icon={Target}
          title="Bowling economy"
          description="Fewer runs per over is better."
        >
          {bowlerEconomy.isLoading ? (
            <LoadingState compact label="Loading economy…" />
          ) : (
            <HorizontalBarList
              items={economyItems}
              barTone="warning"
              formatValue={(value) => Number(value).toFixed(2)}
              emptyLabel="No bowling data for this innings."
            />
          )}
        </AnalyticsSection>

        <AnalyticsSection
          icon={Target}
          title="Wickets by bowler"
          description="Wickets taken in this innings."
        >
          {wicketsByBowler.isLoading ? (
            <LoadingState compact label="Loading wickets…" />
          ) : (
            <HorizontalBarList
              items={wicketItems}
              barTone="success"
              emptyLabel="No wickets fell in this innings."
            />
          )}
        </AnalyticsSection>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsSection
          icon={PieChart}
          title="Run distribution"
          description="How the runs came — boundaries versus running."
        >
          <DonutChart
            segments={distributionSegments}
            centerLabel="Total"
            centerValue={oversInnings?.total ?? undefined}
            emptyLabel="No delivery data for this innings."
          />
        </AnalyticsSection>

        <AnalyticsSection
          icon={PieChart}
          title="Extras breakdown"
          description="Runs gifted by the bowling side."
        >
          {(() => {
            const extras = pickInnings(runDistribution.data, effectiveInnings)?.extras_breakdown;
            if (!extras) {
              return (
                <p className="rounded-card border border-dashed border-line-strong bg-surface-muted/40 px-4 py-6 text-center text-[13px] text-ink-subtle">
                  No extras recorded for this innings.
                </p>
              );
            }
            return (
              <StatGrid columns={3}>
                <StatTile label="Wides" value={formatStat(extras.wides)} />
                <StatTile label="No balls" value={formatStat(extras.no_balls)} />
                <StatTile label="Byes" value={formatStat(extras.byes)} />
                <StatTile label="Leg byes" value={formatStat(extras.leg_byes)} />
                <StatTile label="Total extras" value={formatStat(extras.total)} tone="brand" />
              </StatGrid>
            );
          })()}
        </AnalyticsSection>
      </div>

      <p className="text-center text-[12px] text-ink-faint">
        Looking for individual partnerships?{" "}
        <Link to="../" className="font-semibold text-brand-700 hover:underline">
          See the Partnerships tab
        </Link>
        .
      </p>
    </div>
  );
}
