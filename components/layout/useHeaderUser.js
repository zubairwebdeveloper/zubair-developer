"use client";

import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { getClientAuth } from "@/lib/firebase/client";

/** Gives the header the signed-in user and a sign-out function. */
export function useHeaderUser() {
  const router = useRouter();
  const [state, setState] = useState({ user: null, loading: true });

  useEffect(() => {
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
  }, []);

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

  return { ...state, signOut };
}
