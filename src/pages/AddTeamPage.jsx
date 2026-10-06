import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, ImageUp, Shield, X } from "lucide-react";
import { useLocations } from "../hooks/useLocations";
import { useLevels } from "../hooks/useLevels";
import { useTeam } from "../hooks/useTeam";
import { useCreateTeam } from "../hooks/useCreateTeam";
import { useUpdateTeam } from "../hooks/useUpdateTeam";
import { useUploadTeamLogo } from "../hooks/useUploadTeamLogo";
import { extractErrorMessage } from "../api/client";
import { teamLogo } from "../utils/teams";
import {
  Button,
  Card,
  ErrorState,
  Field,
  Input,
  LoadingState,
  PageHeader,
  Select,
} from "../components/ui";

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

const MAX_LOGO_BYTES = 5 * 1024 * 1024;

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
  const uploadLogo = useUploadTeamLogo();

  const [form, setForm] = useState(() => buildInitial(team));
  const [formError, setFormError] = useState("");
  const logoInputRef = useRef(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  // teamLogo() resolves the root-relative path the backend stores, so the
  // saved crest loads the same way it does on the team card.
  const [logoPreview, setLogoPreview] = useState(() => teamLogo(team) || "");
  // The URL whose preview failed to load, so a later upload or a fixed path
  // is still attempted instead of staying hidden behind a stale flag.
  const [failedPreview, setFailedPreview] = useState(null);
  if (failedPreview && failedPreview !== logoPreview) setFailedPreview(null);
  const showPreview = Boolean(logoPreview) && failedPreview !== logoPreview;

  const blobRef = useRef(null);

  useEffect(() => {
    return () => {
      if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    };
  }, []);

  const selectedCountry = countries?.find(
    (country) => country.id === Number(form.country_id),
  );
  const selectedState = selectedCountry?.states?.find(
    (state) => state.id === Number(form.state_id),
  );

  const isPending =
    createTeam.isPending || updateTeam.isPending || uploadLogo.isPending;
  const noLevels = !levels || levels.length === 0;

  function replacePreview(file) {
    if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    const next = URL.createObjectURL(file);
    blobRef.current = next;
    setLogoPreview(next);
  }

  function handleLogoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please choose an image file (JPG, PNG, or WebP).");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setFormError("Image file is too large. Maximum size is 5 MB.");
      return;
    }
    setFormError("");
    setLogoFile(file);
    setLogoRemoved(false);
    replacePreview(file);
  }

  function handleRemoveLogo() {
    if (blobRef.current) {
      URL.revokeObjectURL(blobRef.current);
      blobRef.current = null;
    }
    setLogoFile(null);
    // Only meaningful on edit: create has no stored logo to clear, and the
    // submitted payload sends `logo: null` so the backend actually drops it.
    setLogoRemoved(true);
    setLogoPreview("");
    if (logoInputRef.current) logoInputRef.current.value = "";
  }

  function handleChange(field, value) {
    setForm((previous) => {
      const updated = { ...previous, [field]: value };
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

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    // All of these are required by TeamCreate / TeamUpdate. Validate up front:
    // Number("") is 0 rather than NaN, so a skipped select would otherwise be
    // submitted as a plausible-looking id of 0.
    const required = [
      ["name", "Team name"],
      ["short_name", "Short name"],
      ["homeground", "Home ground"],
      ["founder", "Founder"],
      ["owner", "Owner"],
      ["founded_year", "Founded year"],
      ["country_id", "Country"],
      ["state_id", "State"],
      ["city_id", "City"],
      ["level_id", "Level"],
    ];
    const missing = required.find(([field]) => !String(form[field]).trim());
    if (missing) {
      setFormError(`${missing[1]} is required.`);
      return;
    }

    try {
      const payload = {
        ...form,
        founded_year: Number(form.founded_year),
        country_id: Number(form.country_id),
        state_id: Number(form.state_id),
        city_id: Number(form.city_id),
        level_id: Number(form.level_id),
      };

      // TeamUpdate.logo is nullable, so clearing the logo has to be explicit —
      // omitting the key leaves the stored logo untouched.
      if (isEdit && logoRemoved) payload.logo = null;

      if (isEdit) {
        await updateTeam.mutateAsync({ id: teamId, data: payload });
        if (logoFile) await uploadLogo.mutateAsync({ id: teamId, file: logoFile });
        navigate(`/teams/${teamId}`);
      } else {
        const created = await createTeam.mutateAsync(payload);
        if (logoFile) {
          await uploadLogo.mutateAsync({ id: created.id, file: logoFile });
        }
        navigate(`/teams/${created.id}`);
      }
    } catch (err) {
      setFormError(extractErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        breadcrumbs={[
          { label: "Teams", to: "/teams" },
          ...(isEdit
            ? [{ label: team?.name ?? "Team", to: `/teams/${teamId}` }]
            : []),
          { label: isEdit ? "Edit" : "New" },
        ]}
        title={isEdit ? "Edit team profile" : "Register a team"}
        description={
          isEdit
            ? "Update team details, home ground, and assigned level."
            : "Add a club, its home ground, and its league level."
        }
      />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Official team name" required>
              <Input
                name="name"
                autoComplete="organization"
                placeholder="e.g. Royal Kings"
                value={form.name}
                onChange={(event) => handleChange("name", event.target.value)}
              />
            </Field>

            <Field label="Short code" hint="2–4 letters, shown on scorecards." required>
              <Input
                name="short_name"
                autoComplete="off"
                maxLength={4}
                placeholder="e.g. RKS"
                value={form.short_name}
                onChange={(event) =>
                  handleChange("short_name", event.target.value.toUpperCase())
                }
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Home ground" required>
              <Input
                name="homeground"
                autoComplete="off"
                placeholder="e.g. Lord's Cricket Ground"
                value={form.homeground}
                onChange={(event) =>
                  handleChange("homeground", event.target.value)
                }
              />
            </Field>

            <Field label="Club founder" required>
              <Input
                name="founder"
                autoComplete="off"
                placeholder="e.g. James Arthur"
                value={form.founder}
                onChange={(event) => handleChange("founder", event.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Founded year" required>
              <Input
                name="founded_year"
                type="number"
                inputMode="numeric"
                min="1800"
                max="2100"
                placeholder="e.g. 2008"
                value={form.founded_year}
                onChange={(event) =>
                  handleChange("founded_year", event.target.value)
                }
              />
            </Field>

            <Field label="Club owner" required>
              <Input
                name="owner"
                autoComplete="organization"
                placeholder="e.g. Reliance Sports Group"
                value={form.owner}
                onChange={(event) => handleChange("owner", event.target.value)}
              />
            </Field>
          </div>

          <Field
            label="Team level"
            required
            error={noLevels ? "No levels are configured yet." : undefined}
          >
            <Select
              name="level_id"
              value={form.level_id}
              onChange={(event) => handleChange("level_id", event.target.value)}
            >
              <option value="">Select league level</option>
              {levels?.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Country" required>
              <Select
                name="country_id"
                value={form.country_id}
                onChange={(event) =>
                  handleChange("country_id", event.target.value)
                }
              >
                <option value="">Select country</option>
                {countries?.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="State / province" required>
              <Select
                name="state_id"
                disabled={!selectedCountry}
                value={form.state_id}
                onChange={(event) => handleChange("state_id", event.target.value)}
              >
                <option value="">Select state</option>
                {selectedCountry?.states?.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="City / town" required>
              <Select
                name="city_id"
                disabled={!selectedState}
                value={form.city_id}
                onChange={(event) => handleChange("city_id", event.target.value)}
              >
                <option value="">Select city</option>
                {selectedState?.cities?.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field
            label="Team logo"
            hint="JPG, PNG, or WebP up to 5 MB."
          >
            <div className="flex items-center gap-4">
              <span className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-surface-muted">
                {showPreview ? (
                  <img
                    src={logoPreview}
                    alt="Team logo preview"
                    onError={() => setFailedPreview(logoPreview)}
                    className="size-full object-cover"
                  />
                ) : (
                  <Shield className="size-7 text-ink-faint" aria-hidden="true" />
                )}
                {logoPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    aria-label="Remove logo"
                    className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-danger text-white transition hover:bg-danger/90"
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                )}
              </span>

              <div className="min-w-0">
                <input
                  ref={logoInputRef}
                  id="team-logo"
                  name="logo"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleLogoChange}
                />
                <Button
                  as="label"
                  htmlFor="team-logo"
                  variant="secondary"
                  size="sm"
                  tabIndex={0}
                >
                  <ImageUp className="size-4" aria-hidden="true" />
                  {logoPreview ? "Change image" : "Upload image"}
                </Button>
              </div>
            </div>
          </Field>

          {formError && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-card border border-danger-line bg-danger-bg px-4 py-3 text-sm text-danger"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {formError}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
            <Button as={Link} to={isEdit ? `/teams/${teamId}` : "/teams"} variant="ghost">
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              <CheckCircle2 className="size-4" aria-hidden="true" />
              {isEdit ? "Save changes" : "Register club"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function AddTeamPage() {
  const { teamId } = useParams();
  const isEdit = Boolean(teamId);
  const {
    data: team,
    isLoading: teamLoading,
    isError: teamError,
    error,
    refetch,
  } = useTeam(teamId);

  if (isEdit && teamLoading) {
    return <LoadingState label="Loading team…" />;
  }

  // Without this the edit form renders blank when the fetch fails, and
  // submitting it would PATCH empty strings over a real team.
  if (isEdit && teamError) {
    return (
      <ErrorState
        title="Couldn't load team"
        message={extractErrorMessage(error)}
        onRetry={() => refetch()}
      />
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