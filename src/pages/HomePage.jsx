import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  MapPin,
  Shield,
  UserPlus,
  Users,
} from "lucide-react";
import { useTeams } from "../hooks/useTeams";
import { usePlayers } from "../hooks/usePlayers";
import { useMatches } from "../hooks/useMatches";
import { getMatchStatus } from "../api/matchSchema";
import { extractErrorMessage } from "../api/client";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  SectionHeading,
  Skeleton,
} from "../components/ui";

const STATUS_TONES = {
  Upcoming: "info",
  Scheduled: "info",
  Live: "live",
  Completed: "neutral",
  Abandoned: "danger",
};

const QUICK_ACTIONS = [
  {
    to: "/teams/new",
    icon: Shield,
    title: "Register a team",
    description: "Add a club, homeground, and logo.",
  },
  {
    to: "/players/new",
    icon: UserPlus,
    title: "Onboard a player",
    description: "Set batting and bowling profiles.",
  },
  {
    to: "/matches/new",
    icon: CalendarPlus,
    title: "Schedule a match",
    description: "Pick teams, venue, and match type.",
  },
];

function StatCard({ label, value, loading, error, icon: Icon, to }) {
  const body = (
    <>
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-ink-subtle">{label}</p>
        {loading ? (
          <Skeleton className="mt-2 h-8 w-12" />
        ) : error ? (
          // A failed request is not a zero. Say so instead of showing a count.
          <p className="mt-1 text-sm font-semibold text-danger">Unavailable</p>
        ) : (
          <p className="mt-1 text-3xl font-bold leading-none tracking-tight text-ink tabular-nums">
            {value}
          </p>
        )}
      </div>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
        <Icon className="size-5" aria-hidden="true" />
      </span>
    </>
  );

  const classes =
    "flex items-center justify-between gap-4 rounded-card border border-line bg-surface p-5 shadow-card transition-[box-shadow,border-color] duration-200";

  return to ? (
    <Link
      to={to}
      className={`${classes} hover:border-brand-200 hover:shadow-raised`}
    >
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}

function RecentMatchesTable({ matches, loading }) {
  return (
    <Card className="overflow-hidden">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Recent matches</caption>
        <thead>
          <tr className="border-b border-line bg-canvas/60">
            <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
              Match
            </th>
            <th
              scope="col"
              className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-subtle sm:table-cell"
            >
              Date &amp; time
            </th>
            <th
              scope="col"
              className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-subtle lg:table-cell"
            >
              Venue
            </th>
            <th scope="col" className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-subtle">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {loading
            ? [0, 1, 2].map((key) => (
                <tr key={key}>
                  <td colSpan={4} className="px-5 py-4">
                    <Skeleton className="h-4 w-2/3" />
                  </td>
                </tr>
              ))
            : matches.map((match) => {
                const status = getMatchStatus(match);
                return (
                  <tr key={match.id} className="transition-colors hover:bg-canvas/60">
                    <td className="px-5 py-4">
                      <Link
                        to={`/matches/${match.id}`}
                        className="rounded font-semibold text-ink transition hover:text-brand-800"
                      >
                        {match.match_type} #{match.id}
                      </Link>
                    </td>
                    <td className="hidden whitespace-nowrap px-5 py-4 text-ink-subtle sm:table-cell">
                      {[match.match_date, match.match_time]
                        .filter(Boolean)
                        .join(" • ")}
                    </td>
                    <td className="hidden px-5 py-4 text-ink-subtle lg:table-cell">
                      <span className="flex items-center gap-1.5">
                        <MapPin
                          className="size-3.5 shrink-0 text-ink-faint"
                          aria-hidden="true"
                        />
                        <span className="truncate">{match.venue || "—"}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Badge
                        tone={STATUS_TONES[status] ?? "neutral"}
                        size="sm"
                        dot
                        pulse={status === "Live"}
                      >
                        {status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
        </tbody>
      </table>
    </Card>
  );
}

function HomePage() {
  const {
    data: teams,
    isLoading: loadingTeams,
    isError: teamsError,
  } = useTeams();
  const {
    data: players,
    isLoading: loadingPlayers,
    isError: playersError,
  } = usePlayers();
  const {
    data: matches,
    isLoading: loadingMatches,
    isError: matchesError,
    error: matchesErrorDetail,
    refetch: refetchMatches,
  } = useMatches();

  const totalTeams = teams?.length ?? 0;
  const totalPlayers = players?.length ?? 0;
  const totalMatches = matches?.length ?? 0;

  // Surface what needs attention first: live, then soonest upcoming, then the
  // most recent results. The date is the tiebreaker so fixtures inside a bucket
  // are actually ordered rather than left in API order.
  const recentMatches = useMemo(() => {
    const list = [...(matches ?? [])];
    const rank = (match) => {
      const status = getMatchStatus(match);
      if (status === "Live") return 0;
      if (status === "Completed") return 2;
      return 1;
    };
    const time = (match) => {
      const parsed = Date.parse(match?.match_date);
      return Number.isNaN(parsed) ? 0 : parsed;
    };
    return list
      .sort((a, b) => rank(a) - rank(b) || time(a) - time(b))
      .slice(0, 4);
  }, [matches]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Register clubs, onboard players, schedule fixtures, and run live scoring."
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          label="Teams"
          value={totalTeams}
          loading={loadingTeams}
          error={teamsError}
          icon={Shield}
          to="/teams"
        />
        <StatCard
          label="Players"
          value={totalPlayers}
          loading={loadingPlayers}
          error={playersError}
          icon={Users}
          to="/players"
        />
        <StatCard
          label="Matches"
          value={totalMatches}
          loading={loadingMatches}
          error={matchesError}
          icon={CalendarDays}
          to="/matches"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <SectionHeading
            title="Recent matches"
            action={
              <Link
                to="/matches"
                className="inline-flex items-center gap-1 rounded text-[13px] font-semibold text-brand-700 transition hover:text-brand-800"
              >
                View all
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            }
          />
          {recentMatches.length === 0 && !loadingMatches ? (
            matchesError ? (
              // Distinguish "the request failed" from "there are no matches" —
              // otherwise an API outage is reported as an empty league.
              <ErrorState
                title="Couldn't load matches"
                message={extractErrorMessage(matchesErrorDetail)}
                onRetry={() => refetchMatches()}
              />
            ) : (
              <EmptyState
                title="No matches yet"
                description="Schedule your first fixture to see it listed here."
                action={
                  <Button as={Link} to="/matches/new">
                    <CalendarPlus className="size-4" aria-hidden="true" />
                    Schedule a match
                  </Button>
                }
              />
            )
          ) : (
            <RecentMatchesTable
              matches={recentMatches}
              loading={loadingMatches}
            />
          )}
        </section>

        <section>
          <SectionHeading title="Quick actions" />
          <div className="space-y-3">
            {QUICK_ACTIONS.map(({ to, icon: Icon, title, description }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center gap-3.5 rounded-card border border-line bg-surface p-4 shadow-card transition-[box-shadow,border-color] duration-200 hover:border-brand-200 hover:shadow-raised"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">
                    {title}
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-ink-subtle">
                    {description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export default HomePage;