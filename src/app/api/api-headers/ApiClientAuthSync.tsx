"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import apiClient from "@/app/server/utils/ApiClient";
import { clearCurrentThreadId } from "@/utils/localStorage";
import { LOGOUT_BROADCAST_KEY } from "@/utils/auth-utils";

const ApiClientAuthSync: React.FC = () => {
  const { data: session } = useSession();
  const isSigningOutRef = useRef(false);

  useEffect(() => {
    // Set the auth token whenever the session changes (e.g., login, logout, refresh)
    apiClient.setAuthToken(session?.accessToken || null);
  }, [session?.accessToken]);

  useEffect(() => {
    // Register a handler so any 403 response from the API triggers a full logout.
    // We avoid calling next-auth's signOut() (which fetches /api/auth/signout) because
    // that fetch itself can fail with CLIENT_FETCH_ERROR when the session is already
    // invalidated. Instead we clear local state and hard-navigate to the logout endpoint
    // which destroys the server-side session cookie directly.
    apiClient.setUnauthorizedHandler(() => {
      if (isSigningOutRef.current) return;
      isSigningOutRef.current = true;

      // Clear cached thread data
      clearCurrentThreadId();

      // Broadcast logout to other open tabs
      try {
        localStorage.setItem(LOGOUT_BROADCAST_KEY, "true");
        localStorage.removeItem(LOGOUT_BROADCAST_KEY);
      } catch {
        // ignore
      }
      if ("BroadcastChannel" in window) {
        try {
          const channel = new BroadcastChannel("auth_session");
          channel.postMessage({ type: "LOGOUT" });
          channel.close();
        } catch {
          // ignore
        }
      }

      // Hard-navigate to the next-auth signout URL with redirect back to login.
      // Using window.location avoids any pending fetch calls that cause CLIENT_FETCH_ERROR.
      const locale = window.location.pathname.split("/")[1] || "ar";
      window.location.href = `/api/auth/signout?callbackUrl=/${locale}/login`;
    });

    return () => {
      apiClient.setUnauthorizedHandler(null);
    };
  }, []);

  return null;
};

export default ApiClientAuthSync;
