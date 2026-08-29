import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLocations } from "../hooks/useLocations";
import { useCountryCodes } from "../hooks/useCountryCodes";
import { useLevels } from "../hooks/useLevels";
import { useTeams } from "../hooks/useTeams";
import { useCreatePlayer } from "../hooks/useCreatePlayer";
import { useVerifyOtp } from "../hooks/useVerifyOtp";
import { useResendOtp } from "../hooks/useResendOtp";
import { extractErrorMessage } from "../api/client";
import { ArrowLeft, User, Sparkles, Key } from "lucide-react";
import { useAssignPlayerToTeam } from "../hooks/useAssignPlayerToTeam";

const PLAYER_ROLES = [
  { value: "playing_11", label: "Playing XI" },
  { value: "substitute", label: "Substitute" },
  { value: "coach", label: "Coach" },
  { value: "support_staff", label: "Support Staff" },
];

function AddPlayerPage() {
  const navigate = useNavigate();
  const { data: countries, isLoading: locationsLoading } = useLocations();
  const { data: countryCodes, isLoading: codesLoading } = useCountryCodes();
  const { data: levels, isLoading: levelsLoading } = useLevels();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const createPlayer = useCreatePlayer();
  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendOtp();

  const [step, setStep] = useState("form");
  const [createdPlayer, setCreatedPlayer] = useState(null);
  const [otpCode, setOtpCode] = useState("");
  const [formError, setFormError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendMessage, setResendMessage] = useState("");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    profile_image: "",
    batting_hand: "",
    batting_position: "",
    bowling_hand: "",
    bowling_type: "",
    country_id: "",
    state_id: "",
    city_id: "",
    height: "",
    weight: "",
    country_code: "",
    mobile_number: "",
    email: "",
    team_id: "",
    level_id: "",
    role: "",
  });
  const assignPlayerToTeam = useAssignPlayerToTeam();
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
    if (!form.team_id) {
      setFormError("Please select a team for the player.");
      return;
    }
    if (!form.level_id) {
      setFormError("Please select the player's level.");
      return;
    }

    try {
      // Only send fields PlayerCreate actually accepts — team_id/level_id/role
      // are NOT part of this schema, so they must go through a separate call.
      const {
        team_id,
        level_id,
        role, // pulled out, sent separately below
        ...playerFields
      } = form;

      const payload = {
        ...playerFields,
        profile_image: form.profile_image || null,
        country_id: Number(form.country_id),
        state_id: Number(form.state_id),
        city_id: Number(form.city_id),
        height: Number(form.height),
        weight: Number(form.weight),
        mobile_number: Number(form.mobile_number),
      };

      const result = await createPlayer.mutateAsync(payload);

      // Now assign the created player to their team — separate endpoint
      await assignPlayerToTeam.mutateAsync({
        playerId: result.id,
        team_id: Number(team_id),
        level_id: Number(level_id),
        role: role || "playing_11",
      });

      setCreatedPlayer(result);
      setStep("otp");
    } catch (err) {
      setFormError(extractErrorMessage(err));
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setOtpError("");

    try {
      const result = await verifyOtp.mutateAsync({
        country_code: createdPlayer.country_code,
        mobile_number: createdPlayer.mobile_number,
        otp_code: otpCode,
      });

      if (result.verified) {
        navigate("/players");
      } else {
        setOtpError(result.message || "Verification failed. Try again.");
      }
    } catch (err) {
      setOtpError(extractErrorMessage(err));
    }
  }

  async function handleResendOtp() {
    setResendMessage("");
    setOtpError("");
    try {
      const result = await resendOtp.mutateAsync(createdPlayer.id);
      setResendMessage(result.message || "OTP resent successfully.");
    } catch (err) {
      setOtpError(extractErrorMessage(err));
    }
  }

  if (locationsLoading || codesLoading || levelsLoading || teamsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4 text-sm">
          Initializing athlete registry assets...
        </p>
      </div>
    );
  }

  // -------- OTP VERIFICATION SCREEN --------
  if (step === "otp") {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="bg-cricket-card border border-cricket-border rounded-2xl p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-500">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Verify Phone Number
              </h1>
              <p className="text-xs text-gray-500">
                OTP code authentication required.
              </p>
            </div>
          </div>

          <p className="text-gray-500 text-xs leading-relaxed">
            We have sent a verification code to{" "}
            <strong className="text-emerald-600">
              {createdPlayer.country_code} {createdPlayer.mobile_number}
            </strong>
            . Please input the OTP code below to finalize your registration.
          </p>

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <input
                type="text"
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter OTP code"
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3.5 py-2 text-center text-lg tracking-widest text-gray-900 focus:outline-none transition"
              />
            </div>

            {otpError && <p className="text-red-500 text-xs">{otpError}</p>}
            {resendMessage && (
              <p className="text-green-600 text-xs">{resendMessage}</p>
            )}

            <button
              type="submit"
              disabled={verifyOtp.isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold py-2.5 transition disabled:opacity-50"
            >
              {verifyOtp.isPending ? "Verifying..." : "Verify Credentials"}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={handleResendOtp}
              disabled={resendOtp.isPending}
              className="text-xs text-emerald-600 hover:text-emerald-500 font-semibold hover:underline disabled:opacity-50"
            >
              {resendOtp.isPending ? "Resending..." : "Resend OTP Code"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------- REGISTRATION FORM SCREEN --------
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
              Athlete Registration
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            </h1>
            <p className="text-xs text-gray-500">
              Input general profiles, physical specifications, contact details
              and verify.
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
                <option value="male" className="bg-cricket-card">
                  Male
                </option>
                <option value="female" className="bg-cricket-card">
                  Female
                </option>
                <option value="other" className="bg-cricket-card">
                  Other
                </option>
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
                <option value="" className="bg-cricket-card">
                  Select
                </option>
                <option value="Right" className="bg-cricket-card">
                  Right
                </option>
                <option value="Left" className="bg-cricket-card">
                  Left
                </option>
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
                onChange={(e) =>
                  handleChange("batting_position", e.target.value)
                }
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
                <option value="" className="bg-cricket-card">
                  Select
                </option>
                <option value="Right" className="bg-cricket-card">
                  Right
                </option>
                <option value="Left" className="bg-cricket-card">
                  Left
                </option>
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
                <option value="" className="bg-cricket-card">
                  Select country
                </option>
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
                <option value="" className="bg-cricket-card">
                  Select state
                </option>
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
                <option value="" className="bg-cricket-card">
                  Select city
                </option>
                {selectedState?.cities?.map((city) => (
                  <option
                    key={city.id}
                    value={city.id}
                    className="bg-cricket-card"
                  >
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
                  <option value="" className="bg-cricket-card">
                    Select team
                  </option>
                  {teams?.map((t) => (
                    <option key={t.id} value={t.id} className="bg-cricket-card">
                      {t.name}
                    </option>
                  ))}
                </select>
                {(!teams || teams.length === 0) && (
                  <p className="text-[10px] text-amber-600 mt-1.5">
                    No teams exist yet. Please register a team first.
                  </p>
                )}
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
                  <option value="" className="bg-cricket-card">
                    Select level
                  </option>
                  {levels?.map((lvl) => (
                    <option
                      key={lvl.id}
                      value={lvl.id}
                      className="bg-cricket-card"
                    >
                      {lvl.name}
                    </option>
                  ))}
                </select>
                {(!levels || levels.length === 0) && (
                  <p className="text-[10px] text-amber-600 mt-1.5">
                    No levels exist yet. Please configure team levels first.
                  </p>
                )}
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
                    <option
                      key={r.value}
                      value={r.value}
                      className="bg-cricket-card"
                    >
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
                <option value="" className="bg-cricket-card">
                  --
                </option>
                {countryCodes?.map((cc) => (
                  <option
                    key={cc.code}
                    value={cc.code}
                    className="bg-cricket-card"
                  >
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

          <div className="pt-2">
            <button
              type="submit"
              disabled={createPlayer.isPending}
              className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition"
            >
              {createPlayer.isPending
                ? "Submitting application..."
                : "Onboard Athlete"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPlayerPage;
