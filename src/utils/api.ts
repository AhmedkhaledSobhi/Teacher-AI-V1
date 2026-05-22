/**
 * Utility functions for API requests
 * This file provides a standardized way to interact with the backend API
 */

import { getSession } from "next-auth/react";
import { toast } from "react-toastify";
import { getErrorMessage, handleApiError } from "./toast-utils";

// Import auth redirect utilities (only in client components)
let authRedirect: {
  handleAuthError: (status: number, errorMessage?: string) => boolean;
} | null = null;

// Dynamically import auth-redirect in client environment to avoid SSR issues
if (typeof window !== "undefined") {
  import("./auth-redirect")
    .then((module) => {
      authRedirect = module.default;
    })
    .catch((err) => {
      console.error("Failed to load auth-redirect module:", err);
    });
}

type RequestOptions = {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: any;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
  skipAuthRedirect?: boolean; // Option to skip auth redirect for specific requests
  skipErrorToast?: boolean; // Option to skip showing error toast for specific requests
  customErrorHandler?: (error: Error) => void; // Custom error handler function
};

type NextFetchRequestConfig = {
  revalidate?: number | false;
  tags?: string[];
};

// getErrorMessage is now imported from toast-utils

/**
 * Constructs a URL with query parameters
 */
const buildUrl = (url: string, params?: Record<string, string>): string => {
  if (!params) return url;

  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value);
    }
  });

  const queryString = queryParams.toString();
  return queryString ? `${url}?${queryString}` : url;
};

/**
 * Base function to make API requests
 */
const fetchApi = async <T>(
  url: string,
  method: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { headers = {}, params, body, cache, next } = options;

  // Use backend URL for all /api/v1/ calls so they go directly to the backend
  // with Bearer token instead of through the Next.js proxy with cookies
  const isBackendCall = url.startsWith("/api/v1/");
  const baseUrl = isBackendCall
    ? process.env.NEXT_PUBLIC_BACKEND_URL || ""
    : "";
  const fullUrl = baseUrl + url;
  const requestUrl = buildUrl(fullUrl, params);

  // Get authentication headers for any API call that goes to the backend
  let authHeaders: Record<string, string> = {};
  if (isBackendCall) {
    try {
      const session = await getSession();
      const accessToken =
        session?.accessToken || session?.session?.access_token;
      const userId = session?.user?.id;

      if (accessToken) {
        authHeaders = {
          Authorization: `Bearer ${accessToken}`,
        };
        if (userId) {
          authHeaders["X-User-ID"] = userId;
        }
      } else {
        console.warn("No access token available for authenticated API call:", url);
      }
    } catch (error) {
      console.warn("Failed to get session for authentication:", error);
    }
  }

  const requestOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headers,
    },
    cache,
    next,
  };

  if (body && method !== "GET") {
    requestOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(requestUrl, requestOptions);

    // Check if response content type is JSON
    const contentType = response.headers.get("content-type");
    const isJsonResponse =
      contentType && contentType.includes("application/json");

    if (!response.ok) {
      // Handle different error status codes
      let errorData: any = {};
      let errorMessage = `Request failed with status ${response.status}`;

      if (isJsonResponse) {
        errorData = await response.json().catch(() => ({}));
        errorMessage = errorData.message || errorMessage;
      } else {
        // If response is not JSON (e.g., HTML error page), get text for debugging
        const errorText = await response.text().catch(() => "");
        console.error("Non-JSON error response:", errorText.substring(0, 200));
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }

      // Handle 401/403 responses by redirecting to login (client-side only)
      const isAuthError = response.status === 401 || response.status === 403;
      if (isAuthError && !options.skipAuthRedirect) {
        if (typeof window !== "undefined") {
          if (authRedirect) {
            authRedirect.handleAuthError(response.status, errorMessage);
          } else {
            // Fallback: hard-navigate to signout to avoid CLIENT_FETCH_ERROR
            const locale = window.location.pathname.split("/")[1] || "ar";
            window.location.href = `/api/auth/signout?callbackUrl=/${locale}/login`;
          }
        }
      }

      // Show error toast for non-auth errors or if auth redirect is skipped
      if (
        (!isAuthError || options.skipAuthRedirect) &&
        !options.skipErrorToast &&
        typeof window !== "undefined"
      ) {
        handleApiError(errorMessage);
      }

      throw new Error(errorMessage);
    }

    // For 204 No Content responses
    if (response.status === 204) {
      return {} as T;
    }

    // Check if successful response is JSON before parsing
    if (!isJsonResponse) {
      const responseText = await response.text();

      // Only log error on client side to avoid server-side issues during deployment
      if (typeof window !== "undefined") {
        console.error(
          "Expected JSON response but got:",
          responseText.substring(0, 200)
        );
        console.error("Full URL:", requestUrl);
        console.error("Response status:", response.status);
      }

      // Return empty object instead of throwing to handle gracefully on client side
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    console.error("API request error:", error);

    // Handle unexpected errors (network issues, etc.)
    if (!options.skipErrorToast && typeof window !== "undefined") {
      // Use custom error handler if provided, otherwise show toast
      if (options.customErrorHandler) {
        options.customErrorHandler(
          error instanceof Error ? error : new Error(getErrorMessage(error))
        );
      } else {
        handleApiError(error);
      }
    }

    throw error;
  }
};

/**
 * GET request
 */
export const get = <T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> => {
  return fetchApi<T>(url, "GET", options);
};

/**
 * POST request
 */
export const post = <T>(
  url: string,
  body: any,
  options: RequestOptions = {}
): Promise<T> => {
  return fetchApi<T>(url, "POST", { ...options, body });
};

/**
 * PUT request
 */
export const put = <T>(
  url: string,
  body: any,
  options: RequestOptions = {}
): Promise<T> => {
  return fetchApi<T>(url, "PUT", { ...options, body });
};

/**
 * PATCH request
 */
export const patch = <T>(
  url: string,
  body: any,
  options: RequestOptions = {}
): Promise<T> => {
  return fetchApi<T>(url, "PATCH", { ...options, body });
};

/**
 * DELETE request
 */
export const del = <T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> => {
  return fetchApi<T>(url, "DELETE", options);
};

/**
 * API utilities for common operations
 */
export const api = {
  get,
  post,
  put,
  patch,
  delete: del,
};

export default api;
