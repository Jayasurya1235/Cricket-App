import { useState } from "react";
import { Activity, Hand, Trophy } from "lucide-react";
import {
  useBattingLeaderboards,
  useBowlingLeaderboards,
  useFieldingLeaderboards,
} from "../hooks/useLeaderboards";
import { extractErrorMessage } from "../api/client";
import { fullName } from "../utils/analytics";
import { AnalyticsSection } from "../components/analytics";
import { HorizontalBarList } from "../components/charts";
import {
  ErrorState,
  LoadingState,
  PageHeader,
  Select,
  TabPanel,
  Tabs,
} from "../components/ui";

function entryItem(entry, sublabel) {
  return {
    key: entry.player_id,
    label: fullName(entry),
    value: entry.value,
    sublabel: typeof sublabel === "function" ? sublabel(entry) : sublabel,
    href: `/players/${entry.player_id}`,
  };
}

function BoardSection({ icon, title, description, entries, sublabel, formatValue, barTone }) {
  return (
    <AnalyticsSection icon={icon} title={title} description={description}>
      <HorizontalBarList
        items={(entries ?? []).map((entry) => entryItem(entry, sublabel))}
        rank
        barTone={barTone}
        formatValue={formatValue}
        emptyLabel="No qualifying records yet."
      />
    </AnalyticsSection>
  );
}

function BattingBoards({ options }) {
  const { data, isLoading, isError, error, refetch } = useBattingLeaderboards(options);

  if (isLoading) return <LoadingState compact label="Loading batting leaderboards…" />;
  if (isError) {
    return (
      <ErrorState
        title="Couldn't load batting leaderboards"
        message={extractErrorMessage(error)}
        onRetry={() => refetch()}
      />
    );
  }

  const boards = [
    {
      key: "most_runs",
      title: "Most runs",
      entries: data?.most_runs,
      sublabel: (e) =>
        `${e.team_name || "—"} · HS ${e.highest_score_display ?? e.highest_score} · SR ${e.strike_rate}`,
    },
    {
      key: "highest_strike_rate",
      title: "Highest strike rate",
      entries: data?.highest_strike_rate,
      sublabel: (e) => `${e.team_name || "—"} · ${e.runs} runs off ${e.balls_faced} balls`,
      formatValue: (v) => `${v}%`,
    },
    {
      key: "best_batting_average",
      title: "Best batting average",
      entries: data?.best_batting_average,
      sublabel: (e) => `${e.team_name || "—"} · ${e.runs} runs in ${e.innings} inns`,
    },
    {
      key: "most_fours",
      title: "Most fours",
      entries: data?.most_fours,
      sublabel: (e) => `${e.team_name || "—"} · ${e.runs} runs`,
    },
    {
      key: "most_sixes",
      title: "Most sixes",
      entries: data?.most_sixes,
      sublabel: (e) => `${e.team_name || "—"} · ${e.runs} runs`,
    },
    {
      key: "highest_score",
      title: "Highest score",
      entries: data?.highest_score,
      sublabel: (e) => `${e.team_name || "—"} · SR ${e.strike_rate}`,
    },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {boards.map((board) => (
        <BoardSection
          key={board.key}
          icon={Trophy}
          title={board.title}
          description={
            data?.matches_considered != null
              ? `Across ${data.matches_considered} matches`
              : undefined
          }
          entries={board.entries}
          sublabel={board.sublabel}
          formatValue={board.formatValue}
        />
      ))}
    </div>
  );
}

function BowlingBoards({ options }) {
  const { data, isLoading, isError, error, refetch } = useBowlingLeaderboards(options);

  if (isLoading) return <LoadingState compact label="Loading bowling leaderboards…" />;
  if (isError) {
    return (
      <ErrorState
        title="Couldn't load bowling leaderboards"
        message={extractErrorMessage(error)}
        onRetry={() => refetch()}
      />
    );
  }

  const boards = [
    {
      key: "most_wickets",
      title: "Most wickets",
      entries: data?.most_wickets,
      sublabel: (e) =>
        `${e.team_name || "—"} · econ ${e.economy} · best ${e.best_figures_display}`,
      barTone: "danger",
    },
    {
      key: "best_economy",
      title: "Best economy",
      entries: data?.best_economy,
      sublabel: (e) =>
        `${e.team_name || "—"} · ${e.wickets} wkts in ${e.overs_str ?? e.overs} ov`,
      barTone: "success",
    },
    {
      key: "best_bowling_figures",
      title: "Best figures (per innings)",
      entries: data?.best_bowling_figures,
      sublabel: (e) => `${e.team_name || "—"} · econ ${e.economy}`,
      barTone: "brand",
    },
    {
      key: "most_dot_balls",
      title: "Most dot balls",
      entries: data?.most_dot_balls,
      sublabel: (e) => `${e.team_name || "—"} · ${e.overs_str ?? e.overs} ov`,
      barTone: "info",
    },
    {
      key: "most_maidens",
      title: "Most maidens",
      entries: data?.most_maidens,
      sublabel: (e) => `${e.team_name || "—"} · ${e.wickets} wkts`,
      barTone: "warning",
    },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {boards.map((board) => (
        <BoardSection
          key={board.key}
          icon={Trophy}
          title={board.title}
          description={
            data?.matches_considered != null
              ? `Across ${data.matches_considered} matches`
              : undefined
          }
          entries={board.entries}
          sublabel={board.sublabel}
          formatValue={board.formatValue}
          barTone={board.barTone}
        />
      ))}
    </div>
  );
}

function FieldingBoards({ options }) {
  const { data, isLoading, isError, error, refetch } = useFieldingLeaderboards(options);

  if (isLoading) return <LoadingState compact label="Loading fielding leaderboards…" />;
  if (isError) {
    return (
      <ErrorState
        title="Couldn't load fielding leaderboards"
        message={extractErrorMessage(error)}
        onRetry={() => refetch()}
      />
    );
  }

  const boards = [
    {
      key: "most_catches",
      title: "Most catches",
      entries: data?.most_catches,
      sublabel: (e) => `${e.team_name || "—"} · ${e.total_dismissals} dismissals`,
    },
    {
      key: "most_run_outs",
      title: "Most run-outs",
      entries: data?.most_run_outs,
      sublabel: (e) => `${e.team_name || "—"} · ${e.total_dismissals} dismissals`,
      barTone: "warning",
    },
    {
      key: "most_stumpings",
      title: "Most stumpings",
      entries: data?.most_stumpings,
      sublabel: (e) => `${e.team_name || "—"} · ${e.total_dismissals} dismissals`,
      barTone: "info",
    },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {boards.map((board) => (
        <BoardSection
          key={board.key}
          icon={Trophy}
          title={board.title}
          description={
            data?.matches_considered != null
              ? `Across ${data.matches_considered} matches`
              : undefined
          }
          entries={board.entries}
          sublabel={board.sublabel}
          barTone={board.barTone}
        />
      ))}
    </div>
  );
}

export default function LeaderboardsPage() {
  const [tab, setTab] = useState("batting");
  const [top, setTop] = useState("10");

  const options = { top: Number(top) };

  const tabs = [
    { id: "batting", label: "Batting", icon: Trophy },
    { id: "bowling", label: "Bowling", icon: Activity },
    { id: "fielding", label: "Fielding", icon: Hand },
  ];

  return (
    <>
      <PageHeader
        title="Leaderboards"
        description="Top performers across the whole competition — batting, bowling and fielding."
        actions={
          <div className="w-40">
            <Select
              value={top}
              onChange={(event) => setTop(event.target.value)}
              aria-label="Number of players"
            >
              <option value="5">Top 5</option>
              <option value="10">Top 10</option>
              <option value="20">Top 20</option>
              <option value="50">Top 50</option>
            </Select>
          </div>
        }
      />

      <div className="mb-6">
        <Tabs tabs={tabs} activeId={tab} onChange={setTab} label="Leaderboard categories" />
      </div>

      <TabPanel id="batting" activeId={tab}>
        <BattingBoards options={options} />
      </TabPanel>
      <TabPanel id="bowling" activeId={tab}>
        <BowlingBoards options={options} />
      </TabPanel>
      <TabPanel id="fielding" activeId={tab}>
        <FieldingBoards options={options} />
      </TabPanel>
    </>
  );
}
