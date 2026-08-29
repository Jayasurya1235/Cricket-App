import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTeams } from "../hooks/useTeams";
import { useCreateMatch } from "../hooks/useCreateMatch";
import { emptyMatchForm } from "../api/matchSchema";
import { extractErrorMessage } from "../api/client";
import { ArrowLeft, Calendar, Sparkles, ShieldAlert } from "lucide-react";

function AddMatchPage() {
  const navigate = useNavigate();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const createMatch = useCreateMatch();

  const [form, setForm] = useState(emptyMatchForm);
  const [formError, setFormError] = useState("");

  const team1 = teams?.find((t) => t.id === Number(form.team1_id));
  const team2 = teams?.find((t) => t.id === Number(form.team2_id));

  function handleChange(field, value) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "team1_id") updated.team1_playing_xi = [];
      if (field === "team2_id") updated.team2_playing_xi = [];
      return updated;
    });
  }

  function togglePlayer(teamKey, playerId) {
    setForm((prev) => {
      const current = prev[teamKey];
      const exists = current.includes(playerId);
      const updated = exists
        ? current.filter((id) => id !== playerId)
        : [...current, playerId];
      return { ...prev, [teamKey]: updated };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (form.team1_id === form.team2_id) {
      setFormError("Team 1 and Team 2 cannot be the same team.");
      return;
    }
    if (
      form.team1_playing_xi.length === 0 ||
      form.team2_playing_xi.length === 0
    ) {
      setFormError("Select at least one playing player for each team.");
      return;
    }

    try {
      const payload = {
        ...form,
        team1_id: Number(form.team1_id),
        team2_id: Number(form.team2_id),
      };
      if (form.toss_won_by) payload.toss_won_by = Number(form.toss_won_by);
      const newMatch = await createMatch.mutateAsync(payload);
      navigate(`/matches/${newMatch.id}`);
    } catch (err) {
      setFormError(extractErrorMessage(err));
    }
  }

  if (teamsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4 text-sm">
          Initializing matchup configs...
        </p>
      </div>
    );
  }

  if (!teams || teams.length < 2) {
    return (
      <div className="bg-white border border-cricket-border rounded-2xl p-8 text-center max-w-lg mx-auto space-y-4 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-lg font-bold text-gray-900">Insufficient Teams</h3>
        <p className="text-gray-500 text-sm">
          You need at least 2 teams created before you can schedule a match.
        </p>
        <Link
          to="/teams/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition"
        >
          Register First Team
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        to="/matches"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-emerald-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Matches
      </Link>

      <div className="bg-white border border-cricket-border rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-1.5">
              Schedule New Match
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            </h1>
            <p className="text-xs text-gray-500">
              Configure venues, competing teams, assign playing XIs, and set
              match rules.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Match Type */}
          <div>
            <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
              Match Category / Format
            </label>
            <select
              required
              value={form.match_type}
              onChange={(e) => handleChange("match_type", e.target.value)}
              className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
            >
              <option value="" className="bg-cricket-card">
                Select match type
              </option>
              <option value="Test" className="bg-cricket-card">
                Test
              </option>
              <option value="ODI" className="bg-cricket-card">
                ODI (50 overs)
              </option>
              <option value="T20" className="bg-cricket-card">
                T20
              </option>
            </select>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
              Arena / Venue
            </label>
            <input
              type="text"
              required
              value={form.venue}
              onChange={(e) => handleChange("venue", e.target.value)}
              className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none transition"
              placeholder="e.g. M. A. Chidambaram Stadium, Chennai"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                Match Date
              </label>
              <input
                type="date"
                required
                value={form.match_date}
                onChange={(e) => handleChange("match_date", e.target.value)}
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                required
                value={form.match_time}
                onChange={(e) => handleChange("match_time", e.target.value)}
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Team Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                Home Squad (Team 1)
              </label>
              <select
                required
                value={form.team1_id}
                onChange={(e) => handleChange("team1_id", e.target.value)}
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
              >
                <option value="" className="bg-cricket-card">
                  Select Home Team
                </option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id} className="bg-cricket-card">
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                Away Squad (Team 2)
              </label>
              <select
                required
                value={form.team2_id}
                onChange={(e) => handleChange("team2_id", e.target.value)}
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
              >
                <option value="" className="bg-cricket-card">
                  Select Away Team
                </option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id} className="bg-cricket-card">
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Playing XI — Team 1 */}
          {team1 && (
            <div className="bg-emerald-50/40 border border-cricket-border rounded-xl p-4 space-y-3">
              <h3 className="text-xs uppercase font-extrabold text-emerald-700 tracking-wider">
                {team1.name} — Select Lineup Playing XI
              </h3>
              {!team1.players || team1.players.length === 0 ? (
                <p className="text-xs text-gray-500">
                  This squad is empty. Onboard members first.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {team1.players.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2.5 text-xs text-gray-600 bg-white border border-cricket-border/70 rounded-lg p-2.5 cursor-pointer hover:border-emerald-300 transition"
                    >
                      <input
                        type="checkbox"
                        checked={form.team1_playing_xi.includes(p.id)}
                        onChange={() => togglePlayer("team1_playing_xi", p.id)}
                        className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="truncate">
                        {p.first_name} {p.last_name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Playing XI — Team 2 */}
          {team2 && (
            <div className="bg-emerald-50/40 border border-cricket-border rounded-xl p-4 space-y-3">
              <h3 className="text-xs uppercase font-extrabold text-emerald-700 tracking-wider">
                {team2.name} — Select Lineup Playing XI
              </h3>
              {!team2.players || team2.players.length === 0 ? (
                <p className="text-xs text-gray-500">
                  This squad is empty. Onboard members first.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {team2.players.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2.5 text-xs text-gray-600 bg-white border border-cricket-border/70 rounded-lg p-2.5 cursor-pointer hover:border-emerald-300 transition"
                    >
                      <input
                        type="checkbox"
                        checked={form.team2_playing_xi.includes(p.id)}
                        onChange={() => togglePlayer("team2_playing_xi", p.id)}
                        className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="truncate">
                        {p.first_name} {p.last_name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Toss Details */}
          <div className="bg-emerald-50/40 border border-cricket-border rounded-xl p-4 space-y-4">
            <h3 className="text-xs uppercase font-extrabold text-gray-600 tracking-wider">
              Toss Outcome
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                  Toss Won By
                </label>
                <select
                  value={form.toss_won_by}
                  onChange={(e) => handleChange("toss_won_by", e.target.value)}
                  className="w-full bg-cricket-card border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
                >
                  <option value="">Not decided yet</option>
                  {team1 && <option value={team1.id}>{team1.name}</option>}
                  {team2 && <option value={team2.id}>{team2.name}</option>}
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                  Toss Decision
                </label>
                <select
                  value={form.toss_decision}
                  onChange={(e) =>
                    handleChange("toss_decision", e.target.value)
                  }
                  className="w-full bg-cricket-card border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
                >
                  <option value="">--</option>
                  <option value="Bat">Bat</option>
                  <option value="Bowl">Bowl</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                Toss Time
              </label>
              <input
                type="time"
                value={form.toss_time}
                onChange={(e) => handleChange("toss_time", e.target.value)}
                className="w-full bg-cricket-card border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Referee & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                Match Referee
              </label>
              <input
                type="text"
                value={form.referee}
                onChange={(e) => handleChange("referee", e.target.value)}
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
                placeholder="e.g. Javagal Srinath"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                Current Status
              </label>
              <select
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Live">Live</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {form.status === "Completed" && (
            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                Match Result Verdict
              </label>
              <input
                type="text"
                value={form.result}
                onChange={(e) => handleChange("result", e.target.value)}
                placeholder="e.g. India won by 6 wickets"
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none transition"
              />
            </div>
          )}

          {formError && <p className="text-red-500 text-xs">{formError}</p>}

          <div className="pt-2">
            <button
              type="submit"
              disabled={createMatch.isPending}
              className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition"
            >
              {createMatch.isPending
                ? "Creating match fixture..."
                : "Schedule Match"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMatchPage;
