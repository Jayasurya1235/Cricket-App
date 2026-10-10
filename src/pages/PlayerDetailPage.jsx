import { Link, useParams } from "react-router-dom";
import {
  BarChart3,
  CalendarDays,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  Target,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import { usePlayerProfile } from "../hooks/usePlayerProfile";
import { usePlayerPerformance } from "../hooks/usePlayerPerformance";
import { extractErrorMessage } from "../api/client";
import { formatStat, fullName } from "../utils/analytics";
import {
  AnalyticsSection,
  BattingStatsBlock,
  BowlingStatsBlock,
  DataTable,
  FieldingStatsBlock,
  StatGrid,
  StatTile,
} from "../components/analytics";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
} from "../components/ui";

function ProfileRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5">
      <Icon
        className="mt-0.5 size-4 shrink-0 text-ink-faint"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
          {label}
        </dt>
        <dd className="mt-0.5 truncate text-sm font-medium text-ink">{value}</dd>
      </div>
    </div>
  );
}

function joined(...parts) {
  const value = parts.filter(Boolean).join(" • ");
  return value || null;
}

const COMPETITION_COLUMNS = [
  {
    key: "level_name",
    header: "Competition",
    render: (row) => (
      <span className="font-semibold text-ink">
        {row.level_name || `Level #${row.level_id}`}
      </span>
    ),
  },
  { key: "matches_played", header: "M", align: "right" },
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
    header: "Bat avg",
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

export default function PlayerDetailPage() {
  const { playerId } = useParams();
  const profileQuery = usePlayerProfile(playerId);
  const performanceQuery = usePlayerPerformance(playerId);

  const { data: profile } = profileQuery;
  const { data: performance } = performanceQuery;

  const bothLoading = profileQuery.isLoading && performanceQuery.isLoading;
  if (bothLoading) {
    return <LoadingState label="Loading player analytics…" />;
  }

  const bothError = profileQuery.isError && performanceQuery.isError;
  if (bothError) {
    return (
      <ErrorState
        title="Couldn't load player analytics"
        message={extractErrorMessage(profileQuery.error || performanceQuery.error)}
        onRetry={() => {
          profileQuery.refetch();
          performanceQuery.refetch();
        }}
      />
    );
  }

  const player = profile?.player ?? null;
  const identity = player ?? performance ?? null;

  if (!identity) {
    return (
      <EmptyState
        icon={<UserRound className="size-6" aria-hidden="true" />}
        title="Player not found"
        description="This player may have been removed, or the link is incorrect."
        action={
          <Button as={Link} to="/players" variant="secondary">
            Back to players
          </Button>
        }
      />
    );
  }

  const career = profile?.career ?? null;
  const batting = performance?.batting ?? career?.batting ?? null;
  const bowling = performance?.bowling ?? career?.bowling ?? null;
  const fielding = performance?.fielding ?? career?.fielding ?? null;
  const matchesPlayed = performance?.matches_played ?? career?.matches_played;
  const inningsPlayed = performance?.innings_played ?? career?.innings_played;
  const competitions = profile?.competitions ?? [];

  const name = fullName(identity);
  const playerCode = identity.player_code || performance?.player_code;

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Players", to: "/players" },
          { label: name || `Player #${playerId}` },
        ]}
        title={name || "Player"}
        description={
          playerCode
            ? `#${playerCode} · profile and career analytics`
            : "Player profile and career analytics"
        }
        meta={
          <>
            {batting && (
              <Badge tone="brand">
                <TrendingUp className="size-3" aria-hidden="true" />
                {formatStat(batting.runs)} runs
              </Badge>
            )}
            {bowling && (
              <Badge tone="info">
                <Target className="size-3" aria-hidden="true" />
                {formatStat(bowling.wickets)} wickets
              </Badge>
            )}
          </>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button as={Link} to="/players" variant="ghost">
              Back
            </Button>
            <Button as={Link} to={`/players/${playerId}/edit`} variant="secondary">
              <Pencil className="size-4" aria-hidden="true" />
              Edit player
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <Avatar
                src={player?.profile_image}
                name={name}
                size="lg"
                shape="rounded"
              />
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-ink">
                  {name || "Unnamed player"}
                </p>
                {playerCode && (
                  <p className="mt-0.5 text-[13px] text-ink-subtle">
                    #{playerCode}
                  </p>
                )}
              </div>
            </div>

            <dl className="mt-5 space-y-3.5 border-t border-line pt-4">
              <ProfileRow
                icon={UserRound}
                label="Gender"
                value={player?.gender}
              />
              <ProfileRow
                icon={TrendingUp}
                label="Batting"
                value={joined(
                  player?.batting_hand && `${player.batting_hand} handed`,
                  player?.batting_position,
                )}
              />
              <ProfileRow
                icon={Target}
                label="Bowling"
                value={joined(
                  player?.bowling_hand && `${player.bowling_hand} handed`,
                  player?.bowling_type,
                )}
              />
              <ProfileRow
                icon={CalendarDays}
                label="Date of birth"
                value={player?.date_of_birth}
              />
              <ProfileRow
                icon={Phone}
                label="Phone"
                value={
                  player?.phone_display ||
                  (player?.mobile_number
                    ? `${player.country_code ?? ""} ${player.mobile_number}`.trim()
                    : null)
                }
              />
              <ProfileRow icon={Mail} label="Email" value={player?.email} />
              {Array.isArray(player?.aliases) && player.aliases.length > 0 && (
                <ProfileRow
                  icon={Users}
                  label="Also known as"
                  value={player.aliases.join(", ")}
                />
              )}
            </dl>
          </Card>

          <div className="lg:col-span-2">
            <AnalyticsSection
              icon={BarChart3}
              title="Career record"
              description="Across completed matches owned by this account."
            >
              <StatGrid columns={4}>
                <StatTile
                  label="Matches played"
                  value={formatStat(matchesPlayed)}
                />
                <StatTile
                  label="Innings played"
                  value={formatStat(inningsPlayed)}
                />
                <StatTile
                  label="Runs"
                  value={formatStat(batting?.runs)}
                  tone="brand"
                />
                <StatTile
                  label="Wickets"
                  value={formatStat(bowling?.wickets)}
                  tone="brand"
                />
              </StatGrid>
            </AnalyticsSection>
          </div>
        </div>

        <AnalyticsSection
          icon={TrendingUp}
          title="Batting"
          description="Runs, average, strike rate and milestones."
        >
          <BattingStatsBlock stats={batting} />
        </AnalyticsSection>

        <AnalyticsSection
          icon={Target}
          title="Bowling"
          description="Wickets, economy, best figures and discipline."
        >
          <BowlingStatsBlock stats={bowling} />
        </AnalyticsSection>

        <AnalyticsSection
          icon={ShieldCheck}
          title="Fielding"
          description="Catches, run outs and stumpings."
        >
          <FieldingStatsBlock stats={fielding} />
        </AnalyticsSection>

        <AnalyticsSection
          icon={BarChart3}
          title="By competition"
          description="Career split by the league level of the sides represented."
        >
          <DataTable
            caption="Per-competition batting and bowling"
            columns={COMPETITION_COLUMNS}
            rows={competitions}
            getRowKey={(row) => row.level_id}
            empty="No competition splits recorded yet. They appear once this player turns out in completed matches."
          />
        </AnalyticsSection>
      </div>
    </>
  );
}
