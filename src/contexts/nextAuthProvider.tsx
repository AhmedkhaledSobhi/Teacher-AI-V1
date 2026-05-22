"use client";

// React Imports
import { useEffect, useRef } from "react";

// Third-party Imports
import { SessionProvider, signOut, useSession } from "next-auth/react";
import type { SessionProviderProps } from "next-auth/react";

// Local Imports
import { LOGOUT_BROADCAST_KEY } from "@/utils/auth-utils";
import { saveUserToCache, clearUserCache } from "@/utils/user-cache";

const LOGOUT_REDIRECT = "/ar/login";

// Writes the live user to localStorage whenever the session resolves, and
// clears the cache when the session transitions to unauthenticated (logout).
function UserCacheSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      saveUserToCache(session.user as any);
    } else if (status === "unauthenticated") {
      clearUserCache();
    }
  }, [status, session]);

  return null;
}

// Watches for session expiry and redirects to login when the session
// transitions from "authenticated" to "unauthenticated" on a protected page.
// This catches token expiry that happens between refetch intervals.
function SessionExpiryWatcher() {
  const { status } = useSession();
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    if (status === "authenticated") {
      wasAuthenticated.current = true;
    } else if (status === "unauthenticated" && wasAuthenticated.current) {
      // Session expired mid-session — force logout and redirect
      wasAuthenticated.current = false;
      const locale =
        typeof window !== "undefined"
          ? window.location.pathname.split("/")[1] || "ar"
          : "ar";
      signOut({ redirect: false }).then(() => {
        window.location.href = `/${locale}/login`;
      });
    }
  }, [status]);

  return null;
}

// Inner component that subscribes to cross-tab auth events.
// Must be a child of SessionProvider so signOut() works correctly.
//
// Two complementary mechanisms are used so every browser is covered:
//  1. localStorage "storage" event — fires in all tabs except the writer.
//  2. BroadcastChannel — lower-latency; also fires in all tabs except sender.
function CrossTabAuthSync() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Shared handler — called by whichever listener fires first.
    // The `redirect: false` version avoids a double-redirect race when both
    // mechanisms fire nearly simultaneously; we navigate manually instead.
    const handleLogoutFromOtherTab = () => {
      signOut({ redirect: false }).then(() => {
        window.location.href = LOGOUT_REDIRECT;
      });
    };

    // 1. localStorage storage event (most compatible)
    const handleStorage = (event: StorageEvent) => {
      if (event.key === LOGOUT_BROADCAST_KEY) {
        handleLogoutFromOtherTab();
      }
    };
    window.addEventListener("storage", handleStorage);

    // 2. BroadcastChannel fast-path (where supported)
    let channel: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel("auth_session");
      channel.onmessage = (event) => {
        if (event.data?.type === "LOGOUT") {
          handleLogoutFromOtherTab();
        }
      };
    }

    return () => {
      window.removeEventListener("storage", handleStorage);
      channel?.close();
    };
  }, []);

  return null;
}

export const NextAuthProvider = ({
  children,
  ...rest
}: SessionProviderProps) => {
  return (
    <SessionProvider
      // Re-check session every 5 minutes so stale sessions are caught quickly
      refetchInterval={5 * 60}
      // Re-check session when the user switches back to this tab
      refetchOnWindowFocus={true}
      {...rest}
    >
      <CrossTabAuthSync />
      <UserCacheSync />
      <SessionExpiryWatcher />
      {children}
    </SessionProvider>
  );
};
