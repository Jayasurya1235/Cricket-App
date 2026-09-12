import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTeams } from "../hooks/useTeams";
import { useCreateMatch } from "../hooks/useCreateMatch";
import { emptyMatchForm } from "../api/matchSchema";
import { extractErrorMessage } from "../api/client";
import { ArrowLeft, Calendar, Sparkles, ShieldAlert } from "lucide-react";

const MATCH_TYPES = [
  { value: "Test", label: "Test" },
  { value: "ODI", label: "ODI (50 overs)" },
  { value: "T20", label: "T20" },
];

const TOSS_DECISIONS = [
  { value: "bat", label: "bat" },
  { value: "bowl", label: "bowl" },
];

function AddMatchPage() {
  const navigate = useNavigate();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const createMatch = useCreateMatch();

  const [form, setForm] = useState(emptyMatchForm);
  const [formError, setFormError] = useState("");

  const teamA = teams?.find((t) => t.id === Number(form.team_a_id));
  const teamB = teams?.find((t) => t.id === Number(form.team_b_id));

  function handleChange(field, value) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      // If teams change, reset the toss winner since it must be one of them
      if (field === "team_a_id" || field === "team_b_id") {
        const a = Number(updated.team_a_id);
        const b = Number(updated.team_b_id);
        const winner = Number(updated.toss_winner_id);
        if (winner !== a && winner !== b) updated.toss_winner_id = "";
      }
      return updated;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!form.team_a_id || !form.team_b_id) {
      setFormError("Please select both competing teams.");
      return;
    }
    if (form.team_a_id === form.team_b_id) {
      setFormError("Home Squad and Away Squad cannot be the same team.");
      return;
    }
    if (!form.toss_winner_id) {
      setFormError("Please select which team won the toss.");
      return;
    }
    if (!form.toss_decision) {
      setFormError("Please select the toss decision (Bat or Bowl).");
      return;
    }

    try {
      const payload = {
        match_type: form.match_type,
        venue: form.venue,
        match_date: form.match_date,
        match_time: form.match_time,
        team_a_id: Number(form.team_a_id),
        team_b_id: Number(form.team_b_id),
        toss_winner_id: Number(form.toss_winner_id),
        toss_decision: form.toss_decision,
        result: form.result || null,
        referee_1_name: form.referee_1_name || null,
        referee_2_name: form.referee_2_name || null,
        match_referee_name: form.match_referee_name || null,
      };
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
              Configure venues, competing teams, toss outcome and match
              officials.
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
              {MATCH_TYPES.map((mt) => (
                <option key={mt.value} value={mt.value} className="bg-cricket-card">
                  {mt.label}
                </option>
              ))}
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
                Home Squad (Team A)
              </label>
              <select
                required
                value={form.team_a_id}
                onChange={(e) => handleChange("team_a_id", e.target.value)}
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
              >
                <option value="" className="bg-cricket-card">
                  Select Home Team
                </option>
                {teams
                  .filter((t) => !form.team_b_id || t.id !== Number(form.team_b_id))
                  .map((t) => (
                    <option key={t.id} value={t.id} className="bg-cricket-card">
                      {t.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                Away Squad (Team B)
              </label>
              <select
                required
                value={form.team_b_id}
                onChange={(e) => handleChange("team_b_id", e.target.value)}
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
              >
                <option value="" className="bg-cricket-card">
                  Select Away Team
                </option>
                {teams
                  .filter((t) => !form.team_a_id || t.id !== Number(form.team_a_id))
                  .map((t) => (
                    <option key={t.id} value={t.id} className="bg-cricket-card">
                      {t.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

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
                  required
                  value={form.toss_winner_id}
                  onChange={(e) =>
                    handleChange("toss_winner_id", e.target.value)
                  }
                  className="w-full bg-cricket-card border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
                >
                  <option value="">Select toss winner</option>
                  {teamA && <option value={teamA.id}>{teamA.name}</option>}
                  {teamB && <option value={teamB.id}>{teamB.name}</option>}
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                  Toss Decision
                </label>
                <select
                  required
                  value={form.toss_decision}
                  onChange={(e) =>
                    handleChange("toss_decision", e.target.value)
                  }
                  className="w-full bg-cricket-card border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
                >
                  <option value="">--</option>
                  {TOSS_DECISIONS.map((td) => (
                    <option key={td.value} value={td.value} className="bg-cricket-card">
                      {td.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Match Officials */}
          <div className="bg-emerald-50/40 border border-cricket-border rounded-xl p-4 space-y-4">
            <h3 className="text-xs uppercase font-extrabold text-gray-600 tracking-wider">
              Match Officials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                  Umpire 1
                </label>
                <input
                  type="text"
                  value={form.referee_1_name}
                  onChange={(e) =>
                    handleChange("referee_1_name", e.target.value)
                  }
                  className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
                  placeholder="e.g. Kumar Dharmasena"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                  Umpire 2
                </label>
                <input
                  type="text"
                  value={form.referee_2_name}
                  onChange={(e) =>
                    handleChange("referee_2_name", e.target.value)
                  }
                  className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
                  placeholder="e.g. Richard Illingworth"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                Match Referee
              </label>
              <input
                type="text"
                value={form.match_referee_name}
                onChange={(e) =>
                  handleChange("match_referee_name", e.target.value)
                }
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
                placeholder="e.g. Javagal Srinath"
              />
            </div>
          </div>

          {/* Result */}
          <div>
            <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
              Match Result{" "}
              <span className="normal-case font-normal">
                (optional — usually set once the match is played)
              </span>
            </label>
            <input
              type="text"
              value={form.result}
              onChange={(e) => handleChange("result", e.target.value)}
              placeholder="e.g. India won by 6 wickets"
              className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none transition"
            />
          </div>

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