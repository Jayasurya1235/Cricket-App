import { Link } from "react-router-dom";
import { useTeams } from "../hooks/useTeams";
import { usePlayers } from "../hooks/usePlayers";
import { useMatches } from "../hooks/useMatches";
import {
  Users,
  Calendar,
  Shield,
  ArrowRight,
  Plus,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";

function HomePage() {
  const { data: teams, isLoading: loadingTeams } = useTeams();
  const { data: players, isLoading: loadingPlayers } = usePlayers();
  const { data: matches, isLoading: loadingMatches } = useMatches();

  const totalTeams = teams?.length ?? 0;
  const totalPlayers = players?.length ?? 0;
  const totalMatches = matches?.length ?? 0;

  // Get upcoming or live matches
  const recentMatches = matches?.slice(0, 3) ?? [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-emerald-700 via-emerald-600 to-emerald-800 border border-emerald-500/40 p-6 md:p-8 shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-emerald-50 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Cricket Management Platform
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Manage Your Cricket Teams & Matches <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-200 to-amber-300">
              With Elite Precision
            </span>
          </h1>
          <p className="text-emerald-50/90 text-sm md:text-base leading-relaxed">
            Welcome to the cricket Pro Administration hub. Register teams,
            assign squads, schedule matches, and monitor live score sheets with
            our advanced dashboard suite.
          </p>
        </div>
        {/* Background decorative glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/30 rounded-full blur-3xl z-0"></div>
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-amber-300/20 rounded-full blur-3xl z-0"></div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Teams Stat */}
        <div className="bg-white border border-cricket-border rounded-xl p-5 flex items-center justify-between hover:border-emerald-300 shadow-sm transition-all duration-300">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Teams
            </p>
            <h3 className="text-2xl font-bold text-gray-900">
              {loadingTeams ? (
                <span className="text-gray-400">--</span>
              ) : (
                totalTeams
              )}
            </h3>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{" "}
              Active Squads
            </p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-emerald-600">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        {/* Players Stat */}
        <div className="bg-white border border-cricket-border rounded-xl p-5 flex items-center justify-between hover:border-emerald-300 shadow-sm transition-all duration-300">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Registered Athletes
            </p>
            <h3 className="text-2xl font-bold text-gray-900">
              {loadingPlayers ? (
                <span className="text-gray-400">--</span>
              ) : (
                totalPlayers
              )}
            </h3>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{" "}
              Pro Roster
            </p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-emerald-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Matches Stat */}
        <div className="bg-white border border-cricket-border rounded-xl p-5 flex items-center justify-between hover:border-emerald-300 shadow-sm transition-all duration-300">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Scheduled Matches
            </p>
            <h3 className="text-2xl font-bold text-gray-900">
              {loadingMatches ? (
                <span className="text-gray-400">--</span>
              ) : (
                totalMatches
              )}
            </h3>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{" "}
              Fixtures List
            </p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-emerald-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Match Events + Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Match Events Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Event Match Schedule
            </h2>
            <Link
              to="/matches"
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 hover:underline"
            >
              View All Matches <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-cricket-border rounded-xl overflow-hidden shadow-sm">
            {loadingMatches ? (
              <p className="p-6 text-sm text-gray-500 text-center">
                Loading matches...
              </p>
            ) : recentMatches.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <p className="text-sm text-gray-500">
                  No upcoming matches scheduled.
                </p>
                <Link
                  to="/matches/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  <Plus className="w-4 h-4" /> Schedule First Match
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-cricket-border bg-emerald-50/60 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                      <th className="px-6 py-4">Match Event</th>
                      <th className="px-6 py-4">Date & Time</th>
                      <th className="px-6 py-4">Arena</th>
                      <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cricket-border/60">
                    {recentMatches.map((match) => {
                      const isLive = match.status === "Live";
                      const isCompleted = match.status === "Completed";
                      return (
                        <tr
                          key={match.id}
                          className="hover:bg-emerald-50/40 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <Link
                              to={`/matches/${match.id}`}
                              className="font-bold text-gray-900 hover:text-emerald-600 transition"
                            >
                              Match #{match.id} ({match.match_type})
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              <span>
                                {match.match_date} • {match.match_time}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              <span>{match.venue}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                isLive
                                  ? "bg-red-50 border-red-200 text-red-600 animate-pulse"
                                  : isCompleted
                                    ? "bg-gray-100 border-cricket-border text-gray-500"
                                    : "bg-emerald-50 border-emerald-200 text-emerald-700"
                              }`}
                            >
                              {isLive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                              )}
                              {match.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Quick Action Hub */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-600" />
            Quick Administration
          </h2>

          <div className="space-y-3.5">
            {/* Add Team */}
            <Link
              to="/teams/new"
              className="group block p-4 bg-white border border-cricket-border rounded-xl hover:border-emerald-300 hover:shadow-md shadow-sm transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm group-hover:text-emerald-700 transition">
                    Register New Team
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Enter homeground, logo details, and squad levels.
                  </p>
                </div>
              </div>
            </Link>

            {/* Register Player */}
            <Link
              to="/players/new"
              className="group block p-4 bg-white border border-cricket-border rounded-xl hover:border-emerald-300 hover:shadow-md shadow-sm transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm group-hover:text-emerald-700 transition">
                    Onboard Athlete
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Set up batting, bowling profiles and verify credentials.
                  </p>
                </div>
              </div>
            </Link>

            {/* Schedule Match */}
            <Link
              to="/matches/new"
              className="group block p-4 bg-white border border-cricket-border rounded-xl hover:border-emerald-300 hover:shadow-md shadow-sm transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm group-hover:text-emerald-700 transition">
                    Schedule Match
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Configure dates, venues, referees, and pick rosters.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
