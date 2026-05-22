import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/libs/auth";
import { getLocalizedUrl } from "@/utils/i18n";
import type { Locale } from "@configs/i18n";

/**
 * Retrieves the NextAuth.js session on the server side.
 * @returns The session object, or null if no session exists.
 */
export async function getAuthFullSessionServer() {
  const session = await getServerSession(authOptions);
  return session;
}

/**
 * Retrieves the access token from the NextAuth.js session on the server side.
 * @returns The access token string, or null if no session or token exists.
 */
export async function getAuthTokenServer(): Promise<string | null> {
  const session = await getAuthFullSessionServer();
  // Check top-level accessToken first (set by session callback in libs/auth.ts),
  // then fall back to user.accessToken and nested session access_token
  return (
    (session as any)?.accessToken ||
    (session as any)?.user?.accessToken ||
    (session as any)?.session?.access_token ||
    null
  );
}

/**
 * Requires authentication - throws redirect if no session exists
 * Use this in server components and server actions to protect routes
 *
 * @param locale - Optional locale for localized redirect (defaults to 'ar')
 * @returns The session object (never null, as it redirects if no session)
 * @throws Redirects to login page if no session
 *
 * @example
 * ```ts
 * // In a server component
 * export default async function ProtectedPage({ params }: { params: { lang: Locale } }) {
 *   const session = await requireAuth(params.lang)
 *   // session is guaranteed to exist here
 *   return <div>Protected content for {session.user.email}</div>
 * }
 * ```
 *
 * @example
 * ```ts
 * // In a server action
 * 'use server'
 * export async function protectedAction() {
 *   const session = await requireAuth('ar')
 *   // session is guaranteed to exist here
 *   // ... your protected logic
 * }
 * ```
 */
export async function requireAuth(locale: Locale = "ar") {
  const session = await getServerSession(authOptions);

  if (!session) {
    const loginUrl = getLocalizedUrl("/login", locale);
    redirect(loginUrl);
  }

  return session;
}

/**
 * Checks if user is authenticated without redirecting
 * Use this when you need to conditionally render based on auth status
 *
 * @returns true if authenticated, false otherwise
 *
 * @example
 * ```ts
 * const isAuthenticated = await checkAuth()
 * if (isAuthenticated) {
 *   // Show protected content
 * } else {
 *   // Show public content
 * }
 * ```
 */
export async function checkAuth(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return !!session;
}
