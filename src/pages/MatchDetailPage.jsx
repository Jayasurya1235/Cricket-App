import { useParams, Link } from "react-router-dom";
import { useMatch } from "../hooks/useMatch";
import { useTeams } from "../hooks/useTeams";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Trophy,
  Coins,
  User,
  Users,
  ShieldAlert,
} from "lucide-react";

const STATUS_STYLES = {
  Upcoming: "bg-blue-50 text-blue-600 border-blue-200",
  Live: "bg-red-50 text-red-600 border-red-200 animate-pulse",
  Completed: "bg-gray-100 text-gray-500 border-gray-200",
};

function TeamMatchCard({ team, playingIds, isTossWinner, tossDecision }) {
  if (!team) return null;

  const playingPlayers = (team.players || []).filter((p) =>
    playingIds.includes(p.id),
  );
  const benchPlayers = (team.players || []).filter(
    (p) => !playingIds.includes(p.id),
  );

  return (
    <div className="bg-white border border-cricket-border rounded-xl p-5 flex-1 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <Link
          to={`/teams/${team.id}`}
          className="text-base font-extrabold text-gray-900 hover:text-emerald-600 transition"
        >
          {team.name}
        </Link>
        <span className="text-xs text-gray-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
          {team.short_name}
        </span>
      </div>

      {isTossWinner && (
        <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full mb-4">
          <Coins className="w-3 h-3 text-amber-500" />
          Won toss, chose to {tossDecision?.toLowerCase()}
        </div>
      )}

      {/* Playing XI list */}
      <div className="space-y-3 mt-3">
        <p className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          Playing XI ({playingPlayers.length})
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {playingPlayers.length === 0 ? (
            <p className="text-xs text-gray-500 py-1">No lineup announced.</p>
          ) : (
            playingPlayers.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 bg-emerald-50/50 rounded px-3 py-1.5 text-xs text-gray-600 border border-cricket-border"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span className="truncate">
                  {p.first_name} {p.last_name}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bench list */}
      {benchPlayers.length > 0 && (
        <div className="space-y-3 mt-5 pt-4 border-t border-cricket-border/50">
          <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
            Bench ({benchPlayers.length})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {benchPlayers.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 bg-gray-50 rounded px-3 py-1 text-xs text-gray-500 border border-cricket-border/40"
              >
                <span className="truncate">
                  {p.first_name} {p.last_name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MatchDetailPage() {
  const { matchId } = useParams();
  const { data: match, isLoading, isError, error } = useMatch(matchId);
  const { data: teams, isLoading: teamsLoading } = useTeams();

  if (isLoading || teamsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4 text-sm">Loading match details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl max-w-lg mx-auto text-center">
        <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-red-500" />
        <h4 className="font-bold">Failed to load match</h4>
        <p className="text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="bg-white border border-cricket-border rounded-2xl p-12 text-center max-w-lg mx-auto space-y-3 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-emerald-500 mx-auto" />
        <h3 className="text-xl font-bold text-gray-900">Match not found</h3>
        <Link to="/matches" className="text-emerald-600 hover:underline">
          Return to Fixtures List
        </Link>
      </div>
    );
  }

  const team1 = teams?.find((t) => t.id === match.team1_id);
  const team2 = teams?.find((t) => t.id === match.team2_id);
  const tossWinner = teams?.find((t) => t.id === Number(match.toss_won_by));
  const statusClass = STATUS_STYLES[match.status] || STATUS_STYLES.Upcoming;

  return (
    <div className="space-y-6">
      <Link
        to="/matches"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-emerald-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Fixtures List
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-cricket-border/50 pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {team1?.short_name || "T1"} vs {team2?.short_name || "T2"}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Fixture Match #{match.id} • Competitors Team Sheets
          </p>
        </div>
        <div>
          <span
            className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${statusClass}`}
          >
            {match.status === "Live" && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            )}
            {match.status}
          </span>
        </div>
      </div>

      {/* Match metadata grid */}
      <div className="bg-white border border-cricket-border rounded-xl p-5 grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm shadow-sm">
        <div className="space-y-0.5">
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">
            Match Type
          </span>
          <span className="text-gray-700 font-bold">{match.match_type}</span>
        </div>
        <div className="space-y-0.5">
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">
            Venue Arena
          </span>
          <span className="text-gray-700 font-bold flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-gray-500" />
            {match.venue}
          </span>
        </div>
        <div className="space-y-0.5">
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">
            Date & Schedule
          </span>
          <span className="text-gray-700 font-bold flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gray-500" />
            {match.match_date}
          </span>
        </div>
        <div className="space-y-0.5">
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">
            Local Time
          </span>
          <span className="text-gray-700 font-bold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-500" />
            {match.match_time}
          </span>
        </div>
        <div className="space-y-0.5">
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">
            Umpire / Referee
          </span>
          <span className="text-gray-700 font-bold flex items-center gap-1.5">
            <User className="w-4 h-4 text-gray-500" />
            {match.referee || "TBA"}
          </span>
        </div>
        <div className="space-y-0.5">
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">
            Toss Time
          </span>
          <span className="text-gray-700 font-bold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-500" />
            {match.toss_time || "TBA"}
          </span>
        </div>
      </div>

      {/* Completed Result Banner */}
      {match.status === "Completed" && match.result && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-700 text-sm font-bold">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span>Match Result: {match.result}</span>
        </div>
      )}

      {/* Toss Result Details Banner */}
      {tossWinner && (
        <div className="bg-white border border-cricket-border rounded-xl p-4 flex items-center gap-3 text-sm text-gray-600 shadow-sm">
          <Coins className="w-4 h-4 text-emerald-600" />
          <span>
            Toss Verdict:{" "}
            <strong className="text-gray-900">{tossWinner.name}</strong> won the
            toss and elected to{" "}
            <strong className="text-emerald-600">
              {match.toss_decision?.toLowerCase()}
            </strong>{" "}
            first.
          </span>
        </div>
      )}

      {/* Side-by-side Roster sheet comparisons */}
      <div className="flex flex-col md:flex-row gap-5">
        <TeamMatchCard
          team={team1}
          playingIds={match.team1_playing_xi || []}
          isTossWinner={team1 && tossWinner?.id === team1.id}
          tossDecision={match.toss_decision}
        />
        <TeamMatchCard
          team={team2}
          playingIds={match.team2_playing_xi || []}
          isTossWinner={team2 && tossWinner?.id === team2.id}
          tossDecision={match.toss_decision}
        />
      </div>
    </div>
  );
}

export default MatchDetailPage;
