import axios from "axios";

const TOKEN_KEY = "cricket.auth.token";

// The API paths in this folder are all written relative to the base URL
// (e.g. "/matches", "/locations"), so the version segment lives in the base
// URL rather than being repeated in every call.
//
// The default is the same-origin "/api" path served by the Vite dev server and
// proxied to https://cricketapp.in/v1 (see vite.config.js). It must NOT
// default to the absolute production URL: cricketapp.in returns no
// Access-Control-* headers and answers the CORS preflight with 405, so a
// browser on http://localhost:5173 cannot reach it cross-origin. Going through
// the proxy keeps every call same-origin, which also preserves the required
// "/v1" prefix upstream via the proxy rewrite.
//
// A deployed build needs an absolute URL instead, because there is no dev
// proxy in production; set VITE_API_BASE_URL to the real backend origin there
// and ensure that backend sends CORS headers.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Endpoints where a 401 is the expected answer to "these credentials are
// wrong", not proof that the stored session went stale. Redirecting on those
// wiped the session and threw the user off /register (and off any auth error
// the page was about to render) before it could show the message.
const AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/google",
  "/auth/register",
  "/auth/register/send-otp",
  "/auth/register/verify-otp",
  "/auth/forgot-password",
];

function isAuthEndpoint(url) {
  if (!url) return false;
  const path = url.split("?")[0];
  return AUTH_ENDPOINTS.some(
    (endpoint) => path === endpoint || path.startsWith(`${endpoint}/`),
  );
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 && !isAuthEndpoint(error?.config?.url)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("cricket.auth.session");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

function detailToMessage(error) {
  const detail = error?.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail
      .map((e) => {
        const field = Array.isArray(e?.loc) ? e.loc[e.loc.length - 1] : null;
        const msg = e?.msg || "is invalid";
        return field ? `${field}: ${msg}` : msg;
      })
      .join(", ");
  }
  if (typeof detail === "string") return detail;

  // Some handlers return a bare { message } or { error } body.
  const body = error?.response?.data;
  if (body && typeof body === "object") {
    if (typeof body.message === "string") return body.message;
    if (typeof body.error === "string") return body.error;
  }
  return null;
}

export function extractErrorMessage(error) {
  if (!error) return "Something went wrong. Please try again.";

  // Transport-level failures: no HTTP response was ever received. Only these
  // are connection problems — every status below arrived from the server.
  if (!error.response) {
    if (error.code === "ECONNABORTED" || /timeout/i.test(error.message || "")) {
      return "The server took too long to respond. Please try again.";
    }
    if (error.message === "Network Error") {
      return "Cannot reach the server. Check your internet connection.";
    }
    return error.message || "Cannot reach the server.";
  }

  // A structured message from the backend always wins over our generic text.
  const fromDetail = detailToMessage(error);
  if (fromDetail) return fromDetail;

  const status = error.response.status;
  if (status === 400) return "The request was rejected as invalid.";
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You don't have permission to do that.";
  if (status === 404) return "Not found";
  if (status === 409) return "That record already exists.";
  if (status === 422) return "Some of the details provided are invalid.";
  if (status === 429) return "Too many attempts. Please wait and try again.";
  if (status >= 500) return "The server ran into a problem. Please try again.";

  return "Something went wrong. Please try again.";
}
