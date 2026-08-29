// Authentication API layer.
//
// Currently the backend exposes NO auth endpoints, so this module provides a
// clean mock/dummy authentication layer that mirrors the interface a real API
// would expose. To switch to a real backend later, flip USE_MOCK to false and
// implement the real calls (see example in login/register below). Nothing else
// in the app needs to change, because the rest of the app only talks to the
// authContext, which uses the functions exported from this file.
// Uncomment the import below when wiring up a real API backend.
// import { apiClient } from "./client";

// A mock "accounts" store persisted to localStorage so that registered users
// survive a browser refresh. In a real implementation this lives on the server.
const MOCK_USERS_KEY = "cricket.mock.users";
const MOCK_DELAY_MS = 600;

const USE_MOCK = true;

const seedDemoUser = {
  id: "demo-user",
  name: "John Doe",
  email: "admin@cricketapp.in",
  password: "admin123",
  role: "admin",
};

function loadMockUsers() {
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY);
    const users = raw ? JSON.parse(raw) : [];
    // Always make sure the demo user exists so there is a known way in.
    if (!users.some((u) => u.email === seedDemoUser.email)) {
      users.push(seedDemoUser);
    }
    return users;
  } catch {
    return [seedDemoUser];
  }
}

function saveMockUsers(users) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toPublicUser(record) {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    role: record.role,
  };
}

// ---------------------------------------------------------------------------
// Session storage. In a real implementation the token would be returned by the
// backend and stored here; getCurrentUser would validate it against the API.
// ---------------------------------------------------------------------------
const SESSION_KEY = "cricket.auth.session";
const TOKEN_KEY = "cricket.auth.token";

export function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeSession(user, token) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// ---------------------------------------------------------------------------
// Public API used by authContext.
// ---------------------------------------------------------------------------

export async function login({ email, password }) {
  if (!USE_MOCK) {
    // Real API example:
    // const res = await apiClient.post("/auth/login", { email, password });
    // const token = res.data.access_token;
    // const user = res.data.user;
    // storeSession(user, token);
    // return user;
    throw new Error("Real auth backend is not configured.");
  }

  await delay();

  const users = loadMockUsers();
  const match = users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
  );
  if (!match || match.password !== password) {
    const error = new Error("Invalid email or password.");
    error.status = 401;
    throw error;
  }

  const user = toPublicUser(match);
  const token = `mock-token-${user.id}-${Date.now()}`;
  storeSession(user, token);
  return user;
}

export async function register({ name, email, password }) {
  if (!USE_MOCK) {
    // Real API example:
    // const res = await apiClient.post("/auth/register", { name, email, password });
    // const token = res.data.access_token;
    // const user = res.data.user;
    // storeSession(user, token);
    // return user;
    throw new Error("Real auth backend is not configured.");
  }

  await delay();

  const users = loadMockUsers();
  const normalizedEmail = email.trim().toLowerCase();
  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    const error = new Error(
      "An account with this email already exists. Try logging in instead.",
    );
    error.status = 409;
    throw error;
  }

  const record = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: "admin",
  };
  users.push(record);
  saveMockUsers(users);

  const user = toPublicUser(record);
  const token = `mock-token-${user.id}-${Date.now()}`;
  storeSession(user, token);
  return user;
}

export async function logout() {
  if (!USE_MOCK) {
    // await apiClient.post("/auth/logout");
    return;
  }
  await delay(150);
  clearStoredSession();
}

// Validates the current session. Mock mode trusts the stored session; a real
// implementation would call /auth/me with the stored token.
export async function getCurrentUser() {
  if (!USE_MOCK) {
    // const token = getStoredToken();
    // const res = await apiClient.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
    // return res.data.user;
    throw new Error("Real auth backend is not configured.");
  }
  return getStoredSession();
}

export const mockDemoCredentials = {
  email: seedDemoUser.email,
  password: seedDemoUser.password,
};
