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
  register as registerRequest,
  logout as logoutRequest,
  getCurrentUser,
} from "../api/auth";

const AuthContext = createContext(null);

// Restores the session synchronously at startup so the app can decide on the
// very first render whether the user is authenticated (no flash of the login
// page when a valid session already exists).
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

  // On mount, validate the persisted session against the auth service. For the
  // mock this resolves immediately; a real backend would re-validate the token.
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
    () => ({ user, isReady, isAuthenticated: !!user, login, register, logout }),
    [user, isReady, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Convenience hook to consume auth state anywhere in the app. Co-located with
// the provider for a single import surface.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
