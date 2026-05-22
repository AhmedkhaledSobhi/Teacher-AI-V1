/**
 * User data cache — persists the authenticated user object in localStorage so
 * that UI components can render correctly even when the app is offline and
 * NextAuth's /api/auth/session endpoint is unreachable.
 *
 * The cache is written every time a valid session is detected, and cleared on
 * explicit logout.  It is intentionally NOT used as a source of truth for auth
 * decisions — only for display / UX purposes.
 */

const USER_CACHE_KEY = "cached_user";

export interface CachedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  profile_image_url?: string | null;
  avatar_url?: string | null;
  grade_id?: number | string | null;
  term_id?: number | string | null;
  [key: string]: unknown;
}

/**
 * Persist the user object from a live session into localStorage.
 */
export function saveUserToCache(user: CachedUser): void {
  try {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  } catch {
    // Quota exceeded or private-browsing restriction — silently ignore.
  }
}

/**
 * Return the last cached user, or null if nothing has been saved yet.
 */
export function getCachedUser(): CachedUser | null {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachedUser;
  } catch {
    return null;
  }
}

/**
 * Remove the cached user (call on explicit logout).
 */
export function clearUserCache(): void {
  try {
    localStorage.removeItem(USER_CACHE_KEY);
  } catch {
    // ignore
  }
}
