"use client";

import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { getClientAuth } from "@/lib/firebase/client";

/** Gives the header the signed-in user and a sign-out function. */
export function useHeaderUser({ enabled = true } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState({ user: null, loading: true });
  const [canAccessDashboard, setCanAccessDashboard] = useState(false);

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;
    let unsubscribe = () => {};

    (async () => {
      try {
        // Works whether getClientAuth() returns the instance or a Promise of it.
        const auth = await getClientAuth();

        if (cancelled) return;
        if (!auth) {
          setState({ user: null, loading: false });
          return;
        }

        unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          setCanAccessDashboard(false);
          setState({
            loading: false,
            user: firebaseUser
              ? {
                  name: firebaseUser.displayName ?? "",
                  email: firebaseUser.email ?? "",
                  photoURL: firebaseUser.photoURL ?? "",
                }
              : null,
          });
        });
      } catch (error) {
        console.error("[useHeaderUser] Firebase auth unavailable:", error);
        if (!cancelled) setState({ user: null, loading: false });
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !state.user) return undefined;

    let cancelled = false;

    async function checkDashboardAccess() {
      try {
        const response = await fetch("/api/admin/session", {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Dashboard access check failed (${response.status}).`);
        }
        const result = await response.json();
        if (!cancelled) {
          setCanAccessDashboard(result.canAccessDashboard === true);
        }
      } catch (error) {
        console.error("[useHeaderUser] Dashboard access check failed:", error);
        if (!cancelled) setCanAccessDashboard(false);
      }
    }

    checkDashboardAccess();
    return () => {
      cancelled = true;
    };
  }, [enabled, pathname, state.user]);

  const signOut = useCallback(async () => {
    try {
      // Clear the server session cookie too (ignored if the route has no DELETE).
      await fetch("/api/admin/session", { method: "DELETE" });
    } catch {
      // Network failure here should not block the client sign out.
    }

    const auth = await getClientAuth();
    if (auth) await firebaseSignOut(auth);
    router.refresh();
  }, [router]);

  return { ...state, canAccessDashboard, signOut };
}
