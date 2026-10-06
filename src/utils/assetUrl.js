import { API_BASE_URL } from "../api/client";

// Uploaded files are persisted as root-relative paths: TeamLogoResponse.logo
// is documented as "/uploads/teams/17.png", and PlayerProfileImageResponse
// does the same for "/uploads/players/32.png". Those are served by the API
// host, which is not necessarily the host the app itself is served from.
//
// With the default same-origin base ("/api", proxied by Vite in development)
// the value already points at the right place and is returned untouched. When
// VITE_API_BASE_URL is an absolute URL the two origins differ, so the path has
// to be re-based onto the API origin or the browser requests it from the app
// host and gets a 404.
export function resolveAssetUrl(value) {
  if (typeof value !== "string" || value === "") return null;

  // Absolute (https://…, //cdn…), data: and blob: URLs need no re-basing.
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value)) return value;
  if (!value.startsWith("/")) return value;
  if (!/^https?:\/\//i.test(API_BASE_URL)) return value;

  try {
    return new URL(API_BASE_URL).origin + value;
  } catch {
    return value;
  }
}

export default resolveAssetUrl;
