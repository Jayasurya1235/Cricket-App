import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import GoogleLogo from "./GoogleLogo";
import { cn } from "../utils/cn";

const GIS_SRC = "https://accounts.google.com/gsi/client";
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const LOAD_TIMEOUT_MS = 8000;
const SCRIPT_ID = "google-identity-services";

let gisPromise = null;

function hasIdentityServices() {
  return Boolean(window.google?.accounts?.id);
}

function loadScript() {
  // The script may already be in the DOM and already finished loading (bfcache
  // restore, another copy injected, a hot reload). Attaching a "load" listener
  // in that case waits for an event that will never fire again, which used to
  // hang forever with no timeout able to rescue it. So: settle on the global
  // first, and put the timeout on this promise itself.
  if (hasIdentityServices()) return Promise.resolve();

  return new Promise((resolve, reject) => {
    let settled = false;
    const settle = (fn, value) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      fn(value);
    };
    const timer = window.setTimeout(
      () =>
        settle(
          reject,
          new Error(
            "Google Sign-In took too long to load. Check your connection and try again.",
          ),
        ),
      LOAD_TIMEOUT_MS,
    );

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => settle(resolve), { once: true });
      existing.addEventListener(
        "error",
        () => settle(reject, new Error("Failed to load Google Sign-In")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => settle(resolve), { once: true });
    script.addEventListener(
      "error",
      () => settle(reject, new Error("Failed to load Google Sign-In")),
      { once: true },
    );
    document.head.appendChild(script);
  });
}

function waitForGoogleIdentity(timeoutMs = LOAD_TIMEOUT_MS) {
  if (hasIdentityServices()) return Promise.resolve(window.google.accounts.id);

  return new Promise((resolve, reject) => {
    const start = Date.now();
    const timer = window.setInterval(() => {
      if (hasIdentityServices()) {
        window.clearInterval(timer);
        resolve(window.google.accounts.id);
      } else if (Date.now() - start > timeoutMs) {
        window.clearInterval(timer);
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
      .catch((error) => {
        gisPromise = null;
        throw error;
      });
  }
  return gisPromise;
}

// Display only. The server must verify this token; never trust these claims.
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

// Sign-in uses google.accounts.id.renderButton() only.
//
// One Tap (google.accounts.id.prompt) is intentionally disabled for now. It
// behaves differently once FedCM is active, the browser controls prompt
// placement, and the display-moment notifications it depends on
// (isNotDisplayed / getNotDisplayedReason / getSkippedReason) are no longer
// delivered, so the dismissal handling it needed cannot be trusted.
//
// To bring One Tap back after production origins and FedCM behaviour have been
// verified in a browser:
//   1. call accounts.prompt() after the button is rendered
//   2. handle only isDismissedMoment() + getDismissedReason() in the moment
//      listener, and drop the display/skip moment checks
//   3. never pass position / data-prompt_parent_id / intermediate_iframes
//   4. add allow="identity-credentials-get" to any parent cross-origin iframe
// The credential handling, script loader and backend exchange below are shared
// with One Tap, so none of it needs to change.

const MIN_BUTTON_WIDTH = 160;

export default function GoogleSignInButton({
  onToken,
  onError,
  onBusyChange,
  className,
  disabled = false,
}) {
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const hostRef = useRef(null);
  const mountedRef = useRef(true);
  const initializedRef = useRef(false);
  const credentialRef = useRef(() => {});

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const setBusyState = useCallback(
    (value) => {
      if (!mountedRef.current) return;
      setBusy(value);
      onBusyChange?.(value);
    },
    [onBusyChange],
  );

  // Latest callbacks, read through a ref so the render/initialize effect below
  // stays mount-only. Depending on them directly would tear down and redraw the
  // Google iframe on every parent render, since pages pass inline lambdas.
  const handlersRef = useRef({ onError, setBusyState });

  // Keep the ref in sync: pages pass inline lambdas, so these identities change
  // on every parent render. Without this the mount-only effect below would keep
  // calling the first render's callbacks.
  useEffect(() => {
    handlersRef.current = { onError, setBusyState };
  }, [onError, setBusyState]);

  const handleCredential = useCallback(
    (response) => {
      const idToken = response?.credential;
      if (!idToken) {
        setBusyState(false);
        return;
      }
      const payload = decodeJwtPayload(idToken);
      Promise.resolve(
        onToken(idToken, {
          full_name: payload?.name || payload?.given_name || undefined,
          profile_picture: payload?.picture || undefined,
        }),
      ).catch((error) => {
        setBusyState(false);
        onError?.(error?.message || "Google sign-in failed.");
      });
    },
    [onToken, onError, setBusyState],
  );

  useEffect(() => {
    credentialRef.current = handleCredential;
  }, [handleCredential]);

  // Report a missing client id up front: with a Google-rendered button there is
  // no click to hang an error message off, so this is the only chance to tell
  // the user why sign-in is unavailable.
  useEffect(() => {
    if (CLIENT_ID) return;
    handlersRef.current.onError?.(
      "Google sign-in isn't configured. Set VITE_GOOGLE_CLIENT_ID in your environment.",
    );
  }, []);

  // Warm the library, initialize exactly once, then render the Google button
  // into our host element. initialize() should be called only once per page;
  // calling it on every click used to stack callbacks.
  useEffect(() => {
    const host = hostRef.current;
    if (!CLIENT_ID || !host) return undefined;
    let cancelled = false;
    let observer = null;

    loadGoogleIdentity()
      .then((accounts) => {
        if (cancelled) return;
        if (!accounts?.initialize || !accounts?.renderButton) return;

        if (!initializedRef.current) {
          accounts.initialize({
            client_id: CLIENT_ID,
            callback: (response) => credentialRef.current(response),
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          initializedRef.current = true;
        }

        let lastWidth = 0;

        const draw = () => {
          if (cancelled) return;
          const width = Math.max(MIN_BUTTON_WIDTH, Math.floor(host.clientWidth));
          if (width === lastWidth) return;
          lastWidth = width;
          // renderButton injects an iframe and does not replace an existing
          // one, so clear the host before every draw to avoid stacking frames.
          host.replaceChildren();
          accounts.renderButton(host, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            logo_alignment: "left",
            width,
            click_listener: () => {
              handlersRef.current.setBusyState(true);
              handlersRef.current.onError?.("");
            },
          });
          if (mountedRef.current) setReady(true);
        };

        draw();

        if (typeof ResizeObserver !== "undefined") {
          observer = new ResizeObserver(draw);
          observer.observe(host);
        }
      })
      .catch((error) => {
        // Surfaced with context now that there is no click step to catch it.
        if (cancelled) return;
        handlersRef.current.onError?.(
          error?.message ||
            "Google Sign-In couldn't start. Check that Google is reachable and the page is served over https:// (or localhost).",
        );
      });

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, []);

  const interactive = ready && !disabled && !busy;

  return (
    <div className={cn("relative", className)} aria-busy={busy || undefined}>
      {/* Holds the same slot until the Google iframe exists so the card does
          not jump. Not interactive: the reason it is showing is surfaced
          through onError instead.

          This is a SIBLING of hostRef, never one of its children. Google owns
          everything inside hostRef and clears it with replaceChildren(), so if
          React also rendered children there, React's next render would try to
          remove a node Google had already detached — which throws
          "Failed to execute 'removeChild'" and, with no error boundary in the
          tree, blanks the entire page. */}
      {!ready && (
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 flex items-center justify-center gap-2.5 rounded-control border border-line-strong bg-surface px-4 text-sm font-semibold text-ink",
            (busy || disabled) && "opacity-60",
          )}
        >
          {busy ? (
            <Loader2
              className="size-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <GoogleLogo className="size-4" />
          )}
          {busy ? "Signing in with Google…" : "Continue with Google"}
        </div>
      )}
      {/* React renders this element empty and never gives it children, so the
          subtree belongs entirely to Google Identity Services. */}
      <div
        ref={hostRef}
        className={cn(
          "relative flex min-h-11 w-full justify-center",
          ready && !interactive && "pointer-events-none",
        )}
        inert={ready && !interactive ? true : undefined}
      />
    </div>
  );
}