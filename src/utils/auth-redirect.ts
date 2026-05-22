/**
 * Utility for handling authentication redirects
 * This file provides functions to handle authentication failures and redirect to login
 */

"use client";

import { signOut } from "./auth-utils";

/**
 * Handles 401 Unauthorized responses by redirecting to login
 * @param status - HTTP status code
 * @param errorMessage - Optional error message
 * @returns boolean - true if handled (401), false otherwise
 */
export const handleAuthError = (
  status: number,
  errorMessage?: string
): boolean => {
  if (status === 401 || status === 403) {
    console.warn(
      status === 401 ? "Authentication failed:" : "Authorization failed:",
      errorMessage || (status === 401 ? "Unauthorized" : "Forbidden")
    );

    // Redirect to login page
    redirectToLogin();
    return true;
  }

  return false;
};

/**
 * Redirects the user to the login page
 * Uses NextAuth signOut which handles the redirect
 */
export const redirectToLogin = async (): Promise<void> => {
  try {
    // Use the custom signOut function that always redirects to login
    await signOut({ redirect: true, callbackUrl: "/ar/login" });
  } catch (error) {
    console.error("Failed to redirect to login:", error);

    // Fallback if signOut fails
    window.location.href = "/ar/login";
  }
};

export default {
  handleAuthError,
  redirectToLogin,
};
