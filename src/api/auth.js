import { apiClient } from "./client";

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

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

function storeSession(user, token) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);
}

export async function login({ email, password }) {
  const res = await apiClient.post("/auth/login", { email, password });
  const { access_token, user } = res.data;
  storeSession(user, access_token);
  return user;
}

export async function googleLogin(idToken, profile) {
  const res = await apiClient.post("/auth/google", {
    id_token: idToken,
    full_name: profile?.full_name || undefined,
    profile_picture: profile?.profile_picture || undefined,
  });
  const { access_token, user } = res.data;
  storeSession(user, access_token);
  return user;
}

export async function register({ email, password, full_name }) {
  const res = await apiClient.post("/auth/register", {
    email,
    password,
    full_name: full_name || undefined,
  });
  const { access_token, user } = res.data;
  storeSession(user, access_token);
  return user;
}

export async function sendRegisterOtp(email) {
  const res = await apiClient.post("/auth/register/send-otp", { email });
  return res.data;
}

export async function verifyRegisterOtp({ email, otp_code }) {
  const res = await apiClient.post("/auth/register/verify-otp", {
    email,
    otp_code,
  });
  return res.data;
}

export async function logout() {
  clearStoredSession();
}

export async function getCurrentUser() {
  const token = getStoredToken();
  if (!token) {
    clearStoredSession();
    throw new Error("No stored token");
  }
  try {
    const res = await apiClient.get("/auth/me");
    const user = res.data;
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  } catch {
    clearStoredSession();
    throw new Error("Session expired");
  }
}
