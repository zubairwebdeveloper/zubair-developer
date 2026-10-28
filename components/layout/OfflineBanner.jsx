"use client";

import { RefreshCw, Wifi, WifiOff, X } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils/cn";

const RECONNECTED_VISIBLE_MS = 2500;
const CHECK_TIMEOUT_MS = 5000;

function subscribe(callback) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

/**
 * navigator.onLine only reports the network interface, not real internet access.
 * Any HTTP response (even a 404) proves the connection works; only a thrown error means offline.
 */
async function checkConnection() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

  try {
    await fetch(`/favicon.ico?ping=${Date.now()}`, {
      method: "HEAD",
      cache: "no-store",
      signal: controller.signal,
    });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

/** Tells the visitor when the connection drops, and briefly confirms when it returns. */
export function OfflineBanner() {
  // The server always renders "online", so there is never a hydration mismatch.
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
  const [justReconnected, setJustReconnected] = useState(false);
  const [forcedOnline, setForcedOnline] = useState(false); // retry proved the connection works
  const [dismissed, setDismissed] = useState(false);
  const [checking, setChecking] = useState(false);
  const [retryFailed, setRetryFailed] = useState(false);
  const wasOffline = useRef(false);

  const effectiveOnline = online || forcedOnline;

  // A real connection change resets everything the visitor did to the banner.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setForcedOnline(false);
      setDismissed(false);
      setRetryFailed(false);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [online]);

  useEffect(() => {
    if (!effectiveOnline) {
      wasOffline.current = true;
      const frame = window.requestAnimationFrame(() =>
        setJustReconnected(false),
      );
      return () => window.cancelAnimationFrame(frame);
    }

    if (wasOffline.current) {
      wasOffline.current = false;
      setJustReconnected(true);
      const timer = setTimeout(
        () => setJustReconnected(false),
        RECONNECTED_VISIBLE_MS,
      );
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [effectiveOnline]);

  async function handleRetry() {
    if (checking) return;
    setChecking(true);
    setRetryFailed(false);

    const connected = await checkConnection();

    setChecking(false);
    if (connected) setForcedOnline(true);
    else setRetryFailed(true);
  }

  const visible = (!effectiveOnline && !dismissed) || justReconnected;
  const Icon = effectiveOnline ? Wifi : WifiOff;

  const message = effectiveOnline
    ? "You are back online."
    : checking
      ? "Checking your connection…"
      : retryFailed
        ? "Still offline. Check your network and try again."
        : "You are offline. Some features may not work until your connection returns.";

  return (
    // The live region stays mounted so assistive tech reliably announces changes.
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] flex justify-center px-4 pt-[max(1rem,env(safe-area-inset-top))] print:hidden"
    >
      {visible ? (
        <div
          key={effectiveOnline ? "online" : "offline"}
          className={cn(
            "pointer-events-auto flex w-full max-w-md items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-lg motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:duration-200",
            effectiveOnline
              ? "bg-success text-success-foreground"
              : "bg-warning text-warning-foreground",
          )}
        >
          <Icon aria-hidden="true" className="size-4 shrink-0" />
          <span className="min-w-0 flex-1">{message}</span>

          {!effectiveOnline ? (
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={handleRetry}
                disabled={checking}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-warning-foreground/15 px-2.5 text-xs font-semibold transition-colors duration-200 hover:bg-warning-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning-foreground/70 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <RefreshCw
                  aria-hidden="true"
                  className={cn("size-3.5", checking && "animate-spin")}
                />
                {checking ? "Checking" : "Retry"}
              </button>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                aria-label="Dismiss offline notice"
                className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors duration-200 hover:bg-warning-foreground/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning-foreground/70"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
