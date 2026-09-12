import { useRef, useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useLocations } from "../hooks/useLocations";
import { useLevels } from "../hooks/useLevels";
import { useTeam } from "../hooks/useTeam";
import { useCreateTeam } from "../hooks/useCreateTeam";
import { useUpdateTeam } from "../hooks/useUpdateTeam";
import { teamsApi } from "../api/teams";
import { extractErrorMessage } from "../api/client";
import { ArrowLeft, Shield, Sparkles, Camera, X } from "lucide-react";

const EMPTY_FORM = {
  name: "",
  short_name: "",
  homeground: "",
  founder: "",
  founded_year: "",
  owner: "",
  country_id: "",
  state_id: "",
  city_id: "",
  level_id: "",
};

function buildInitial(team) {
  if (!team) return EMPTY_FORM;
  return {
    name: team.name ?? "",
    short_name: team.short_name ?? "",
    homeground: team.homeground ?? "",
    founder: team.founder ?? "",
    founded_year: team.founded_year ?? "",
    owner: team.owner ?? "",
    country_id: team.country_id ?? "",
    state_id: team.state_id ?? "",
    city_id: team.city_id ?? "",
    level_id: team.level_id ?? "",
  };
}

function TeamForm({ team, isEdit, teamId }) {
  const navigate = useNavigate();
  const { data: countries } = useLocations();
  const { data: levels } = useLevels();
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();

  const [form, setForm] = useState(() => buildInitial(team));

  const [formError, setFormError] = useState("");
  const logoInputRef = useRef(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(team?.logo || team?.logo_url || "");

  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const selectedCountry = countries?.find(
    (c) => c.id === Number(form.country_id),
  );

  const selectedState = selectedCountry?.states?.find(
    (s) => s.id === Number(form.state_id),
  );

  function handleLogoChange(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("Please choose an image file (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError("Image file is too large. Maximum size is 5 MB.");
      return;
    }
    setFormError("");
    setLogoFile(file);
    if (logoPreview && logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(URL.createObjectURL(file));
  }

  function handleRemoveLogo() {
    if (logoPreview && logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoFile(null);
    setLogoPreview("");
    if (logoInputRef.current) logoInputRef.current.value = "";
  }

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

    try {
      const payload = {
        ...form,
        founded_year: Number(form.founded_year),
        country_id: Number(form.country_id),
        state_id: Number(form.state_id),
        city_id: Number(form.city_id),
        level_id: Number(form.level_id),
      };
      if (isEdit) {
        await updateTeam.mutateAsync({ id: teamId, data: payload });
        if (logoFile) {
          await teamsApi.uploadLogo(teamId, logoFile);
        }
        navigate(`/teams/${teamId}`);
      } else {
        const newTeam = await createTeam.mutateAsync(payload);
        if (logoFile) {
          await teamsApi.uploadLogo(newTeam.id, logoFile);
        }
        navigate(`/teams/${newTeam.id}`);
      }
    } catch (err) {
      setFormError(extractErrorMessage(err));
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        to={isEdit ? `/teams/${teamId}` : "/teams"}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-emerald-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        {isEdit ? "Back to Team" : "Back to Teams"}
      </Link>

      <div className="bg-cricket-card border border-cricket-border rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-1.5">
              {isEdit ? "Edit Team Profile" : "Register Team Profile"}
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            </h1>
            <p className="text-xs text-gray-500">
              {isEdit
                ? "Update team details, home grounds, and assigned levels."
                : "Establish a new cricket team, designate home grounds, and assign levels."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                Official Team Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none transition"
                placeholder="e.g. Royal Kings"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                Short Code (Abbreviation)
              </label>
              <input
                type="text"
                required
                value={form.short_name}
                onChange={(e) => handleChange("short_name", e.target.value)}
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none transition"
                placeholder="e.g. RKS"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                Home Stadium / Ground
              </label>
              <input
                type="text"
                required
                value={form.homeground}
                onChange={(e) => handleChange("homeground", e.target.value)}
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none transition"
                placeholder="e.g. Lords Cricket Ground"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                Club Founder
              </label>
              <input
                type="text"
                required
                value={form.founder}
                onChange={(e) => handleChange("founder", e.target.value)}
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none transition"
                placeholder="e.g. James Arthur"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                Founded Year
              </label>
              <input
                type="number"
                required
                value={form.founded_year}
                onChange={(e) => handleChange("founded_year", e.target.value)}
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none transition"
                placeholder="e.g. 2020"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                Club Owner
              </label>
              <input
                type="text"
                required
                value={form.owner}
                onChange={(e) => handleChange("owner", e.target.value)}
                className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none transition"
                placeholder="e.g. Reliance Sports Group"
              />
            </div>
          </div>

          {/* Level Dropdown */}
          <div>
            <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
              Team Level / Division
            </label>
            <select
              required
              value={form.level_id}
              onChange={(e) => handleChange("level_id", e.target.value)}
              className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
            >
              <option value="" className="bg-cricket-card">
                Select league level
              </option>
              {levels?.map((lvl) => (
                <option key={lvl.id} value={lvl.id} className="bg-cricket-card">
                  {lvl.name}
                </option>
              ))}
            </select>
            {(!levels || levels.length === 0) && (
              <p className="text-[10px] text-amber-600 mt-1.5">
                No team levels exist yet. Please configure team levels first.
              </p>
            )}
          </div>

          {/* Location Dropdowns */}
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
                State / Province
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
                City / Town
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

          {/* Team Logo Upload */}
          <div>
            <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
              Team Image
              <span className="normal-case font-normal"> (optional)</span>
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-xl bg-cricket-dark border border-cricket-border overflow-hidden flex items-center justify-center shrink-0">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Team logo preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Shield className="w-7 h-7 text-gray-400" />
                )}
                {logoPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow transition"
                    title="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleLogoChange(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  <Camera className="w-3.5 h-3.5" />
                  {logoPreview ? "Change Image" : "Upload Image"}
                </button>
                <p className="text-[11px] text-gray-400">
                  JPG, PNG or WebP up to 5 MB.
                </p>
              </div>
            </div>
          </div>

          {formError && <p className="text-red-500 text-xs">{formError}</p>}

          <div className="pt-2">
            <button
              type="submit"
              disabled={createTeam.isPending || updateTeam.isPending}
              className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition"
            >
              {createTeam.isPending || updateTeam.isPending
                ? isEdit
                  ? "Saving changes..."
                  : "Creating profile..."
                : isEdit
                  ? "Save Changes"
                  : "Register Club"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddTeamPage() {
  const { teamId } = useParams();
  const isEdit = Boolean(teamId);
  const { data: team, isLoading: teamLoading } = useTeam(teamId);

  if (isEdit && teamLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4 text-sm">
          Initializing team form assets...
        </p>
      </div>
    );
  }

  return (
    <TeamForm
      key={isEdit ? team?.id : "new"}
      team={team}
      isEdit={isEdit}
      teamId={teamId}
    />
  );
}

export default AddTeamPage;
