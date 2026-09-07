import { useState } from "react";
import GoogleLogo from "./GoogleLogo";

const GIS_SRC = "https://accounts.google.com/gsi/client";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const LOAD_TIMEOUT_MS = 8000;

let gisPromise = null;

function loadScript() {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GIS_SRC}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => {
        existing.dataset.loaded = "true";
        resolve();
      });
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.defer = true;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load Google Sign-In"));
    document.head.appendChild(script);
  });
}

function waitForGoogleIdentity(timeoutMs = LOAD_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve(window.google.accounts.id);
      return;
    }
    const start = Date.now();
    const timer = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(timer);
        resolve(window.google.accounts.id);
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(timer);
        reject(
          new Error(
            "Google Sign-In couldn't start. Check that Google is reachable and the page is served over https:// (or localhost).",
          ),
        );
      }
    }, 120);
  });
}

function loadGoogleIdentity() {
  if (!gisPromise) {
    gisPromise = loadScript()
      .then(() => waitForGoogleIdentity())
      .catch((err) => {
        gisPromise = null;
        throw err;
      });
  }
  return gisPromise;
}

function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(
      decodeURIComponent(
        atob(normalized)
          .split("")
          .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join(""),
      ),
    );
  } catch {
    return null;
  }
}

/**
 * "Continue with Google" button backed by Google Identity Services (popup).
 * Obtains an id_token and hands it to the parent via onToken(idToken, profile).
 */
export default function GoogleSignInButton({
  onToken,
  onError,
  className = "",
}) {
  const [busy, setBusy] = useState(false);

  function handleCredential(response) {
    const idToken = response?.credential;
    if (!idToken) return;
    const payload = decodeJwtPayload(idToken);
    const profile = {
      full_name: payload?.name || payload?.given_name || undefined,
      profile_picture: payload?.picture || undefined,
    };
    onToken(idToken, profile);
  }

  async function handleClick() {
    setBusy(true);
    onError?.("");

    if (!CLIENT_ID) {
      setBusy(false);
      onError?.(
        "Google sign-in isn't configured. Set VITE_GOOGLE_CLIENT_ID in your environment.",
      );
      return;
    }

    try {
      const accounts = await loadGoogleIdentity();
      if (!accounts?.initialize) {
        throw new Error(
          "Google Sign-In is unavailable on this browser (check site security or extensions).",
        );
      }
      accounts.initialize({
        client_id: CLIENT_ID,
        auto_select: false,
        cancel_on_tap_outside: true,
        ux_mode: "popup",
        callback: (response) => {
          setBusy(false);
          handleCredential(response);
        },
      });
      accounts.prompt((notification) => {
        if (
          notification.isNotDisplayed() ||
          notification.isSkippedMoment() ||
          notification.isDismissedMoment()
        ) {
          setBusy(false);
        }
      });
    } catch (err) {
      setBusy(false);
      onError?.(
        err?.message || "Something went wrong starting Google sign-in.",
      );
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-60 text-gray-700 rounded-lg text-sm font-semibold transition shadow-sm"
      >
        <GoogleLogo className="w-4 h-4" />
        {busy ? "Signing in with Google..." : "Continue with Google"}
      </button>
    </div>
  );
}
