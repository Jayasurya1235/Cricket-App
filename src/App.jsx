import { useState } from "react";
import {
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  PlusCircle,
  UserPlus,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import logo from "./images/logo.jpg";
import { useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import TeamsPage from "./pages/TeamsPage";
import PlayersPage from "./pages/PlayersPage";
import AddTeamPage from "./pages/AddTeamPage";
import TeamDetailPage from "./pages/TeamDetailPage";
import AddPlayerPage from "./pages/AddPlayerPage";
import EditPlayerPage from "./pages/EditPlayerPage";
import MatchesPage from "./pages/MatchesPage";
import MatchDetailPage from "./pages/MatchDetailPage";
import AddMatchPage from "./pages/AddMatchPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/teams", label: "Teams", icon: Users },
  { path: "/players", label: "Players", icon: UserCheck },
  { path: "/matches", label: "Matches", icon: Calendar },
];

const quickActionItems = [
  { path: "/teams/new", label: "Add Team", icon: PlusCircle },
  { path: "/players/new", label: "Register Player", icon: UserPlus },
  { path: "/matches/new", label: "Schedule Match", icon: Calendar },
];

function SidebarContent({ isActive, onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    onNavigate?.();
    navigate("/login", { replace: true });
  }

  const displayName = user?.full_name || "User";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col h-full bg-[#9C513E] border-r border-[#b05c48]/40 text-[#fdf3ef]">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
        <div >
          <img
            src={logo}
            alt="Logo"
            className="w-8 h-8 rounded-md object-cover"
          />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-wider">
            cricket
          </h1>
          <span className="text-xs text-[#f8dccb] font-semibold uppercase tracking-widest">
            PRO LEAGUE
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-4 py-6 space-y-7 overflow-y-auto">
        <div className="space-y-1.5">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-[#f7dccf]/70">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-white/10 text-white border-l-4 border-[#f8d7cb] shadow-sm"
                    : "hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${active ? "text-[#fae1d5]" : "text-[#f7d8cb]/80"}`}
                />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="space-y-1.5">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-[#f7dccf]/70">
            Quick Actions
          </p>
          {quickActionItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-white/10 text-white border-l-4 border-[#f8d7cb] shadow-sm"
                    : "hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${active ? "text-[#fae1d5]" : "text-[#f7d8cb]/80"}`}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-white/10 bg-[#a8553f]/50 flex items-center gap-3">
        {user?.profile_picture ? (
          <img
            src={user.profile_picture}
            alt={displayName}
            className="w-9 h-9 rounded-full object-cover border border-white/25"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-[#fff3ee] font-bold">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {displayName}
          </p>
          <p className="text-xs text-[#f7dccf]/80 truncate">
            {user?.email}
          </p>
        </div>
        <button
          onClick={handleLogout}
          title="Log out"
          className="p-2 rounded-lg text-[#f7d8cb] hover:bg-white/10 hover:text-white transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Helper to determine if a route is active
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const isPublicAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  // Public auth pages render standalone, without the app shell.
  if (isPublicAuthPage) {
    return (
      <div className="min-h-screen bg-[#f7faf8] text-gray-800 font-sans">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7faf8] text-gray-800 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Navigation */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-[#9C513E] border-b border-[#b05c48]">
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt="Logo"
            className="w-6 h-6 rounded-md object-cover"
          />
          <span className="font-bold text-white tracking-wide">cricket</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-[#fdf3ef] hover:text-white p-1 rounded-md"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </header>

      {/* Desktop Sidebar (Persistent) */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0">
        <SidebarContent
          isActive={isActive}
          onNavigate={() => setMobileMenuOpen(false)}
        />
      </aside>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-[#4f2a20]/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          {/* Sidebar Panel */}
          <div className="relative w-64 max-w-xs flex-1 flex flex-col h-full bg-[#9C513E]">
            <div className="absolute top-0 right-0 p-4">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#f7d8cb] hover:text-white p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <SidebarContent
              isActive={isActive}
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-5 border-b border-cricket-border bg-white/80 backdrop-blur-md">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isActive("/") && "Dashboard Overview"}
              {isActive("/teams/new") && "Register New Team"}
              {location.pathname.match(/^\/teams\/\d+\/edit$/) && "Edit Team"}
              {isActive("/teams") &&
                !isActive("/teams/new") &&
                !location.pathname.match(/^\/teams\/\d+\/edit$/) &&
                "Teams Directory"}
              {isActive("/players/new") && "Register New Player"}
              {location.pathname.match(/^\/players\/\d+\/edit$/) &&
                "Edit Player"}
              {isActive("/players") &&
                !isActive("/players/new") &&
                !location.pathname.match(/^\/players\/\d+\/edit$/) &&
                "Players Directory"}
              {isActive("/matches") &&
                !isActive("/matches/new") &&
                "Matches & Schedule"}
              {isActive("/matches/new") && "Schedule Match"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage teams, players, schedules and scores in real-time.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-cricket-border">
              Season: <strong className="text-emerald-600">2026</strong>
            </span>
          </div>
        </header>

        {/* Dynamic Pages Area */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teams"
              element={
                <ProtectedRoute>
                  <TeamsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/players"
              element={
                <ProtectedRoute>
                  <PlayersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/matches"
              element={
                <ProtectedRoute>
                  <MatchesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teams/new"
              element={
                <ProtectedRoute>
                  <AddTeamPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teams/:teamId/edit"
              element={
                <ProtectedRoute>
                  <AddTeamPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/players/new"
              element={
                <ProtectedRoute>
                  <AddPlayerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/players/:playerId/edit"
              element={
                <ProtectedRoute>
                  <EditPlayerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/matches/new"
              element={
                <ProtectedRoute>
                  <AddMatchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teams/:teamId"
              element={
                <ProtectedRoute>
                  <TeamDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/matches/:matchId"
              element={
                <ProtectedRoute>
                  <MatchDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">Page not found.</p>
                    <Link
                      to="/"
                      className="text-emerald-600 hover:underline mt-2 inline-block"
                    >
                      Return to Dashboard
                    </Link>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
