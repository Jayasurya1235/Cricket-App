import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Send,
  ShieldAlert,
  User,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { extractErrorMessage } from "../api/client";
import GoogleSignInButton from "../components/GoogleSignInButton";
import {
  AlertBanner,
  AuthBrand,
  AuthCard,
  AuthDivider,
  AuthFooter,
  AuthShell,
} from "../components/AuthLayout";
import {
  Button,
  Field,
  IconInput,
  IconToggleButton,
} from "../components/ui";

const STEPS = {
  EMAIL: 0,
  OTP: 1,
  DETAILS: 2,
};

function StepIndicator({ currentStep }) {
  const steps = [
    { key: STEPS.EMAIL, label: "Email" },
    { key: STEPS.OTP, label: "Verify" },
    { key: STEPS.DETAILS, label: "Details" },
  ];

  return (
    <div className="mb-6 flex items-center justify-center gap-2">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
              currentStep > step.key
                ? "bg-brand-600 text-white shadow-sm"
                : currentStep === step.key
                  ? "bg-brand-600 text-white ring-2 ring-brand-400/40"
                  : "border border-line-strong bg-surface-muted text-ink-subtle"
            }`}
          >
            {currentStep > step.key ? (
              <CheckCircle2 className="size-4" aria-hidden="true" />
            ) : (
              step.key + 1
            )}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-0.5 w-8 rounded-full transition ${
                currentStep > step.key ? "bg-brand-600" : "bg-line"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const {
    isAuthenticated,
    isReady,
    register,
    googleLogin,
    sendRegisterOtp,
    verifyRegisterOtp,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";
  const otpInputRef = useRef(null);

  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  const busy = submitting || googleBusy;

  useEffect(() => {
    if (step === STEPS.OTP) {
      const timer = window.setTimeout(() => {
        otpInputRef.current?.focus();
      }, 120);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [step]);

  if (!isReady) {
    return (
      <AuthShell>
        <div className="flex h-64 items-center justify-center">
          <span className="size-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </AuthShell>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  async function handleSendOtp(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await sendRegisterOtp(email.trim());
      setStep(STEPS.OTP);
      // Must clear here too: `busy` drives `disabled` on the whole OTP step,
      // so leaving it set locks the user out of the code they just requested.
      setSubmitting(false);
    } catch (err) {
      setError(extractErrorMessage(err));
      setSubmitting(false);
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // The endpoint answers 200 with { message, verified }. A 200 does not
      // mean the code was accepted, so the flag has to be checked before
      // advancing — otherwise registration is attempted with an unverified
      // email and the backend rejects it with "Email is not verified".
      const result = await verifyRegisterOtp({
        email: email.trim(),
        otp_code: otpCode.trim(),
      });

      if (result && result.verified === false) {
        setError(result.message || "That verification code is not valid.");
        setSubmitting(false);
        return;
      }

      setStep(STEPS.DETAILS);
      setSubmitting(false);
    } catch (err) {
      setError(extractErrorMessage(err));
      setSubmitting(false);
    }
  }

  async function handleResendOtp() {
    setError("");
    setSubmitting(true);
    try {
      await sendRegisterOtp(email.trim());
      setOtpCode("");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await register({
        email: email.trim(),
        password,
        full_name: fullName.trim() || undefined,
      });
      navigate(from, { replace: true });
    } catch (err) {
      // The backend requires a verified email. If the code expired or was
      // never accepted, send the user back to the OTP step instead of
      // stranding them on a profile form they cannot resubmit.
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;
      if (
        (status === 400 || status === 403) &&
        typeof detail === "string" &&
        /not verified/i.test(detail)
      ) {
        setStep(STEPS.OTP);
        setOtpCode("");
      }
      setError(extractErrorMessage(err));
      setSubmitting(false);
    }
  }

  async function handleGoogleToken(idToken, profile) {
    setError("");
    setGoogleBusy(true);
    try {
      await googleLogin(idToken, profile);
      navigate(from, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
      setGoogleBusy(false);
    }
  }

  return (
    <AuthShell>
      <div className="mb-6">
        <AuthBrand />
        <StepIndicator currentStep={step} />
      </div>

      <AuthCard>
        {step === STEPS.EMAIL && (
          <>
            <div className="mb-6">
              <h1 className="text-xl font-bold tracking-tight text-ink">
                Create account
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-subtle">
                Enter your email to get started. We’ll send a verification code.
              </p>
            </div>

            <GoogleSignInButton
              onToken={handleGoogleToken}
              onError={(message) => message && setError(message)}
              onBusyChange={setGoogleBusy}
            />

            <AuthDivider />

            <form onSubmit={handleSendOtp} className="space-y-4">
              {error && (
                <AlertBanner>
                  <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </AlertBanner>
              )}

              <Field label="Email address">
                <IconInput
                  type="email"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  inputMode="email"
                  icon={Mail}
                  placeholder="you@cricketapp.in"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  disabled={busy}
                />
              </Field>

              <Button
                type="submit"
                size="lg"
                fullWidth
                loading={submitting}
                disabled={busy || !email.trim()}
              >
                <Send className="size-4" aria-hidden="true" />
                {submitting ? "Sending code…" : "Send verification code"}
              </Button>
            </form>
          </>
        )}

        {step === STEPS.OTP && (
          <>
            <div className="mb-6 flex items-start gap-3">
              <button
                type="button"
                onClick={() => setStep(STEPS.EMAIL)}
                aria-label="Go back to email step"
                className="mt-0.5 flex size-9 items-center justify-center rounded-lg border border-line-strong bg-surface-muted text-ink-subtle transition hover:bg-surface-sunken hover:text-ink"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
              </button>
              <div className="min-w-0">
                <h1 className="text-xl font-bold tracking-tight text-ink">
                  Verify your email
                </h1>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-subtle">
                  We sent a verification code to{" "}
                  <span className="font-semibold text-ink">{email}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {error && (
                <AlertBanner>
                  <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </AlertBanner>
              )}

              <Field label="Verification code">
                <IconInput
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={10}
                  icon={KeyRound}
                  placeholder="123456"
                  value={otpCode}
                  onChange={(event) => {
                    const next = event.target.value.replace(/\D/g, "");
                    setOtpCode(next);
                    setError("");
                  }}
                  disabled={busy}
                />
              </Field>

              <div className="flex items-center justify-between text-[13px]">
                <span className="text-ink-subtle">Didn&apos;t get it?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={busy}
                  className="rounded font-semibold text-brand-700 underline underline-offset-4 transition hover:text-brand-800 disabled:opacity-60"
                >
                  Resend code
                </button>
              </div>

              <Button
                type="submit"
                size="lg"
                fullWidth
                loading={submitting}
                disabled={busy || otpCode.length < 4}
              >
                Verify and continue
              </Button>
            </form>
          </>
        )}

        {step === STEPS.DETAILS && (
          <>
            <div className="mb-6">
              <h1 className="text-xl font-bold tracking-tight text-ink">
                Complete your profile
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-subtle">
                Set your name and password to finish creating your account.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <AlertBanner>
                  <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </AlertBanner>
              )}

              <Field label="Full name (optional)">
                <IconInput
                  type="text"
                  name="fullName"
                  autoComplete="name"
                  autoFocus
                  icon={User}
                  placeholder="Your name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  disabled={busy}
                />
              </Field>

              <Field label="Password">
                <IconInput
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  autoComplete="new-password"
                  icon={Lock}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  disabled={busy}
                  trailing={
                    <IconToggleButton
                      label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((visible) => !visible)}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" aria-hidden="true" />
                      ) : (
                        <Eye className="size-4" aria-hidden="true" />
                      )}
                    </IconToggleButton>
                  }
                />
              </Field>

              <Field label="Confirm password">
                <IconInput
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  autoComplete="new-password"
                  icon={Lock}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setError("");
                  }}
                  disabled={busy}
                />
              </Field>

              <Button
                type="submit"
                size="lg"
                fullWidth
                loading={submitting}
                disabled={busy}
              >
                Create account
              </Button>
            </form>
          </>
        )}
      </AuthCard>

      <AuthFooter>
        Already have an account?{" "}
        <Link
          to="/login"
          className="rounded font-semibold text-brand-700 underline underline-offset-4 transition hover:text-brand-800"
        >
          Sign in
        </Link>
      </AuthFooter>
    </AuthShell>
  );
}