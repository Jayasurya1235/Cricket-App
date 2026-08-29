import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Turns FastAPI's 422 validation error array into a readable string
export function extractErrorMessage(error) {
  const detail = error?.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail.map((e) => `${e.loc[e.loc.length - 1]}: ${e.msg}`).join(", ");
  }
  if (error?.response?.status === 404) return "Not found";
  if (error?.message === "Network Error") return "Cannot reach server";
  return "Something went wrong. Please try again.";
}
