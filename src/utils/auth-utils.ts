// Third-party Imports
import { signOut as nextAuthSignOut } from 'next-auth/react'
import type { SignOutParams, SignOutResponse } from 'next-auth/react'

// Local Imports
import { clearCurrentThreadId } from './localStorage'
import { clearUserCache } from './user-cache'

/**
 * The localStorage key used to broadcast a logout event to other tabs.
 * Other tabs listen for the `storage` event on this key and sign out when
 * they see it change to "true".  The value is removed again immediately so
 * repeated logouts can still be detected.
 */
export const LOGOUT_BROADCAST_KEY = 'auth_logout_event'

/**
 * Signals all other open tabs that this tab is logging out.
 * Uses two complementary mechanisms for maximum browser compatibility:
 *
 *  1. localStorage "storage" event — works across every browser and fires in
 *     every tab EXCEPT the one that made the change.
 *  2. BroadcastChannel (where supported) — lower-latency alternative; also
 *     fires only in OTHER tabs.
 *
 * Neither mechanism fires in the calling tab, so the caller is responsible
 * for running its own signOut() separately.
 */
function broadcastLogout(): void {
  if (typeof window === 'undefined') return

  // 1. localStorage signal — set then immediately remove so the same event
  //    can be triggered again later (storage events only fire on value change).
  try {
    localStorage.setItem(LOGOUT_BROADCAST_KEY, 'true')
    localStorage.removeItem(LOGOUT_BROADCAST_KEY)
  } catch {
    // localStorage may be unavailable in certain private-browsing modes
  }

  // 2. BroadcastChannel fast-path
  if ('BroadcastChannel' in window) {
    try {
      const channel = new BroadcastChannel('auth_session')
      channel.postMessage({ type: 'LOGOUT' })
      channel.close()
    } catch {
      // ignore
    }
  }
}

/**
 * Custom signOut function that always redirects to the login page
 * regardless of the callbackUrl provided.
 *
 * Also:
 *  - clears cached thread data for security and clean state
 *  - broadcasts the logout event to all other open tabs
 */
export async function signOut<R extends boolean = true>(
  options?: SignOutParams<R>
): Promise<R extends true ? undefined : SignOutResponse> {
  // Clear cached thread ID and user data before logout
  clearCurrentThreadId()
  clearUserCache()

  // Notify all other tabs before we navigate away
  broadcastLogout()

  // Override the callbackUrl to always redirect to login page
  const modifiedOptions = {
    ...options,
    callbackUrl: options?.callbackUrl || '/ar/login'
  }

  // Call the original NextAuth signOut function with our modified options
  return nextAuthSignOut(modifiedOptions)
}
