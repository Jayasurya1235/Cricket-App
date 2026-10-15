import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CalendarDays,
  ListOrdered,
  Pencil,
  Plus,
  ShieldCheck,
  Swords,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import { useTournament } from "../hooks/useTournament";
import { useTournamentTeams } from "../hooks/useTournamentTeams";
import { useTournamentFixtures } from "../hooks/useTournamentFixtures";
import { usePointsTable } from "../hooks/usePointsTable";
import { useTournamentLeaderboards } from "../hooks/useTournamentLeaderboards";
import { useTeams } from "../hooks/useTeams";
import { useMatches } from "../hooks/useMatches";
import {
  useAddTournamentTeam,
  useDeleteTournament,
  useDeleteFixture,
  useGenerateFixtures,
  useGenerateKnockout,
  useRemoveTournamentTeam,
  useSetFixtureResult,
} from "../hooks/useTournamentMutations";
import { extractErrorMessage } from "../api/client";
import { formatOvers, formatStat, fullName } from "../utils/analytics";
import {
  AnalyticsSection,
  DataTable,
  FormPills,
  StatGrid,
  StatTile,
} from "../components/analytics";
import { HorizontalBarList } from "../components/charts";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  PageHeader,
  Select,
  Switch,
  TabPanel,
  Tabs,
  TeamBadge,
  useConfirm,
} from "../components/ui";

const FORMAT_LABELS = {
  league: "League",
  knockout: "Knockout",
  league_knockout: "League + Knockout",
};

const STATUS_TONES = {
  upcoming: "info",
  ongoing: "warning",
  completed: "success",
  live: "live",
};

function matchLabel(match) {
  const a = match.team_a?.short_name || match.team_a?.name || "Team A";
  const b = match.team_b?.short_name || match.team_b?.name || "Team B";
  return `${a} vs ${b}${match.match_date ? ` · ${match.match_date}` : ""}`;
}

function TeamsPanel({ tournamentId }) {
  const { data: tournamentTeams, isLoading } = useTournamentTeams(tournamentId);
  const { data: allTeams } = useTeams();
  const addTeam = useAddTournamentTeam();
  const removeTeam = useRemoveTournamentTeam();
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [error, setError] = useState("");

  const registered = tournamentTeams ?? [];
  const registeredIds = new Set(registered.map((t) => String(t.team_id)));
  const available = (allTeams ?? []).filter(
    (team) => !registeredIds.has(String(team.id)),
  );

  async function handleAdd() {
    if (!selectedTeamId) return;
    setError("");
    try {
      await addTeam.mutateAsync({ tournamentId, teamId: selectedTeamId });
      setSelectedTeamId("");
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <AnalyticsSection
        icon={Users}
        title="Registered teams"
        description={`${registered.length} ${registered.length === 1 ? "team" : "teams"} competing.`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field label="Add a team">
              <Select
                value={selectedTeamId}
                onChange={(event) => setSelectedTeamId(event.target.value)}
                disabled={available.length === 0}
              >
                <option value="">
                  {available.length === 0
                    ? "All teams already registered"
                    : "Select a team"}
                </option>
                {available.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Button
            type="button"
            onClick={handleAdd}
            loading={addTeam.isPending}
            disabled={!selectedTeamId}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add team
          </Button>
        </div>

        {error && (
          <p className="mt-3 rounded-lg border border-danger-line bg-danger-bg px-3 py-2 text-[13px] text-danger">
            {error}
          </p>
        )}

        {isLoading ? (
          <LoadingState compact label="Loading teams…" />
        ) : registered.length === 0 ? (
          <p className="mt-4 rounded-card border border-dashed border-line-strong bg-surface-muted/40 px-4 py-8 text-center text-[13px] text-ink-subtle">
            No teams registered yet. Add at least two to generate fixtures.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {registered.map((team) => (
              <li
                key={team.id}
                className="flex items-center justify-between gap-3 rounded-card border border-line bg-surface-muted/40 p-3"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <TeamBadge
                    name={team.team_name}
                    shortName={team.team_short_name}
                    src={team.logo}
                    size="sm"
                  />
                  <span className="truncate text-[13px] font-semibold text-ink">
                    {team.team_name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    removeTeam.mutate({ tournamentId, teamId: team.team_id })
                  }
                  disabled={removeTeam.isPending}
                  aria-label={`Remove ${team.team_name}`}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-subtle transition hover:bg-danger-50 hover:text-danger disabled:opacity-50"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </AnalyticsSection>
    </div>
  );
}

function PointsTablePanel({ tournamentId }) {
  const { data, isLoading } = usePointsTable(tournamentId);

  const columns = [
    { key: "position", header: "#", className: "w-8 text-ink-faint" },
    {
      key: "team_name",
      header: "Team",
      render: (row) => (
        <span className="flex items-center gap-2">
          <TeamBadge
            name={row.team_name}
            shortName={row.team_short_name}
            src={row.logo}
            size="sm"
          />
          <span className="font-semibold text-ink">{row.team_name}</span>
        </span>
      ),
    },
    { key: "played", header: "P", align: "right" },
    { key: "won", header: "W", align: "right" },
    { key: "lost", header: "L", align: "right" },
    {
      key: "tied",
      header: "T",
      align: "right",
      render: (row) => row.tied ?? 0,
    },
    {
      key: "no_result",
      header: "NR",
      align: "right",
      render: (row) => row.no_result ?? 0,
    },
    {
      key: "points",
      header: "Pts",
      align: "right",
      render: (row) => <span className="font-bold text-ink">{row.points}</span>,
    },
    {
      key: "net_run_rate",
      header: "NRR",
      align: "right",
      render: (row) => formatStat(row.net_run_rate, 3),
    },
    {
      key: "form",
      header: "Form",
      render: (row) =>
        row.form ? (
          <FormPills formString={row.form} />
        ) : (
          <span className="text-ink-faint">—</span>
        ),
    },
  ];

  if (isLoading) {
    return <LoadingState compact label="Loading points table…" />;
  }

  return (
    <AnalyticsSection
      icon={ListOrdered}
      title="Points table"
      description={
        data
          ? `${data.tournament_name} · ${FORMAT_LABELS[data.format] ?? data.format}`
          : "Standings across completed fixtures."
      }
    >
      <DataTable
        caption="Tournament points table"
        columns={columns}
        rows={data?.table ?? []}
        getRowKey={(row) => row.team_id}
        empty="The points table appears once fixtures have been played."
      />
    </AnalyticsSection>
  );
}

function FixturesPanel({ tournamentId }) {
  const { data: fixtures, isLoading } = useTournamentFixtures(tournamentId);
  const { data: matches } = useMatches();
  const generate = useGenerateFixtures();
  const knockout = useGenerateKnockout();
  const setResult = useSetFixtureResult();
  const deleteFixture = useDeleteFixture();
  const confirm = useConfirm();

  const [legs, setLegs] = useState("1");
  const [replace, setReplace] = useState(false);
  const [koTeams, setKoTeams] = useState("4");
  const [error, setError] = useState("");

  const list = fixtures ?? [];

  async function handleGenerate() {
    setError("");
    try {
      await generate.mutateAsync({
        tournamentId,
        legs: Number(legs),
        replace,
      });
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  const columns = [
    {
      key: "teams",
      header: "Fixture",
      render: (row) => (
        <span className="font-semibold text-ink">
          {row.team_a_short_name || row.team_a_name} vs{" "}
          {row.team_b_short_name || row.team_b_name}
        </span>
      ),
    },
    {
      key: "stage",
      header: "Stage",
      render: (row) => (
        <span className="text-ink-subtle">
          {row.stage || (row.round_number != null ? `Round ${row.round_number}` : "—")}
        </span>
      ),
    },
    {
      key: "when",
      header: "When",
      render: (row) =>
        [row.scheduled_date, row.scheduled_time].filter(Boolean).join(" · ") || "—",
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge tone={STATUS_TONES[row.status] ?? "neutral"}>
          {row.status || "scheduled"}
        </Badge>
      ),
    },
    {
      key: "result",
      header: "Result / Match",
      render: (row) =>
        row.match_id ? (
          <Link
            to={`/matches/${row.match_id}`}
            className="font-semibold text-brand-700 hover:underline"
          >
            {row.result || `Match #${row.match_id}`}
          </Link>
        ) : (
          <div className="min-w-[180px]">
            <Select
              value=""
              onChange={(event) => {
                if (!event.target.value) return;
                setError("");
                setResult
                  .mutateAsync({
                    tournamentId,
                    fixtureId: row.id,
                    matchId: event.target.value,
                  })
                  .catch((err) => setError(extractErrorMessage(err)));
              }}
            >
              <option value="">Attach a match…</option>
              {(matches ?? []).map((match) => (
                <option key={match.id} value={match.id}>
                  {matchLabel(match)}
                </option>
              ))}
            </Select>
          </div>
        ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <button
          type="button"
          onClick={async () => {
            const ok = await confirm({
              title: "Delete this fixture?",
              description: "This cannot be undone.",
              confirmLabel: "Delete",
            });
            if (ok) deleteFixture.mutate({ tournamentId, fixtureId: row.id });
          }}
          aria-label="Delete fixture"
          className="flex size-8 items-center justify-center rounded-lg text-ink-subtle transition hover:bg-danger-50 hover:text-danger"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AnalyticsSection
        icon={CalendarDays}
        title="Generate fixtures"
        description="Auto-schedule a round-robin league or a seeded knockout."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3 rounded-card border border-line bg-surface-sunken p-4">
            <p className="text-[13px] font-semibold text-ink">Round-robin</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Legs">
                <Select value={legs} onChange={(e) => setLegs(e.target.value)}>
                  <option value="1">Single round</option>
                  <option value="2">Double (home & away)</option>
                </Select>
              </Field>
            </div>
            <Switch
              label="Replace existing fixtures"
              description="Clear the current schedule before generating."
              checked={replace}
              onChange={setReplace}
            />
            <Button
              type="button"
              onClick={handleGenerate}
              loading={generate.isPending}
              className="mt-1"
            >
              <Swords className="size-4" aria-hidden="true" />
              Generate round-robin
            </Button>
          </div>

          <div className="rounded-card border border-line bg-surface-sunken p-4">
            <Field label="Knockout size">
              <Select
                value={koTeams}
                onChange={(event) => setKoTeams(event.target.value)}
              >
                <option value="2">2 teams (final)</option>
                <option value="4">4 teams (semis)</option>
                <option value="8">8 teams (quarter-finals)</option>
              </Select>
            </Field>
            <Button
              type="button"
              className="mt-4"
              variant="secondary"
              onClick={async () => {
                const ok = await confirm({
                  title: "Generate knockout draw?",
                  description:
                    "This seeds the top teams into a knockout bracket.",
                  confirmLabel: "Generate",
                });
                if (!ok) return;
                setError("");
                try {
                  await knockout.mutateAsync({ tournamentId, teams: Number(koTeams) });
                } catch (err) {
                  setError(extractErrorMessage(err));
                }
              }}
              loading={knockout.isPending}
            >
              <Swords className="size-4" aria-hidden="true" />
              Generate knockout
            </Button>
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-lg border border-danger-line bg-danger-bg px-3 py-2 text-[13px] text-danger">
            {error}
          </p>
        )}
      </AnalyticsSection>

      <AnalyticsSection
        icon={CalendarDays}
        title="Fixture list"
        description={`${list.length} ${list.length === 1 ? "fixture" : "fixtures"} scheduled.`}
      >
        {isLoading ? (
          <LoadingState compact label="Loading fixtures…" />
        ) : (
          <DataTable
            caption="Tournament fixtures"
            columns={columns}
            rows={list}
            getRowKey={(row) => row.id}
            empty="No fixtures yet. Use the generators above to build the schedule."
          />
        )}
      </AnalyticsSection>
    </div>
  );
}

function LeaderboardsPanel({ tournamentId }) {
  const { data, isLoading } = useTournamentLeaderboards(tournamentId, 10);

  const runItems = (data?.top_run_scorers ?? []).map((player) => ({
    key: player.player_id,
    label: fullName(player),
    value: player.runs,
    sublabel: `${player.team_name || "—"} · HS ${player.highest_score} · SR ${formatStat(player.strike_rate)}`,
    href: `/players/${player.player_id}`,
  }));

  const wicketItems = (data?.top_wicket_takers ?? []).map((player) => ({
    key: player.player_id,
    label: fullName(player),
    value: player.wickets,
    sublabel: `${player.team_name || "—"} · ${formatOvers(player.overs_str, player.overs)} · econ ${formatStat(player.economy)}`,
    href: `/players/${player.player_id}`,
  }));

  if (isLoading) {
    return <LoadingState compact label="Loading leaderboards…" />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AnalyticsSection
        icon={Trophy}
        title="Top run scorers"
        description="Leading run makers in this tournament."
      >
        <HorizontalBarList
          items={runItems}
          rank
          emptyLabel="No batting records yet."
        />
      </AnalyticsSection>
      <AnalyticsSection
        icon={Swords}
        title="Top wicket takers"
        description="Leading wicket takers in this tournament."
      >
        <HorizontalBarList
          items={wicketItems}
          rank
          barTone="success"
          emptyLabel="No bowling records yet."
        />
      </AnalyticsSection>
    </div>
  );
}

export default function TournamentDetailPage() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const { data: tournament, isLoading, isError, error, refetch } =
    useTournament(tournamentId);
  const deleteTournament = useDeleteTournament();
  const confirm = useConfirm();
  const [tab, setTab] = useState("overview");

  if (isLoading) {
    return <LoadingState label="Loading tournament…" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load tournament"
        message={extractErrorMessage(error)}
        onRetry={() => refetch()}
      />
    );
  }

  if (!tournament) {
    return (
      <EmptyState
        icon={<Trophy className="size-6" aria-hidden="true" />}
        title="Tournament not found"
        description="It may have been removed, or the link is incorrect."
        action={
          <Button as={Link} to="/tournaments" variant="secondary">
            Back to tournaments
          </Button>
        }
      />
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: ListOrdered },
    { id: "teams", label: "Teams", icon: Users },
    { id: "table", label: "Points Table", icon: Trophy },
    { id: "fixtures", label: "Fixtures", icon: CalendarDays },
    { id: "leaderboards", label: "Leaderboards", icon: ShieldCheck },
  ];

  async function handleDelete() {
    const ok = await confirm({
      title: `Delete ${tournament.name}?`,
      description:
        "This removes the tournament, its fixtures and points table. This cannot be undone.",
      confirmLabel: "Delete tournament",
    });
    if (!ok) return;
    try {
      await deleteTournament.mutateAsync(tournament.id);
      navigate("/tournaments");
    } catch {
      /* error surfaces via refetch on next load */
    }
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Tournaments", to: "/tournaments" },
          { label: tournament.name },
        ]}
        title={tournament.name}
        description={
          tournament.description ||
          "Tournament details, teams, points table and fixtures."
        }
        meta={
          <>
            <Badge tone={STATUS_TONES[tournament.status] ?? "neutral"}>
              {tournament.status}
            </Badge>
            <Badge tone="brand">
              {FORMAT_LABELS[tournament.format] ?? tournament.format}
            </Badge>
          </>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              as={Link}
              to={`/tournaments/${tournament.id}/edit`}
              variant="secondary"
            >
              <Pencil className="size-4" aria-hidden="true" />
              Edit
            </Button>
            <Button
              type="button"
              variant="dangerGhost"
              onClick={handleDelete}
              loading={deleteTournament.isPending}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="mb-6">
        <Tabs tabs={tabs} activeId={tab} onChange={setTab} label="Tournament sections" />
      </div>

      <TabPanel id="overview" activeId={tab}>
        <div className="space-y-6">
          <AnalyticsSection
            icon={Trophy}
            title="At a glance"
            description="Format, size and schedule."
          >
            <StatGrid columns={4}>
              <StatTile label="Teams" value={formatStat(tournament.team_count)} />
              <StatTile
                label="Fixtures"
                value={formatStat(tournament.fixture_count)}
              />
              <StatTile label="Format" value={FORMAT_LABELS[tournament.format] ?? tournament.format} />
              <StatTile label="Status" value={tournament.status} />
            </StatGrid>
          </AnalyticsSection>

          <AnalyticsSection
            icon={ShieldCheck}
            title="Points system"
            description="Awarded per fixture result."
          >
            <StatGrid columns={4}>
              <StatTile label="Win" value={formatStat(tournament.points_win)} tone="success" />
              <StatTile label="Tie" value={formatStat(tournament.points_tie)} tone="warning" />
              <StatTile label="Loss" value={formatStat(tournament.points_loss)} />
              <StatTile
                label="No result"
                value={formatStat(tournament.points_no_result)}
              />
            </StatGrid>
          </AnalyticsSection>

          {(tournament.start_date || tournament.end_date) && (
            <Card className="flex items-center gap-4 p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-card bg-surface-muted text-ink-subtle">
                <CalendarDays className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-ink-subtle">
                  Schedule
                </p>
                <p className="mt-0.5 text-base font-bold text-ink">
                  {[tournament.start_date, tournament.end_date]
                    .filter(Boolean)
                    .join(" → ")}
                </p>
              </div>
            </Card>
          )}
        </div>
      </TabPanel>

      <TabPanel id="teams" activeId={tab}>
        <TeamsPanel tournamentId={tournament.id} />
      </TabPanel>

      <TabPanel id="table" activeId={tab}>
        <PointsTablePanel tournamentId={tournament.id} />
      </TabPanel>

      <TabPanel id="fixtures" activeId={tab}>
        <FixturesPanel tournamentId={tournament.id} />
      </TabPanel>

      <TabPanel id="leaderboards" activeId={tab}>
        <LeaderboardsPanel tournamentId={tournament.id} />
      </TabPanel>
    </>
  );
}
