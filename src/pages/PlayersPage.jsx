import { Link, useNavigate } from "react-router-dom";
import { usePlayers } from "../hooks/usePlayers";
import { useDeletePlayer } from "../hooks/useDeletePlayer";
import { extractErrorMessage } from "../api/client";
import {
  Award,
  Target,
  CheckCircle2,
  AlertCircle,
  Plus,
  Users,
  ShieldAlert,
  Pencil,
  Trash2,
} from "lucide-react";

function PlayersPage() {
  const navigate = useNavigate();
  const { data: players, isLoading, isError, error } = usePlayers();
  const deletePlayer = useDeletePlayer();

  async function handleDelete(player) {
    if (!confirm(`Delete player "${player.first_name} ${player.last_name}"? This cannot be undone.`))
      return;
    try {
      await deletePlayer.mutateAsync(player.id);
    } catch (err) {
      alert(`Failed to delete player: ${extractErrorMessage(err)}`);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4 text-sm">
          Loading athletes database...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl max-w-lg mx-auto text-center">
        <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-red-500" />
        <h4 className="font-bold">Failed to load players</h4>
        <p className="text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  if (!players || players.length === 0) {
    return (
      <div className="bg-white border border-cricket-border rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
        <Users className="w-12 h-12 text-emerald-500 mx-auto" />
        <h3 className="text-xl font-bold text-gray-900">
          No athletes registered yet
        </h3>
        <p className="text-gray-500 text-sm">
          Start onboarding players to create squads and matches.
        </p>
        <Link
          to="/players/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition"
        >
          <Plus className="w-4 h-4" /> Register First Player
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Athletes Roster
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Displaying {players.length} registered players with full physical &
            skill profiles.
          </p>
        </div>
        <Link
          to="/players/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Add Player
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {players.map((player) => {
          const initials =
            `${player.first_name?.[0] ?? ""}${player.last_name?.[0] ?? ""}`.toUpperCase();
          return (
            <div
              key={player.id}
              className="bg-white border border-cricket-border rounded-xl p-5 hover:border-emerald-300 shadow-sm transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Profile Header card style from image 2 */}
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-sm flex items-center justify-center shadow-inner overflow-hidden">
                    {player.profile_image ? (
                      <img
                        src={player.profile_image}
                        alt={`${player.first_name} ${player.last_name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initials || "?"
                    )}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 leading-snug">
                      {player.first_name} {player.last_name}
                    </h2>
                    <p className="text-xs text-gray-500">
                      Player ID: #{player.id}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/players/${player.id}/edit`)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                      title="Edit player"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(player)}
                      disabled={deletePlayer.isPending}
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                      title="Delete player"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Skill Details */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <div className="p-1 rounded bg-sky-50 text-sky-600">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <span>
                      <strong className="text-gray-500 font-medium">
                        Gender:
                      </strong>{" "}
                      {player.gender || "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <div className="p-1 rounded bg-amber-50 text-amber-500">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                    <span>
                      <strong className="text-gray-500 font-medium">
                        Batting:
                      </strong>{" "}
                      {player.batting_hand} Handed • {player.batting_position}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <div className="p-1 rounded bg-emerald-50 text-emerald-600">
                      <Target className="w-3.5 h-3.5" />
                    </div>
                    <span>
                      <strong className="text-gray-500 font-medium">
                        Bowling:
                      </strong>{" "}
                      {player.bowling_hand} Hand • {player.bowling_type}
                    </span>
                  </div>
                  {(player.role || player.team || player.level) && (
                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                      <div className="p-1 rounded bg-indigo-50 text-indigo-600">
                        <Award className="w-3.5 h-3.5" />
                      </div>
                      <span>
                        <strong className="text-gray-500 font-medium">
                          Squad:
                        </strong>{" "}
                        {[
                          player.role &&
                            (Array.isArray(player.role)
                              ? player.role.join(", ")
                              : player.role),
                          player.team?.name ?? player.team_name,
                          player.level?.name ?? player.level_name,
                        ]
                          .filter(Boolean)
                          .join(" • ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Verified pill at bottom */}
              <div className="mt-5 pt-3 border-t border-cricket-border/60 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {player.height && player.weight
                    ? `${player.height}cm • ${player.weight}kg`
                    : "Physicals: —"}
                </span>
                <div>
                  {player.is_phone_verified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <AlertCircle className="w-3 h-3 text-amber-500" />
                      Pending OTP
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PlayersPage;
