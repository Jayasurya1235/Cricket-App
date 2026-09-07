import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  login as loginRequest,
  googleLogin as googleLoginRequest,
  register as registerRequest,
  sendRegisterOtp as sendRegisterOtpRequest,
  verifyRegisterOtp as verifyRegisterOtpRequest,
  logout as logoutRequest,
  getCurrentUser,
} from "../api/auth";

const AuthContext = createContext(null);

function initialUser() {
  try {
    const raw = localStorage.getItem("cricket.auth.session");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => initialUser());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function validate() {
      try {
        const current = await getCurrentUser();
        if (!cancelled) setUser(current);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsReady(true);
      }
    }
    validate();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const loggedInUser = await loginRequest(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const googleLogin = useCallback(async (idToken, profile) => {
    const loggedInUser = await googleLoginRequest(idToken, profile);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const sendRegisterOtp = useCallback(async (email) => {
    return await sendRegisterOtpRequest(email);
  }, []);

  const verifyRegisterOtp = useCallback(async ({ email, otp_code }) => {
    return await verifyRegisterOtpRequest({ email, otp_code });
  }, []);

  const register = useCallback(async (details) => {
    const registeredUser = await registerRequest(details);
    setUser(registeredUser);
    return registeredUser;
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isReady,
      isAuthenticated: !!user,
      login,
      googleLogin,
      register,
      sendRegisterOtp,
      verifyRegisterOtp,
      logout,
    }),
    [user, isReady, login, googleLogin, register, sendRegisterOtp, verifyRegisterOtp, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
