"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

function subscribeToConnection(callback) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getOnline() {
  return navigator.onLine;
}

function getServerOnline() {
  return true;
}

export function ConnectionStatus() {
  const online = useSyncExternalStore(
    subscribeToConnection,
    getOnline,
    getServerOnline,
  );
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    let timer;

    const handleOffline = () => {
      clearTimeout(timer);
      setJustReconnected(false);
    };

    const handleOnline = () => {
      setJustReconnected(true);
      clearTimeout(timer);
      timer = setTimeout(() => setJustReconnected(false), 3000);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const message = !online
    ? "You're offline. Some features may not work until your connection returns."
    : justReconnected
      ? "You're back online."
      : "";

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 left-4 right-20 z-50 sm:right-auto sm:max-w-sm print:hidden"
    >
      {message ? (
        <p className="pointer-events-auto rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground shadow-md">
          {message}
        </p>
      ) : null}
    </div>
  );
}
