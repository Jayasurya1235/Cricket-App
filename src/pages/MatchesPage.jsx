import { Link } from "react-router-dom";
import { useMatches } from "../hooks/useMatches";
import { useTeams } from "../hooks/useTeams";
import { getMatchStatus } from "../api/matchSchema";
import {
  MapPin,
  Calendar,
  Plus,
  ShieldAlert,
  Tv,
  Trophy,
} from "lucide-react";

const STATUS_STYLES = {
  Upcoming: "bg-blue-50 text-blue-600 border-blue-200",
  Scheduled: "bg-blue-50 text-blue-600 border-blue-200",
  Live: "bg-red-50 text-red-600 border-red-200 animate-pulse",
  Completed: "bg-gray-100 text-gray-500 border-gray-200",
};

function MatchesPage() {
  const { data: matches, isLoading, isError, error } = useMatches();
  const { data: teams } = useTeams();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4 text-sm">
          Loading tournament fixtures...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl max-w-lg mx-auto text-center">
        <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-red-500" />
        <h4 className="font-bold">Failed to load matches</h4>
        <p className="text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="bg-white border border-cricket-border rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
        <Tv className="w-12 h-12 text-emerald-500 mx-auto" />
        <h3 className="text-xl font-bold text-gray-900">
          No matches scheduled yet
        </h3>
        <p className="text-gray-500 text-sm">
          Plan upcoming events, select competing teams, venues, and match types.
        </p>
        <Link
          to="/matches/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition"
        >
          <Plus className="w-4 h-4" /> Schedule A Match
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Fixtures & Schedule
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Displaying {matches.length} tournament matches across scheduled,
            live, and past events.
          </p>
        </div>
        <Link
          to="/matches/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Schedule Match
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {matches.map((match) => {
          // The backend response embeds team_a/team_b; fall back to the local
          // teams list for older/partial payloads.
          const team1 =
            match.team_a ||
            teams?.find((t) => t.id === match.team_a_id || t.id === match.team1_id);
          const team2 =
            match.team_b ||
            teams?.find((t) => t.id === match.team_b_id || t.id === match.team2_id);
          const status = getMatchStatus(match);
          const statusClass = STATUS_STYLES[status] || STATUS_STYLES.Scheduled;
          const isLive = status === "Live";
          const isCompleted = status === "Completed";

          return (
            <Link
              key={match.id}
              to={`/matches/${match.id}`}
              className="group bg-white rounded-xl p-5 border border-cricket-border hover:border-emerald-300 hover:shadow-md shadow-sm transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Match Header Badge */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-gray-500 bg-emerald-50 px-2.5 py-0.5 rounded-md uppercase tracking-wide">
                    {match.match_type}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${statusClass}`}
                  >
                    {isLive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                    )}
                    {isCompleted && (
                      <Trophy className="w-3 h-3 text-amber-500" />
                    )}
                    {status}
                  </span>
                </div>

                {/* Matchup Title */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 text-center bg-emerald-50/70 py-2 rounded-lg border border-cricket-border">
                    <span className="block text-sm font-extrabold text-gray-900">
                      {team1?.short_name || "T1"}
                    </span>
                    <span className="text-[10px] text-gray-500 truncate block px-1">
                      {team1?.name || "Team 1"}
                    </span>
                  </div>
                  <span className="text-xs font-black text-emerald-600">
                    VS
                  </span>
                  <div className="flex-1 text-center bg-emerald-50/70 py-2 rounded-lg border border-cricket-border">
                    <span className="block text-sm font-extrabold text-gray-900">
                      {team2?.short_name || "T2"}
                    </span>
                    <span className="text-[10px] text-gray-500 truncate block px-1">
                      {team2?.name || "Team 2"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Match details bottom */}
              <div className="mt-4 pt-3 border-t border-cricket-border/60 space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span className="truncate">{match.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span>
                    {match.match_date} • {match.match_time}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default MatchesPage;