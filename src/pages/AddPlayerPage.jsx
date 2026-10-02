import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, Key, Send } from "lucide-react";
import { useLocations } from "../hooks/useLocations";
import { useCountryCodes } from "../hooks/useCountryCodes";
import { useLevels } from "../hooks/useLevels";
import { useTeams } from "../hooks/useTeams";
import { useCreatePlayer } from "../hooks/useCreatePlayer";
import { useVerifyOtp } from "../hooks/useVerifyOtp";
import { useResendOtp } from "../hooks/useResendOtp";
import { useAssignPlayerToTeam } from "../hooks/useAssignPlayerToTeam";
import { extractErrorMessage } from "../api/client";
import PlayerFormFields from "../components/PlayerFormFields";
import {
  Button,
  Card,
  Field,
  Input,
  LoadingState,
  PageHeader,
} from "../components/ui";

const EMPTY_FORM = {
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
};

function AddPlayerPage() {
  const navigate = useNavigate();
  const { data: countries, isLoading: locationsLoading } = useLocations();
  const { data: countryCodes, isLoading: codesLoading } = useCountryCodes();
  const { data: levels, isLoading: levelsLoading } = useLevels();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const createPlayer = useCreatePlayer();
  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendOtp();
  const assignPlayerToTeam = useAssignPlayerToTeam();

  const [step, setStep] = useState("form");
  const [createdPlayer, setCreatedPlayer] = useState(null);
  const [otpCode, setOtpCode] = useState("");
  const [formError, setFormError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const otpInputRef = useRef(null);

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

    // Every one of these is required by PlayerCreate. Validate before the
    // payload is built: Number("") is 0, not NaN, so an untouched select
    // would otherwise be sent as a plausible-looking id of 0.
    const required = [
      ["first_name", "First name"],
      ["last_name", "Last name"],
      ["date_of_birth", "Date of birth"],
      ["gender", "Gender"],
      ["batting_hand", "Batting hand"],
      ["batting_position", "Batting position"],
      ["bowling_hand", "Bowling hand"],
      ["bowling_type", "Bowling action / type"],
      ["country_id", "Country"],
      ["state_id", "State"],
      ["city_id", "City"],
      ["country_code", "Country code"],
      ["mobile_number", "Mobile number"],
      ["email", "Email address"],
    ];
    const missing = required.find(([field]) => !String(form[field]).trim());
    if (missing) {
      setFormError(`${missing[1]} is required.`);
      return;
    }

    if (!/^\d{7,15}$/.test(form.mobile_number)) {
      setFormError("Mobile number must contain 7 to 15 digits.");
      return;
    }
    if (Number(form.height) <= 0 || Number(form.weight) <= 0) {
      setFormError("Height and weight must be greater than zero.");
      return;
    }

    try {
      const { team_id, level_id, role, ...playerFields } = form;

      const payload = {
        ...playerFields,
        profile_image: form.profile_image || null,
        country_id: Number(form.country_id),
        state_id: Number(form.state_id),
        city_id: Number(form.city_id),
        height: Number(form.height),
        weight: Number(form.weight),
        // The backend types mobile_number as a string (PlayerCreate and
        // PlayerResponse). Coercing it to a number drops leading zeroes and
        // breaks the later /verify-otp lookup, which matches on the string.
        mobile_number: form.mobile_number.trim(),
      };

      const result = await createPlayer.mutateAsync(payload);

      if (team_id && level_id) {
        await assignPlayerToTeam.mutateAsync({
          playerId: result.id,
          team_id: Number(team_id),
          level_id: Number(level_id),
          role: role || "playing_11",
        });
      }

      setCreatedPlayer(result);
      setSuccessMessage("Player registered successfully!");
      setStep("otp");
      otpInputRef.current?.focus();
    } catch (err) {
      setFormError(extractErrorMessage(err));
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
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
    return <LoadingState label="Initializing athlete registry assets…" />;
  }

  // -------- OTP VERIFICATION SCREEN --------
  if (step === "otp") {
    return (
      <div className="mx-auto max-w-md">
        <Card className="space-y-5 p-6 md:p-8">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-warning-line bg-warning-bg text-warning">
              <Key className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-lg font-semibold text-ink">
                Verify Phone Number
              </h1>
              <p className="text-[13px] text-ink-subtle">
                OTP code authentication required.
              </p>
            </div>
          </div>

          <p className="text-[13px] leading-relaxed text-ink-muted">
            We have sent a verification code to{" "}
            <strong className="text-brand-700">
              {createdPlayer.country_code} {createdPlayer.mobile_number}
            </strong>
            . Please input the OTP code below to finalize your registration.
          </p>

          {successMessage && (
            <div className="rounded-card border border-brand-200 bg-brand-50 px-3 py-2">
              <p className="text-[13px] font-semibold text-brand-800">
                {successMessage}
              </p>
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <Field label="Verification code" required>
              <Input
                ref={otpInputRef}
                name="otp_code"
                size="otp"
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter OTP code"
                value={otpCode}
                onChange={(event) => setOtpCode(event.target.value)}
              />
            </Field>

            {otpError && (
              <p
                role="alert"
                className="flex items-start gap-1.5 text-[13px] leading-snug text-danger"
              >
                <AlertCircle
                  className="mt-px size-3.5 shrink-0"
                  aria-hidden="true"
                />
                {otpError}
              </p>
            )}

            {resendMessage && (
              <p className="text-[13px] text-brand-800">{resendMessage}</p>
            )}

            <Button
              type="submit"
              fullWidth
              loading={verifyOtp.isPending}
            >
              <CheckCircle2 className="size-4" aria-hidden="true" />
              {verifyOtp.isPending ? "Verifying…" : "Verify Credentials"}
            </Button>
          </form>

          <div className="flex justify-center border-t border-line pt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              loading={resendOtp.isPending}
              onClick={handleResendOtp}
            >
              <Send className="size-3.5" aria-hidden="true" />
              {resendOtp.isPending ? "Resending…" : "Resend OTP Code"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // -------- REGISTRATION FORM SCREEN --------
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        breadcrumbs={[{ label: "Players", to: "/players" }, { label: "New" }]}
        title="Athlete Registration"
        description="Input general profiles, physical specifications, contact details and verify."
      />

      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <PlayerFormFields
            form={form}
            onChange={handleChange}
            countries={countries}
            countryCodes={countryCodes}
            levels={levels}
            teams={teams}
            showEmptyWarnings
          />

          {formError && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-card border border-danger-line bg-danger-bg px-4 py-3 text-sm text-danger"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {formError}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Button as={Link} to="/players" variant="ghost">
              Back to Players
            </Button>
            <Button type="submit" loading={createPlayer.isPending}>
              {createPlayer.isPending
                ? "Submitting application…"
                : "Onboard Athlete"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default AddPlayerPage;