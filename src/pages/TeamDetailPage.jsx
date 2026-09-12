import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTeam } from "../hooks/useTeam";
import { useDeleteTeam } from "../hooks/useDeleteTeam";
import { useAddPlayerToTeam } from "../hooks/useAddPlayerToTeam";
import { useRemovePlayerFromTeam } from "../hooks/useRemovePlayerFromTeam";
import { useAssignPlayerToTeam } from "../hooks/useAssignPlayerToTeam";
import { usePlayers } from "../hooks/usePlayers";
import { useLevels } from "../hooks/useLevels";
import { useCountryCodes } from "../hooks/useCountryCodes";
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
  Search,
  CheckCircle2,
  UserCheck,
} from "lucide-react";

const PLAYER_ROLES = [
  { value: "playing_11", label: "Playing XI" },
  { value: "substitute", label: "Substitute" },
  { value: "coach", label: "Coach" },
  { value: "support_staff", label: "Support Staff" },
];

const SQUAD_GROUPS = [
  { key: "playing_11", label: "Playing XI", icon: Users },
  { key: "substitutes", label: "Substitutes", icon: UserCheck },
  { key: "bench", label: "Bench", icon: Users },
];

function TeamDetailPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { data: team, isLoading, isError, error } = useTeam(teamId);
  const { data: players, isLoading: playersLoading } = usePlayers();
  const { data: countryCodes } = useCountryCodes();
  const { data: levels } = useLevels();
  const deleteTeam = useDeleteTeam();
  const addPlayer = useAddPlayerToTeam(teamId);
  const removePlayer = useRemovePlayerFromTeam(teamId);
  const assignPlayer = useAssignPlayerToTeam();

  const [countryCode, setCountryCode] = useState("+91");
  const [mobileNumber, setMobileNumber] = useState("");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [assignLevel, setAssignLevel] = useState("");
  const [assignRole, setAssignRole] = useState("playing_11");
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");

  const roster = useMemo(() => {
    if (!team) return [];
    if (Array.isArray(team.players) && team.players.length > 0) {
      return team.players.map((p) => ({ ...p, squad_group: null }));
    }
    const grouped = [];
    for (const group of SQUAD_GROUPS) {
      for (const p of team[group.key] || []) {
        grouped.push({ ...p, squad_group: group.key });
      }
    }
    return grouped;
  }, [team]);

  const squadCount = team?.total ?? roster.length;

  const rosterIds = useMemo(() => new Set(roster.map((p) => p.id)), [roster]);

  const availablePlayers = useMemo(() => {
    if (!players) return [];
    const q = searchQuery.trim().toLowerCase();
    return players.filter((p) => {
      if (rosterIds.has(p.id)) return false;
      if (!q) return true;
      return (
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
        String(p.mobile_number ?? "").includes(q) ||
        String(p.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [players, searchQuery, rosterIds]);

  const selectedPlayer = players?.find(
    (p) => p.id === Number(selectedPlayerId),
  );

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
    setAddSuccess("");
    try {
      await addPlayer.mutateAsync({
        country_code: countryCode,
        mobile_number: Number(mobileNumber),
        role: "playing_11",
      });
      setMobileNumber("");
      setAddSuccess("Player added to the squad successfully!");
    } catch (err) {
      setAddError(extractErrorMessage(err));
    }
  }

  async function handleAssignPlayer(e) {
    e.preventDefault();
    setAssignError("");
    setAssignSuccess("");
    if (!selectedPlayerId) {
      setAssignError("Please select a player to assign.");
      return;
    }
    if (!assignLevel) {
      setAssignError("Please select the level for this player.");
      return;
    }
    try {
      await assignPlayer.mutateAsync({
        playerId: Number(selectedPlayerId),
        team_id: Number(teamId),
        level_id: Number(assignLevel),
        role: assignRole || "playing_11",
      });
      setSelectedPlayerId("");
      setSearchQuery("");
      setAssignLevel("");
      setAssignRole("playing_11");
      setAssignSuccess(
        `Player assigned to ${team.name} successfully!`,
      );
    } catch (err) {
      setAssignError(extractErrorMessage(err));
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

  const groupedRoster = SQUAD_GROUPS.map((group) => ({
    group,
    members: roster.filter((p) => p.squad_group === group.key),
  }));

  const isFlatRoster = roster.some((p) => p.squad_group === null);

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
              {team.logo || team.logo_url ? (
                <div className="w-10 h-10 rounded-lg border border-cricket-border overflow-hidden flex items-center justify-center shrink-0 bg-cricket-card">
                  <img
                    src={team.logo || team.logo_url}
                    alt={team.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
                  {team.short_name}
                </div>
              )}
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
              {team.level && (
                <div className="flex items-start gap-2.5">
                  <Trophy className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Level</p>
                    <p className="text-gray-600 font-medium">{team.level}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assign Existing Player */}
          <div className="bg-white border border-cricket-border rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Assign Existing Player
            </h3>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Pick a registered player from the system and assign them to this
              team with a level and role.
            </p>

            <form onSubmit={handleAssignPlayer} className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedPlayerId("");
                  }}
                  className="w-full bg-white border border-cricket-border focus:border-emerald-500 rounded pl-8 pr-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none"
                  placeholder="Search by name, phone or email..."
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                  Registered Player
                </label>
                <select
                  value={selectedPlayerId}
                  onChange={(e) => setSelectedPlayerId(e.target.value)}
                  className="w-full bg-white border border-cricket-border focus:border-emerald-500 rounded px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none"
                >
                  <option value="" className="bg-white">
                    {playersLoading
                      ? "Loading players..."
                      : availablePlayers.length === 0
                        ? "No available players to assign"
                        : "Select a player"}
                  </option>
                  {availablePlayers.map((p) => (
                    <option key={p.id} value={p.id} className="bg-white">
                      {p.first_name} {p.last_name} — {p.country_code}{" "}
                      {p.mobile_number}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                    Level
                  </label>
                  <select
                    required
                    value={assignLevel}
                    onChange={(e) => setAssignLevel(e.target.value)}
                    className="w-full bg-white border border-cricket-border focus:border-emerald-500 rounded px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none"
                  >
                    <option value="" className="bg-white">
                      Select level
                    </option>
                    {levels?.map((lvl) => (
                      <option key={lvl.id} value={lvl.id} className="bg-white">
                        {lvl.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                    Role
                  </label>
                  <select
                    value={assignRole}
                    onChange={(e) => setAssignRole(e.target.value)}
                    className="w-full bg-white border border-cricket-border focus:border-emerald-500 rounded px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none"
                  >
                    {PLAYER_ROLES.map((r) => (
                      <option key={r.value} value={r.value} className="bg-white">
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedPlayer && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded p-2 text-[11px] text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <span>
                    {selectedPlayer.first_name} {selectedPlayer.last_name}{" "}
                    ({selectedPlayer.batting_position || "Player"})
                  </span>
                </div>
              )}

              {assignError && (
                <p className="text-red-500 text-xs">{assignError}</p>
              )}
              {assignSuccess && (
                <p className="text-green-600 text-xs font-semibold">
                  {assignSuccess}
                </p>
              )}

              <button
                type="submit"
                disabled={assignPlayer.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold py-2 transition disabled:opacity-50"
              >
                {assignPlayer.isPending ? "Assigning Player..." : "Assign to Team"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel: Squad Listing */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Squad Roster ({squadCount})
            </h3>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
              {isFlatRoster
                ? `${squadCount} members`
                : `${roster.filter((p) => p.squad_group === "playing_11").length} XI · ${roster.filter((p) => p.squad_group === "substitutes").length} Subs · ${roster.filter((p) => p.squad_group === "bench").length} Bench`}
            </span>
          </div>

          {squadCount === 0 ? (
            <div className="bg-white border border-cricket-border rounded-xl p-8 text-center shadow-sm">
              <p className="text-gray-500 text-sm">
                No players added to this team yet.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Assign a registered player using the panel on the left, or add
                one by phone number below.
              </p>
            </div>
          ) : isFlatRoster ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roster.map((player) => {
                return (
                  <div
                    key={player.id}
                    className="bg-white border border-cricket-border rounded-xl p-4 flex justify-between items-start group shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      {player.profile_image ? (
                        <img
                          src={player.profile_image}
                          alt={`${player.first_name} ${player.last_name}`}
                          className="w-10 h-10 rounded-lg object-cover border border-cricket-border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-xs">
                          {`${player.first_name?.[0] ?? ""}${player.last_name?.[0] ?? ""}`.toUpperCase() || "?"}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-sm text-gray-900">
                          {player.first_name} {player.last_name}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mt-1 capitalize">
                          {player.role || "playing_11"}
                        </span>
                        {player.email && (
                          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-gray-500">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span>{player.email}</span>
                          </div>
                        )}
                        {player.mobile_number && (
                          <div className="flex items-center gap-1 text-[11px] text-gray-500">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>
                              {player.country_code} {player.mobile_number}
                            </span>
                          </div>
                        )}
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
          ) : (
            <div className="space-y-5">
              {groupedRoster.map(({ group, members }) => {
                if (members.length === 0) return null;
                const GroupIcon = group.icon;
                return (
                  <div key={group.key} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <GroupIcon className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                        {group.label}
                      </h4>
                      <span className="text-[11px] text-gray-400 font-semibold">
                        {members.length}
                      </span>
                      <div className="flex-1 h-px bg-cricket-border/60" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {members.map((player) => {
                        const initials =
                          `${player.first_name?.[0] ?? ""}${player.last_name?.[0] ?? ""}`.toUpperCase();
                        return (
                          <div
                            key={player.id}
                            className="bg-white border border-cricket-border rounded-xl p-4 flex justify-between items-start group shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              {player.profile_image ? (
                                <img
                                  src={player.profile_image}
                                  alt={`${player.first_name} ${player.last_name}`}
                                  className="w-10 h-10 rounded-lg object-cover border border-cricket-border"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-xs">
                                  {initials || "?"}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-sm text-gray-900">
                                  {player.first_name} {player.last_name}
                                </p>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mt-1 capitalize">
                                  {player.role || "playing_11"}
                                </span>
                                {player.email && (
                                  <div className="flex items-center gap-1 mt-1.5 text-[11px] text-gray-500">
                                    <Mail className="w-3 h-3 text-gray-400" />
                                    <span>{player.email}</span>
                                  </div>
                                )}
                                {player.mobile_number && (
                                  <div className="flex items-center gap-1 text-[11px] text-gray-500">
                                    <Phone className="w-3 h-3 text-gray-400" />
                                    <span>
                                      {player.country_code} {player.mobile_number}
                                    </span>
                                  </div>
                                )}
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
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Player By Phone */}
          <div className="bg-white border border-cricket-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-gray-900 text-sm">
                Add Player to Squad by Phone
              </h3>
            </div>
            <form onSubmit={handleAddPlayer} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-[5rem_1fr] gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                    Code
                  </label>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full bg-white border border-cricket-border focus:border-emerald-500 rounded px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none"
                  >
                    {countryCodes?.map((cc) => (
                      <option key={cc.code} value={cc.code} className="bg-white">
                        {cc.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
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
              {addSuccess && (
                <p className="text-green-600 text-xs font-semibold">
                  {addSuccess}
                </p>
              )}

              <button
                type="submit"
                disabled={addPlayer.isPending}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold py-2 px-4 transition disabled:opacity-50"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {addPlayer.isPending ? "Adding Player..." : "Add to Squad"}
              </button>
            </form>
            <p className="text-[10px] text-gray-500 mt-2.5 leading-relaxed">
              Note: The athlete must already be fully registered with this phone
              number.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamDetailPage;