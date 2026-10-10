import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import logo from "./images/logo.jpg";
import { useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { ConfirmProvider } from "./components/ui";
import { Avatar } from "./components/ui";
import { cn } from "./utils/cn";
import {
  NAV_ITEMS,
  QUICK_ACTIONS,
  isAuthRoute,
  isNavItemActive,
  resolvePageMeta,
} from "./config/navigation";
import HomePage from "./pages/HomePage";
import TeamsPage from "./pages/TeamsPage";
import PlayersPage from "./pages/PlayersPage";
import AddTeamPage from "./pages/AddTeamPage";
import TeamDetailPage from "./pages/TeamDetailPage";
import AddPlayerPage from "./pages/AddPlayerPage";
import EditPlayerPage from "./pages/EditPlayerPage";
import MatchesPage from "./pages/MatchesPage";
import MatchDetailPage from "./pages/MatchDetailPage";
import MatchSummaryPage from "./pages/MatchSummaryPage";
import PlayerDetailPage from "./pages/PlayerDetailPage";
import TeamAnalyticsPage from "./pages/TeamAnalyticsPage";
import AddMatchPage from "./pages/AddMatchPage";
import ScoringPage from "./pages/ScoringPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function Brand({ compact = false }) {
  return (
    <Link
      to="/"
      className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400"
    >
      <img
        src={logo}
        alt=""
        className={cn(
          "rounded-lg object-cover ring-1 ring-white/15",
          compact ? "size-7" : "size-9",
        )}
      />
      <span className="min-w-0">
        <span className="block text-[15px] font-bold leading-tight tracking-tight text-white">
          cricket
        </span>
        <span className="block text-[10px] font-semibold uppercase leading-tight tracking-[0.14em] text-nav-ink-muted">
          Pro League
        </span>
      </span>
    </Link>
  );
}

function NavList({ pathname, onNavigate }) {
  return (
    <>
      <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-nav-ink-muted">
        Navigation
      </p>
      <ul className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isNavItemActive(pathname, item);
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-lg py-2.5 pl-3 pr-3 text-sm font-medium",
                  "transition-colors duration-150",
                  active
                    ? "bg-white/10 text-white"
                    : "text-nav-ink-muted hover:bg-white/5 hover:text-nav-ink",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-5 w-1 shrink-0 rounded-full bg-brand-400 transition-opacity duration-150",
                    active
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-50",
                  )}
                />
                <Icon
                  className={cn(
                    "size-4 shrink-0",
                    active ? "text-brand-400" : "",
                  )}
                  aria-hidden="true"
                />
                {item.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function QuickActionList({ pathname, onNavigate }) {
  return (
    <>
      <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-nav-ink-muted">
        Quick Actions
      </p>
      <ul className="space-y-1">
        {QUICK_ACTIONS.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                  "transition-colors duration-150",
                  active
                    ? "bg-white/10 text-white"
                    : "text-nav-ink-muted hover:bg-white/5 hover:text-nav-ink",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function SidebarBody({ pathname, onNavigate, onLogout }) {
  const { user } = useAuth();
  const name = user?.full_name || user?.email || "User";

  return (
    <div className="flex h-full flex-col bg-nav">
      <div className="flex items-center px-5 py-5">
        <Brand />
      </div>

      <nav
        aria-label="Main"
        className="flex-1 space-y-6 overflow-y-auto px-4 py-2"
      >
        <NavList pathname={pathname} onNavigate={onNavigate} />
        <QuickActionList pathname={pathname} onNavigate={onNavigate} />
      </nav>

      <div className="border-t border-nav-line p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar src={user?.profile_picture} name={name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-white">
              {name}
            </p>
            <p className="truncate text-xs text-nav-ink-muted">
              {user?.email}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Log out"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg text-nav-ink-muted transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout, isReady, isAuthenticated } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const closeButtonRef = useRef(null);

  const showShell = !isAuthRoute(pathname);

  useEffect(() => {
    document.title = `${resolvePageMeta(pathname).title} · Cricket Pro League`;
  }, [pathname]);

  // Close the drawer when the route changes (including browser back/forward).
  // Adjusting during render is React's recommended pattern here; an effect would
  // trigger a cascading render on every navigation.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setDrawerOpen(false);
  }

  useEffect(() => {
    if (!drawerOpen) return undefined;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setDrawerOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const nodes = Array.from(
        drawerRef.current?.querySelectorAll(
          'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((node) => node.offsetParent !== null);
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      body.style.overflow = previousOverflow;
    };
  }, [drawerOpen]);

  async function handleLogout() {
    setDrawerOpen(false);
    await logout();
    navigate("/login", { replace: true });
  }

  if (!showShell) {
    return (
      <ConfirmProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </ConfirmProvider>
    );
  }

  const guard = (element) => <ProtectedRoute>{element}</ProtectedRoute>;

  return (
    <ConfirmProvider>
      <div className="min-h-dvh bg-canvas">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to main content
        </a>

        <div className="lg:flex">
          <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 lg:block">
            <SidebarBody
              pathname={pathname}
              onNavigate={() => setDrawerOpen(false)}
              onLogout={handleLogout}
            />
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur-md lg:hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Open navigation menu"
                  aria-expanded={drawerOpen}
                  aria-controls="app-drawer"
                  className="-ml-2 flex size-11 items-center justify-center rounded-lg text-ink-muted transition hover:bg-surface-muted hover:text-ink"
                >
                  <Menu className="size-5" aria-hidden="true" />
                </button>

                <Brand compact />
              </div>
            </header>

            <main
              id="main-content"
              tabIndex={-1}
              className="flex-1 px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-10"
            >
              <div className="mx-auto w-full max-w-7xl">
                <Routes>
                  <Route path="/" element={guard(<HomePage />)} />
                  <Route path="/teams" element={guard(<TeamsPage />)} />
                  <Route path="/players" element={guard(<PlayersPage />)} />
                  <Route path="/matches" element={guard(<MatchesPage />)} />
                  <Route path="/teams/new" element={guard(<AddTeamPage />)} />
                  <Route
                    path="/teams/:teamId/edit"
                    element={guard(<AddTeamPage />)}
                  />
                  <Route
                    path="/teams/:teamId/analytics"
                    element={guard(<TeamAnalyticsPage />)}
                  />
                  <Route
                    path="/teams/:teamId"
                    element={guard(<TeamDetailPage />)}
                  />
                  <Route path="/players/new" element={guard(<AddPlayerPage />)} />
                  <Route
                    path="/players/:playerId/edit"
                    element={guard(<EditPlayerPage />)}
                  />
                  <Route
                    path="/players/:playerId"
                    element={guard(<PlayerDetailPage />)}
                  />
                  <Route path="/matches/new" element={guard(<AddMatchPage />)} />
                  <Route
                    path="/matches/:matchId"
                    element={guard(<MatchDetailPage />)}
                  />
                  <Route
                    path="/matches/:matchId/summary"
                    element={guard(<MatchSummaryPage />)}
                  />
                  <Route
                    path="/matches/:matchId/score"
                    element={guard(<ScoringPage />)}
                  />
                  <Route
                    path="*"
                    element={
                      <div className="py-20 text-center">
                        <p className="text-lg font-semibold text-ink">
                          Page not found
                        </p>
                        <p className="mt-1 text-sm text-ink-subtle">
                          The page you are looking for does not exist.
                        </p>
                        <Link
                          to="/"
                          className="mt-5 inline-flex items-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                        >
                          Back to dashboard
                        </Link>
                      </div>
                    }
                  />
                </Routes>
              </div>
            </main>
          </div>
        </div>

        {drawerOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <div
              className="absolute inset-0 animate-fade-in bg-ink/50 backdrop-blur-[2px]"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <div
              id="app-drawer"
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              className="relative flex h-full w-72 max-w-[85vw] flex-col animate-slide-in-right bg-nav shadow-modal"
            >
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation menu"
                className="absolute right-2 top-3 flex size-11 items-center justify-center rounded-lg text-nav-ink-muted transition hover:bg-white/10 hover:text-white"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
              <SidebarBody
                pathname={pathname}
                onNavigate={() => setDrawerOpen(false)}
                onLogout={handleLogout}
              />
            </div>
          </div>
        )}

        {!isReady && (
          <div
            className="pointer-events-none fixed inset-x-0 bottom-0 z-40 bg-canvas px-4 py-1 text-center text-xs text-ink-subtle"
            aria-live="polite"
          >
            Restoring your session…
          </div>
        )}

        {!isAuthenticated && isReady && (
          <div
            className="pointer-events-none fixed inset-x-0 bottom-0 z-40 bg-canvas px-4 py-1 text-center text-xs text-ink-subtle"
            aria-live="polite"
          >
            Session expired — redirecting to sign in…
          </div>
        )}
      </div>
    </ConfirmProvider>
  );
}

export default App;