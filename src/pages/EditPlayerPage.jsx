import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { usePlayer } from "../hooks/usePlayer";
import { useLocations } from "../hooks/useLocations";
import { useCountryCodes } from "../hooks/useCountryCodes";
import { useLevels } from "../hooks/useLevels";
import { useTeams } from "../hooks/useTeams";
import { useUpdatePlayer } from "../hooks/useUpdatePlayer";
import { useDeletePlayer } from "../hooks/useDeletePlayer";
import { extractErrorMessage } from "../api/client";
import { ArrowLeft, User, Sparkles, Trash2, ShieldAlert } from "lucide-react";

const PLAYER_ROLES = [
  { value: "playing_11", label: "Playing XI" },
  { value: "substitute", label: "Substitute" },
  { value: "coach", label: "Coach" },
  { value: "support_staff", label: "Support Staff" },
];

function buildInitial(player) {
  return {
    first_name: player.first_name ?? "",
    last_name: player.last_name ?? "",
    date_of_birth: player.date_of_birth ?? "",
    gender: player.gender ?? "",
    profile_image: player.profile_image ?? "",
    batting_hand: player.batting_hand ?? "",
    batting_position: player.batting_position ?? "",
    bowling_hand: player.bowling_hand ?? "",
    bowling_type: player.bowling_type ?? "",
    country_id: player.country_id ?? "",
    state_id: player.state_id ?? "",
    city_id: player.city_id ?? "",
    height: player.height ?? "",
    weight: player.weight ?? "",
    country_code: player.country_code ?? "",
    mobile_number: player.mobile_number ?? "",
    email: player.email ?? "",
    team_id: player.team_id ?? "",
    level_id: player.level_id ?? "",
    role: player.role ?? "playing_11",
  };
}

function EditPlayerForm({ player, playerId }) {
  const navigate = useNavigate();
  const { data: countries } = useLocations();
  const { data: countryCodes } = useCountryCodes();
  const { data: levels } = useLevels();
  const { data: teams } = useTeams();
  const updatePlayer = useUpdatePlayer();
  const deletePlayer = useDeletePlayer();

  const [form, setForm] = useState(() => buildInitial(player));
  const [formError, setFormError] = useState("");

  const selectedCountry = countries?.find(
    (c) => c.id === Number(form.country_id),
  );
  const selectedState = selectedCountry?.states?.find(
    (s) => s.id === Number(form.state_id),
  );

  function handleChange(field, value) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "country_id") {
        updated.state_id = "";
        updated.city_id = "";
      }
      if (field === "state_id") {
        updated.city_id = "";
      }
      return updated;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!/^\d{7,15}$/.test(form.mobile_number)) {
      setFormError("Mobile number must contain 7 to 15 digits.");
      return;
    }

    if (Number(form.height) <= 0 || Number(form.weight) <= 0) {
      setFormError("Height and weight must be greater than zero.");
      return;
    }

    try {
      const payload = {
        ...form,
        profile_image: form.profile_image || null,
        country_id: form.country_id ? Number(form.country_id) : null,
        state_id: form.state_id ? Number(form.state_id) : null,
        city_id: form.city_id ? Number(form.city_id) : null,
        height: form.height ? Number(form.height) : null,
        weight: form.weight ? Number(form.weight) : null,
        mobile_number: form.mobile_number
          ? Number(form.mobile_number)
          : null,
        team_id: form.team_id ? Number(form.team_id) : null,
        level_id: form.level_id ? Number(form.level_id) : null,
        role: form.role || "playing_11",
      };
      await updatePlayer.mutateAsync({ id: playerId, data: payload });
      navigate("/players");
    } catch (err) {
      setFormError(extractErrorMessage(err));
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        `Delete player "${form.first_name} ${form.last_name}"? This cannot be undone.`,
      )
    )
      return;
    try {
      await deletePlayer.mutateAsync(playerId);
      navigate("/players");
    } catch (err) {
      alert(`Failed to delete player: ${extractErrorMessage(err)}`);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        to="/players"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-emerald-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Players
      </Link>

      <div className="bg-cricket-card border border-cricket-border rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-1.5">
              Edit Athlete Profile
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            </h1>
            <p className="text-xs text-gray-500">
              Update general profiles, physical specifications, contact details
              and team assignment.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                First Name
              </label>
              <input
                type="text"
                required
                value={form.first_name}
                onChange={(e) => handleChange("first_name", e.target.value)}
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none transition"
                placeholder="e.g. Virat"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                required
                value={form.last_name}
                onChange={(e) => handleChange("last_name", e.target.value)}
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none transition"
                placeholder="e.g. Kohli"
              />
            </div>
          </div>

          {/* DOB & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                Date of Birth
              </label>
              <input
                type="date"
                required
                value={form.date_of_birth}
                onChange={(e) => handleChange("date_of_birth", e.target.value)}
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                Gender
              </label>
              <select
                required
                value={form.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
              >
                <option value="" className="bg-cricket-card">
                  Select gender
                </option>
                <option value="Male" className="bg-cricket-card">Male</option>
                <option value="Female" className="bg-cricket-card">Female</option>
                <option value="Other" className="bg-cricket-card">Other</option>
              </select>
            </div>
          </div>

          {/* Optional profile image URL */}
          <div>
            <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
              Profile Image URL{" "}
              <span className="normal-case font-normal">(optional)</span>
            </label>
            <input
              type="url"
              value={form.profile_image}
              onChange={(e) => handleChange("profile_image", e.target.value)}
              className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none transition"
              placeholder="https://example.com/player-photo.jpg"
            />
          </div>

          {/* Batting Attributes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                Batting Hand
              </label>
              <select
                required
                value={form.batting_hand}
                onChange={(e) => handleChange("batting_hand", e.target.value)}
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
              >
                <option value="" className="bg-cricket-card">Select</option>
                <option value="Right" className="bg-cricket-card">Right</option>
                <option value="Left" className="bg-cricket-card">Left</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                Batting Position
              </label>
              <input
                type="text"
                required
                value={form.batting_position}
                onChange={(e) => handleChange("batting_position", e.target.value)}
                placeholder="e.g. Opener, Middle Order"
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Bowling Attributes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                Bowling Hand
              </label>
              <select
                required
                value={form.bowling_hand}
                onChange={(e) => handleChange("bowling_hand", e.target.value)}
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
              >
                <option value="" className="bg-cricket-card">Select</option>
                <option value="Right" className="bg-cricket-card">Right</option>
                <option value="Left" className="bg-cricket-card">Left</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                Bowling Action / Type
              </label>
              <input
                type="text"
                required
                value={form.bowling_type}
                onChange={(e) => handleChange("bowling_type", e.target.value)}
                placeholder="e.g. Right-arm Fast, Leg Spin"
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Physical Attributes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                Height (cm)
              </label>
              <input
                type="number"
                required
                value={form.height}
                onChange={(e) => handleChange("height", e.target.value)}
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none transition"
                placeholder="e.g. 175"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                Weight (kg)
              </label>
              <input
                type="number"
                required
                value={form.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none transition"
                placeholder="e.g. 70"
              />
            </div>
          </div>

          {/* Location Attributes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                Country
              </label>
              <select
                required
                value={form.country_id}
                onChange={(e) => handleChange("country_id", e.target.value)}
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
              >
                <option value="" className="bg-cricket-card">Select country</option>
                {countries?.map((c) => (
                  <option key={c.id} value={c.id} className="bg-cricket-card">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                State
              </label>
              <select
                required
                disabled={!selectedCountry}
                value={form.state_id}
                onChange={(e) => handleChange("state_id", e.target.value)}
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 disabled:opacity-40 focus:outline-none transition"
              >
                <option value="" className="bg-cricket-card">Select state</option>
                {selectedCountry?.states?.map((s) => (
                  <option key={s.id} value={s.id} className="bg-cricket-card">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                City
              </label>
              <select
                required
                disabled={!selectedState}
                value={form.city_id}
                onChange={(e) => handleChange("city_id", e.target.value)}
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 disabled:opacity-40 focus:outline-none transition"
              >
                <option value="" className="bg-cricket-card">Select city</option>
                {selectedState?.cities?.map((city) => (
                  <option key={city.id} value={city.id} className="bg-cricket-card">
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Team Assignment */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-5 rounded bg-emerald-500" />
              <span className="text-[11px] uppercase font-bold text-gray-500">
                Team Assignment
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                  Team
                </label>
                <select
                  required
                  value={form.team_id}
                  onChange={(e) => handleChange("team_id", e.target.value)}
                  className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
                >
                  <option value="" className="bg-cricket-card">Select team</option>
                  {teams?.map((t) => (
                    <option key={t.id} value={t.id} className="bg-cricket-card">
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                  Level
                </label>
                <select
                  required
                  value={form.level_id}
                  onChange={(e) => handleChange("level_id", e.target.value)}
                  className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
                >
                  <option value="" className="bg-cricket-card">Select level</option>
                  {levels?.map((lvl) => (
                    <option key={lvl.id} value={lvl.id} className="bg-cricket-card">
                      {lvl.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
                >
                  {PLAYER_ROLES.map((r) => (
                    <option key={r.value} value={r.value} className="bg-cricket-card">
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contact details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                Code
              </label>
              <select
                required
                value={form.country_code}
                onChange={(e) => handleChange("country_code", e.target.value)}
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
              >
                <option value="" className="bg-cricket-card">--</option>
                {countryCodes?.map((cc) => (
                  <option key={cc.code} value={cc.code} className="bg-cricket-card">
                    {cc.code}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                Mobile Number
              </label>
              <input
                type="text"
                required
                value={form.mobile_number}
                onChange={(e) => handleChange("mobile_number", e.target.value)}
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none transition"
                placeholder="e.g. 9876543210"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none transition"
              placeholder="e.g. player@leaguedomain.com"
            />
          </div>

          {formError && <p className="text-red-500 text-xs">{formError}</p>}

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={updatePlayer.isPending}
              className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition"
            >
              {updatePlayer.isPending ? "Saving changes..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deletePlayer.isPending}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-600 border border-red-200 hover:border-transparent text-red-600 hover:text-white rounded-lg text-sm font-bold transition disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {deletePlayer.isPending ? "Deleting..." : "Delete Player"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditPlayerPage() {
  const { playerId } = useParams();
  const { data: player, isLoading: playerLoading, isError, error } =
    usePlayer(playerId);

  if (playerLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4 text-sm">
          Loading athlete profile...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl max-w-lg mx-auto text-center">
        <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-red-500" />
        <h4 className="font-bold">Failed to load player</h4>
        <p className="text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="bg-white border border-cricket-border rounded-2xl p-12 text-center max-w-lg mx-auto space-y-3 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-emerald-500 mx-auto" />
        <h3 className="text-xl font-bold text-gray-900">Player not found</h3>
        <Link to="/players" className="text-emerald-600 hover:underline">
          Return to Players Directory
        </Link>
      </div>
    );
  }

  return (
    <EditPlayerForm
      key={player.id}
      player={player}
      playerId={playerId}
    />
  );
}

export default EditPlayerPage;
