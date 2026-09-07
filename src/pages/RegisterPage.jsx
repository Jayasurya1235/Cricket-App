import { useState, useRef } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Trophy,
  Sparkles,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  UserPlus,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  Send,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { extractErrorMessage } from "../api/client";
import GoogleSignInButton from "../components/GoogleSignInButton";

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
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
              currentStep > step.key
                ? "bg-emerald-600 text-white"
                : currentStep === step.key
                  ? "bg-emerald-600 text-white ring-2 ring-emerald-300"
                  : "bg-gray-200 text-gray-500"
            }`}
          >
            {currentStep > step.key ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              step.key + 1
            )}
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-8 h-0.5 rounded ${
                currentStep > step.key ? "bg-emerald-600" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function RegisterPage() {
  const {
    isAuthenticated,
    register,
    googleLogin,
    sendRegisterOtp,
    verifyRegisterOtp,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const otpInputRef = useRef(null);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  async function handleSendOtp(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await sendRegisterOtp(email);
      setStep(STEPS.OTP);
      setTimeout(() => otpInputRef.current?.focus(), 100);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await verifyRegisterOtp({ email, otp_code: otpCode });
      setStep(STEPS.DETAILS);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResendOtp() {
    setError("");
    setSubmitting(true);
    try {
      await sendRegisterOtp(email);
      setOtpCode("");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
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
        email,
        password,
        full_name: fullName.trim() || undefined,
      });
      navigate(from, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleToken(idToken, profile) {
    setError("");
    try {
      await googleLogin(idToken, profile);
      navigate(from, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-wider flex items-center justify-center gap-1.5">
              cricket
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            </h1>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest">
              Pro League Admin
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-cricket-border rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
          <StepIndicator currentStep={step} />

          {/* Step 1: Email */}
          {step === STEPS.EMAIL && (
            <>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Create account
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Enter your email to get started. We&apos;ll send a verification
                  code.
                </p>
              </div>

              <GoogleSignInButton
                onToken={handleGoogleToken}
                onError={setError}
              />

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-cricket-border"></div>
                <span className="text-[11px] uppercase font-bold text-gray-400">
                  or continue with email
                </span>
                <div className="flex-1 h-px bg-cricket-border"></div>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      autoFocus
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none transition"
                      placeholder="you@cricketapp.in"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-xs">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !email.trim()}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? "Sending code..." : "Send Verification Code"}
                </button>
              </form>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === STEPS.OTP && (
            <>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Verify your email
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  We sent a verification code to{" "}
                  <span className="font-semibold text-gray-700">{email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                    Verification Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      ref={otpInputRef}
                      type="text"
                      required
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      autoFocus
                      value={otpCode}
                      onChange={(e) => {
                        setOtpCode(e.target.value.replace(/\D/g, ""));
                        setError("");
                      }}
                      className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none transition tracking-widest font-mono"
                      placeholder="000000"
                      maxLength={10}
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-xs">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !otpCode.trim()}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {submitting ? "Verifying..." : "Verify Code"}
                </button>

                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(STEPS.EMAIL);
                      setError("");
                      setOtpCode("");
                    }}
                    className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 transition"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Change email
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={submitting}
                    className="text-emerald-600 hover:text-emerald-500 font-semibold transition disabled:opacity-50"
                  >
                    Resend code
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Step 3: Account Details */}
          {step === STEPS.DETAILS && (
            <>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Set up your account
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Email verified! Choose a password to complete registration.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      autoComplete="name"
                      autoFocus
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none transition"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg pl-9 pr-10 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none transition"
                      placeholder="At least 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-gray-500 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-cricket-dark border border-cricket-border focus:border-emerald-500 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none transition"
                      placeholder="Re-enter password"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-xs">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition"
                >
                  <UserPlus className="w-4 h-4" />
                  {submitting ? "Creating account..." : "Create Account"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-emerald-600 hover:text-emerald-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
