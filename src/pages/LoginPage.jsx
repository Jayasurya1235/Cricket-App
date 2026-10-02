import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, LogIn, Mail, ShieldAlert } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { extractErrorMessage } from "../api/client";
import GoogleSignInButton from "../components/GoogleSignInButton";
import {
  AlertBanner,
  AuthBrand,
  AuthCard,
  AuthCardHeading,
  AuthDivider,
  AuthFooter,
  AuthShell,
} from "../components/AuthLayout";
import {
  Button,
  Field,
  IconInput,
  IconToggleButton,
  LoadingState,
} from "../components/ui";

export default function LoginPage() {
  const { isAuthenticated, isReady, login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  if (!isReady) {
    return (
      <AuthShell>
        <LoadingState label="Checking your session…" />
      </AuthShell>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const busy = submitting || googleBusy;

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      navigate(from, { replace: true });
    } catch (err) {
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
      <AuthBrand />

      <AuthCard>
        <AuthCardHeading
          title="Welcome back"
          description="Sign in to manage teams, players and matches."
        />

        <GoogleSignInButton
          onToken={handleGoogleToken}
          onError={(message) => {
            if (message) setError(message);
          }}
          onBusyChange={setGoogleBusy}
        />

        <AuthDivider />

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <AlertBanner>
              <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </AlertBanner>
          )}

          <Field label="Email address">
            <IconInput
              id="email"
              icon={Mail}
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@cricketapp.in"
              value={form.email}
              onChange={(event) => handleChange("email", event.target.value)}
              disabled={busy}
            />
          </Field>

          <Field label="Password">
            <IconInput
              id="password"
              icon={Lock}
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={(event) => handleChange("password", event.target.value)}
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

          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={submitting}
            disabled={busy}
          >
            <LogIn className="size-4" aria-hidden="true" />
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </AuthCard>

      <AuthFooter>
        Don&apos;t have an account?{" "}
        <Link
          to="/register"
          className="rounded font-semibold text-brand-700 underline underline-offset-4 transition hover:text-brand-800"
        >
          Create one
        </Link>
      </AuthFooter>
    </AuthShell>
  );
}