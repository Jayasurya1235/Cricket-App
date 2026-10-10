import {
  Calendar,
  LayoutDashboard,
  PlusCircle,
  UserPlus,
  Users,
  UserCheck,
} from "lucide-react";

export const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/teams", label: "Teams", icon: Users },
  { to: "/players", label: "Players", icon: UserCheck },
  { to: "/matches", label: "Matches", icon: Calendar },
];

export const QUICK_ACTIONS = [
  { to: "/teams/new", label: "Add Team", icon: PlusCircle },
  { to: "/players/new", label: "Register Player", icon: UserPlus },
  { to: "/matches/new", label: "Schedule Match", icon: Calendar },
];

const AUTH_ROUTES = ["/login", "/register"];

export function isAuthRoute(pathname) {
  return AUTH_ROUTES.includes(pathname);
}

export function isNavItemActive(pathname, item) {
  if (item.end) return pathname === item.to;
  if (pathname === item.to) return true;
  return pathname.startsWith(`${item.to}/`);
}

export function isQuickActionActive(pathname, item) {
  return pathname === item.to;
}

/**
 * Resolves page chrome from the URL alone, so the shell never needs a second
 * source of truth that can drift out of sync with the route table.
 */
export function resolvePageMeta(pathname) {
  if (pathname === "/") {
    return {
      title: "Dashboard",
      description: "Overview of teams, players and fixtures.",
    };
  }

  const teamNew = /^\/teams\/new$/.test(pathname);
  const teamEdit = /^\/teams\/(\d+)\/edit$/.exec(pathname);
  const teamAnalytics = /^\/teams\/(\d+)\/analytics$/.exec(pathname);
  const teamDetail = /^\/teams\/(\d+)$/.exec(pathname);
  const playerNew = /^\/players\/new$/.exec(pathname);
  const playerEdit = /^\/players\/(\d+)\/edit$/.exec(pathname);
  const playerDetail = /^\/players\/(\d+)$/.exec(pathname);
  const matchScore = /^\/matches\/(\d+)\/score$/.exec(pathname);
  const matchSummary = /^\/matches\/(\d+)\/summary$/.exec(pathname);
  const matchDetail = /^\/matches\/(\d+)$/.exec(pathname);
  const matchNew = /^\/matches\/new$/.test(pathname);

  if (matchScore) {
    return {
      title: "Live Scoring",
      description: "Record deliveries ball by ball.",
      wide: true,
    };
  }
  if (matchSummary) {
    return {
      title: "Match Summary",
      description: "Result, milestones and per-team breakdown.",
    };
  }
  if (matchNew) {
    return {
      title: "Schedule Match",
      description: "Set up teams, venue, toss and officials.",
    };
  }
  if (matchDetail) {
    return { title: "Match Details", description: "Fixture, toss and result." };
  }
  if (teamEdit) {
    return { title: "Edit Team", description: "Update this team's profile." };
  }
  if (teamNew) {
    return { title: "Register Team", description: "Create a new team." };
  }
  if (teamAnalytics) {
    return {
      title: "Team Analytics",
      description: "Record, form and head-to-head breakdown.",
    };
  }
  if (teamDetail) {
    return { title: "Team", description: "Squad, roles and fixtures." };
  }
  if (playerEdit) {
    return { title: "Edit Player", description: "Update this player's profile." };
  }
  if (playerNew) {
    return { title: "Register Player", description: "Add a player to the registry." };
  }
  if (playerDetail) {
    return {
      title: "Player Analytics",
      description: "Profile, career and performance breakdown.",
    };
  }
  if (pathname.startsWith("/teams")) {
    return {
      title: "Teams",
      description: "Every registered club and its squad size.",
    };
  }
  if (pathname.startsWith("/players")) {
    return {
      title: "Players",
      description: "Registered players across all levels.",
    };
  }
  if (pathname.startsWith("/matches")) {
    return {
      title: "Matches",
      description: "Scheduled, live and completed fixtures.",
    };
  }

  return { title: "Page not found", description: "That page does not exist." };
}