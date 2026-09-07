import axios from "axios";

const TOKEN_KEY = "cricket.auth.token";

export const apiClient = axios.create({
  baseURL: "/api",
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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("cricket.auth.session");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export function extractErrorMessage(error) {
  const detail = error?.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail.map((e) => `${e.loc[e.loc.length - 1]}: ${e.msg}`).join(", ");
  }
  if (typeof detail === "string") return detail;
  if (error?.response?.status === 401) return "Invalid email or password.";
  if (error?.response?.status === 404) return "Not found";
  if (error?.response?.status === 409) return "An account with this email already exists.";
  if (error?.message === "Network Error") return "Cannot reach server";
  return "Something went wrong. Please try again.";
}
