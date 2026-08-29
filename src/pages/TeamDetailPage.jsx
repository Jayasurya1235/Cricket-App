import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTeam } from "../hooks/useTeam";
import { useDeleteTeam } from "../hooks/useDeleteTeam";
import { useAddPlayerToTeam } from "../hooks/useAddPlayerToTeam";
import { useRemovePlayerFromTeam } from "../hooks/useRemovePlayerFromTeam";
import { extractErrorMessage } from "../api/client";
import {
  ArrowLeft,
  Trash2,
  MapPin,
  Calendar,
  User,
  UserPlus,
  UserMinus,
  Mail,
  Phone,
  Users,
  Trophy,
  ShieldAlert,
} from "lucide-react";

function TeamDetailPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { data: team, isLoading, isError, error } = useTeam(teamId);
  const deleteTeam = useDeleteTeam();
  const addPlayer = useAddPlayerToTeam(teamId);
  const removePlayer = useRemovePlayerFromTeam(teamId);

  const [countryCode, setCountryCode] = useState("+91");
  const [mobileNumber, setMobileNumber] = useState("");
  const [addError, setAddError] = useState("");

  async function handleDelete() {
    if (!confirm(`Delete team "${team.name}"? This cannot be undone.`)) return;
    try {
      await deleteTeam.mutateAsync(teamId);
      navigate("/teams");
    } catch (err) {
      alert(`Failed to delete team: ${extractErrorMessage(err)}`);
    }
  }

  async function handleAddPlayer(e) {
    e.preventDefault();
    setAddError("");
    try {
      await addPlayer.mutateAsync({
        country_code: countryCode,
        mobile_number: Number(mobileNumber),
      });
      setMobileNumber("");
    } catch (err) {
      setAddError(extractErrorMessage(err));
    }
  }

  async function handleRemovePlayer(playerId) {
    if (!confirm("Remove this player from the team?")) return;
    try {
      await removePlayer.mutateAsync(playerId);
    } catch (err) {
      alert(`Failed to remove player: ${extractErrorMessage(err)}`);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4 text-sm">Loading team metadata...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl max-w-lg mx-auto text-center">
        <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-red-500" />
        <h4 className="font-bold">Failed to load team info</h4>
        <p className="text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="bg-white border border-cricket-border rounded-2xl p-12 text-center max-w-lg mx-auto space-y-3 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-emerald-500 mx-auto" />
        <h3 className="text-xl font-bold text-gray-900">Team not found</h3>
        <Link to="/teams" className="text-emerald-600 hover:underline">
          Return to Teams Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back navigation header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to="/teams"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-emerald-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Teams Directory
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleteTeam.isPending}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-600 border border-red-200 hover:border-transparent text-red-600 hover:text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {deleteTeam.isPending ? "Deleting..." : "Delete Team"}
        </button>
      </div>

      {/* Main Grid: Detail + Squad Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Profile Metadata */}
        <div className="space-y-6">
          <div className="bg-white border border-cricket-border rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
                {team.short_name}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{team.name}</h2>
                <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                  Club Profile
                </span>
              </div>
            </div>

            <div className="border-t border-cricket-border/60 pt-4 space-y-3.5 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Home Ground</p>
                  <p className="text-gray-600 font-medium">{team.homeground}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Club Founder</p>
                  <p className="text-gray-600 font-medium">{team.founder}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Founded Year</p>
                  <p className="text-gray-600 font-medium">
                    {team.founded_year}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Trophy className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Owner / Investor</p>
                  <p className="text-gray-600 font-medium">{team.owner}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Inline Add Player form */}
          <div className="bg-white border border-cricket-border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-3">
              <UserPlus className="w-4 h-4 text-emerald-600" />
              Onboard Player to Squad
            </h3>
            <form onSubmit={handleAddPlayer} className="space-y-3">
              <div className="flex gap-2">
                <div className="w-24">
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                    Code
                  </label>
                  <input
                    type="text"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full bg-white border border-cricket-border focus:border-emerald-500 rounded px-2.5 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none"
                    placeholder="+91"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full bg-white border border-cricket-border focus:border-emerald-500 rounded px-2.5 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              {addError && <p className="text-red-500 text-xs">{addError}</p>}

              <button
                type="submit"
                disabled={addPlayer.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold py-2 transition disabled:opacity-50"
              >
                {addPlayer.isPending ? "Adding Player..." : "Add to Squad"}
              </button>
            </form>
            <p className="text-[10px] text-gray-500 mt-2.5 leading-relaxed">
              Note: The athlete must already be fully registered with this phone
              number.
            </p>
          </div>
        </div>

        {/* Right Panel: Squad Listing */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            Squad Roster ({team.players?.length ?? 0})
          </h3>

          {!team.players || team.players.length === 0 ? (
            <div className="bg-white border border-cricket-border rounded-xl p-8 text-center shadow-sm">
              <p className="text-gray-500 text-sm">
                No players added to this team yet.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Use the squad panel on the left to sign up registered members.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {team.players.map((player) => {
                const initials =
                  `${player.first_name?.[0] ?? ""}${player.last_name?.[0] ?? ""}`.toUpperCase();
                return (
                  <div
                    key={player.id}
                    className="bg-white border border-cricket-border rounded-xl p-4 flex justify-between items-start group shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-xs">
                        {initials}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">
                          {player.first_name} {player.last_name}
                        </p>
                        <div className="space-y-0.5 mt-1 text-[11px] text-gray-500">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span>{player.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>
                              {player.country_code} {player.mobile_number}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemovePlayer(player.id)}
                      className="inline-flex items-center justify-center p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition"
                      title="Remove from squad"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeamDetailPage;
