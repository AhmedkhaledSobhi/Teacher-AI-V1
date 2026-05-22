"use client";

/**
 * useUser — drop-in replacement for `useSession()` that adds an offline
 * fallback layer on top of NextAuth.
 *
 * Behaviour:
 *  - Online + authenticated  → returns the live session user (same as useSession).
 *  - Loading / offline        → returns the last cached user from localStorage
 *                               with status "authenticated" so the UI keeps rendering.
 *  - Never authenticated      → returns null user with status "unauthenticated".
 *
 * The cache is written by <UserCacheSync> inside NextAuthProvider whenever a
 * live session is detected, and cleared on logout via clearUserCache().
 */

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getCachedUser, type CachedUser } from "@/utils/user-cache";

export type UserStatus = "loading" | "authenticated" | "unauthenticated";

export interface UseUserResult {
  /** The resolved user object — live from session or from the offline cache. */
  user: (CachedUser & Record<string, unknown>) | null;
  /** NextAuth-compatible status string. */
  status: UserStatus;
  /** True while we are resolving the session (not yet confirmed online or offline). */
  isLoading: boolean;
  /** True when the user data comes from the local cache (app is offline). */
  isFromCache: boolean;
  /** The raw NextAuth session — null when offline. */
  accessToken: string | undefined;
}

export function useUser(): UseUserResult {
  const { data: session, status } = useSession();

  // Initialise from cache immediately so there is no flash of empty UI.
  const [cachedUser, setCachedUser] = useState<CachedUser | null>(() => {
    if (typeof window !== "undefined") return getCachedUser();
    return null;
  });

  // Keep the cached value fresh whenever the session resolves.
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setCachedUser(session.user as CachedUser);
    }
  }, [status, session]);

  // Determine what to expose.
  if (status === "authenticated" && session?.user) {
    return {
      user: session.user as CachedUser & Record<string, unknown>,
      status: "authenticated",
      isLoading: false,
      isFromCache: false,
      accessToken: session.accessToken as string | undefined,
    };
  }

  if (status === "unauthenticated") {
    return {
      user: null,
      status: "unauthenticated",
      isLoading: false,
      isFromCache: false,
      accessToken: undefined,
    };
  }

  // status === "loading" — return cached data so UI does not blank out.
  if (cachedUser) {
    return {
      user: cachedUser as CachedUser & Record<string, unknown>,
      status: "authenticated",
      isLoading: false,
      isFromCache: true,
      accessToken: undefined,
    };
  }

  // Genuinely loading with no cache available yet.
  return {
    user: null,
    status: "loading",
    isLoading: true,
    isFromCache: false,
    accessToken: undefined,
  };
}
