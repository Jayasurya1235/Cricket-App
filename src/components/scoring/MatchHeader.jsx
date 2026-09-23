import { ArrowLeft, MapPin, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const MATCH_FORMAT_BADGES = {
  Test: "bg-indigo-100 text-indigo-700 border-indigo-200",
  ODI: "bg-blue-100 text-blue-700 border-blue-200",
  T20: "bg-purple-100 text-purple-700 border-purple-200",
};

export default function MatchHeader({ match, scorecard }) {
  if (!match) return null;

  const teamA = match.team_a;
  const teamB = match.team_b;
  const tossWinnerId = match.toss_winner_id;

  let battingTeam;
  let bowlingTeam;
  if (scorecard) {
    const batId = scorecard.batting_team_id;
    battingTeam = batId === teamB?.id ? teamB : teamA;
    bowlingTeam = batId === teamB?.id ? teamA : teamB;
  } else {
    // Innings not started — show the presumed first-batting side.
    battingTeam =
      match.toss_decision === "bowl"
        ? tossWinnerId === teamA?.id
          ? teamB
          : teamA
        : tossWinnerId === teamB?.id
          ? teamB
          : teamA;
    bowlingTeam = battingTeam === teamA ? teamB : teamA;
  }

  const total = scorecard?.total ?? 0;
  const wickets = scorecard?.wickets ?? 0;
  const overs = scorecard?.overs_bowled_str ?? "0.0";
  const inningsNumber = scorecard?.innings_number ?? 1;

  return (
    <div className="bg-white border border-cricket-border rounded-2xl overflow-hidden shadow-sm">
      <div className="px-4 py-2.5 sm:px-6 sm:py-3 flex items-center justify-between bg-gradient-to-r from-emerald-50/80 to-white border-b border-cricket-border/50">
        <Link
          to={`/matches/${match.id}`}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 hover:text-emerald-600 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Link>
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
              MATCH_FORMAT_BADGES[match.match_type] || MATCH_FORMAT_BADGES.T20
            }`}
          >
            {match.match_type}
          </span>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
            Innings {inningsNumber}
          </span>
          {scorecard && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                scorecard.completed
                  ? "bg-gray-100 text-gray-500 border-gray-200"
                  : "bg-red-50 text-red-600 border-red-200 flex items-center gap-1"
              }`}
            >
              {scorecard.completed && <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
              {scorecard.completed ? "Completed" : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  Live
                </>
              )}
            </span>
          )}
          {!scorecard && (
            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200 uppercase tracking-wider">
              Not Started
            </span>
          )}
        </div>
      </div>

      <div className="px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Batting
            </p>
            <p className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
              {battingTeam?.short_name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
              {battingTeam?.name}
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-center">
            <div className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight tabular-nums">
              {total}
              <span className="text-gray-400">/</span>
              <span className="text-red-500">{wickets}</span>
            </div>
            <p className="text-[11px] font-semibold text-gray-500 tabular-nums mt-0.5">
              {overs} ov
            </p>
          </div>

          <div className="flex-1 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Bowling
            </p>
            <p className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
              {bowlingTeam?.short_name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
              {bowlingTeam?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-gray-400">
          {match.venue && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {match.venue}
            </span>
          )}
          {match.match_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {match.match_date}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}